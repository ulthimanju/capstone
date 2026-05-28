package com.questly.user.service;

import com.questly.user.model.UserStats;
import com.questly.user.repository.UserProfileRepository;
import com.questly.user.repository.UserStatsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceIntegrationTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserStatsRepository userStatsRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private UserService userService;

    private UUID userId;
    private UserStats stats;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        stats = new UserStats();
        stats.setUserId(userId);
        stats.setStreak(0);
        stats.setXp(0);
        stats.setLastActive(null);
    }

    /**
     * Case 1: Timezone cache is empty/cold.
     * Expected behavior: Graces back to UTC, sets streak to 1, and updates lastActive.
     */
    @Test
    void testEvaluateStreak_ColdCacheFallbackToUTC() {
        // Arrange
        when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:timezone:" + userId)).thenReturn(null); // Cold Cache

        Instant eventTime = Instant.parse("2026-05-28T10:00:00Z");

        // Act
        userService.evaluateStreak(userId, eventTime);

        // Assert
        assertEquals(1, stats.getStreak());
        assertNotNull(stats.getLastActive());
        
        // Ensure UTC date is parsed
        LocalDate lastActiveLocalDate = stats.getLastActive().atZoneSameInstant(ZoneId.of("UTC")).toLocalDate();
        assertEquals(LocalDate.parse("2026-05-28"), lastActiveLocalDate);

        verify(userStatsRepository, times(1)).save(stats);
        verify(valueOperations, times(1)).set(eq("user:streak:" + userId), eq("1"), anyLong(), any());
    }

    /**
     * Case 2: Timezone is cached in Redis (e.g. New York offset).
     * Expected behavior: Handles offset local conversions and registers initial streak.
     */
    @Test
    void testEvaluateStreak_NewYorkTimezoneCache() {
        // Arrange
        when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:timezone:" + userId)).thenReturn("America/New_York");

        // 10:00 AM UTC is 6:00 AM New York on May 28
        Instant eventTime = Instant.parse("2026-05-28T10:00:00Z");

        // Act
        userService.evaluateStreak(userId, eventTime);

        // Assert
        assertEquals(1, stats.getStreak());
        LocalDate newYorkLocalDate = stats.getLastActive().atZoneSameInstant(ZoneId.of("America/New_York")).toLocalDate();
        assertEquals(LocalDate.parse("2026-05-28"), newYorkLocalDate);

        verify(userStatsRepository, times(1)).save(stats);
    }

    /**
     * Case 3: Same day learning event (double-counting prevention).
     * Expected behavior: Maintain current streak value, update only timestamp to latest.
     */
    @Test
    void testEvaluateStreak_SameDayMaintainsStreak() {
        // Arrange
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        Instant firstEvent = Instant.parse("2026-05-28T05:00:00Z"); // 10:30 AM IST
        stats.setStreak(3);
        stats.setLastActive(OffsetDateTime.ofInstant(firstEvent, zone));

        when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:timezone:" + userId)).thenReturn("Asia/Kolkata");

        Instant secondEventLaterSameDay = Instant.parse("2026-05-28T15:00:00Z"); // 8:30 PM IST

        // Act
        userService.evaluateStreak(userId, secondEventLaterSameDay);

        // Assert
        assertEquals(3, stats.getStreak()); // Stays same
        LocalDate lastActiveLocalDate = stats.getLastActive().atZoneSameInstant(zone).toLocalDate();
        assertEquals(LocalDate.parse("2026-05-28"), lastActiveLocalDate);

        verify(userStatsRepository, times(1)).save(stats);
    }

    /**
     * Case 4: Consecutive day learning event.
     * Expected behavior: Increments streak by 1.
     */
    @Test
    void testEvaluateStreak_ConsecutiveDayIncrementsStreak() {
        // Arrange
        ZoneId zone = ZoneId.of("UTC");
        Instant yesterdayEvent = Instant.parse("2026-05-27T14:00:00Z");
        stats.setStreak(5);
        stats.setLastActive(OffsetDateTime.ofInstant(yesterdayEvent, zone));

        when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:timezone:" + userId)).thenReturn("UTC");

        Instant todayEvent = Instant.parse("2026-05-28T09:00:00Z");

        // Act
        userService.evaluateStreak(userId, todayEvent);

        // Assert
        assertEquals(6, stats.getStreak()); // Incremented from 5 to 6
        assertEquals(LocalDate.parse("2026-05-28"), stats.getLastActive().toLocalDate());

        verify(userStatsRepository, times(1)).save(stats);
        verify(valueOperations, times(1)).set(eq("user:streak:" + userId), eq("6"), anyLong(), any());
    }

    /**
     * Case 5: Streak broken (gap > 1 day).
     * Expected behavior: Resets streak back to 1.
     */
    @Test
    void testEvaluateStreak_BrokenStreakResetsTo1() {
        // Arrange
        ZoneId zone = ZoneId.of("UTC");
        Instant lastEventDaysAgo = Instant.parse("2026-05-20T12:00:00Z");
        stats.setStreak(12);
        stats.setLastActive(OffsetDateTime.ofInstant(lastEventDaysAgo, zone));

        when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:timezone:" + userId)).thenReturn("UTC");

        Instant newEventToday = Instant.parse("2026-05-28T09:00:00Z");

        // Act
        userService.evaluateStreak(userId, newEventToday);

        // Assert
        assertEquals(1, stats.getStreak()); // Reset to 1
        assertEquals(LocalDate.parse("2026-05-28"), stats.getLastActive().toLocalDate());

        verify(userStatsRepository, times(1)).save(stats);
    }
}
