package com.questly.user.service;

import com.questly.user.event.UserRoleUpdatedEvent;
import com.questly.user.event.UserSuspendedEvent;
import com.questly.user.kafka.UserEventProducer;
import com.questly.user.model.UserProfile;
import com.questly.user.model.UserStats;
import com.questly.user.repository.UserProfileRepository;
import com.questly.user.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserProfileRepository userProfileRepository;
    private final UserStatsRepository userStatsRepository;
    private final StringRedisTemplate redisTemplate;
    private final UserEventProducer userEventProducer;

    private static final String TZ_CACHE_KEY_PREFIX = "user:timezone:";
    private static final String STREAK_CACHE_KEY_PREFIX = "user:streak:";
    private static final String STATS_CACHE_KEY_PREFIX = "user:stats:";

    /**
     * Cache the user's localized timezone from browser header into Redis.
     */
    public void cacheUserTimezone(UUID userId, String timezoneHeader) {
        if (timezoneHeader == null || timezoneHeader.isBlank()) {
            return;
        }
        try {
            // Verify if it is a valid zone id
            ZoneId zoneId = ZoneId.of(timezoneHeader);
            String key = TZ_CACHE_KEY_PREFIX + userId;
            redisTemplate.opsForValue().set(key, zoneId.getId(), 7, TimeUnit.DAYS);
            log.debug("Cached timezone '{}' for userId {}", zoneId.getId(), userId);
        } catch (Exception e) {
            log.warn("Invalid timezone header received: '{}', ignoring cache write", timezoneHeader);
        }
    }

    /**
     * Evaluate and update daily streak in timezone-aware manner upon learning events.
     */
    public void evaluateStreak(UUID userId, Instant eventTimestamp) {
        log.info("Evaluating streak for user {} at event time {}", userId, eventTimestamp);
        UserStats stats = userStatsRepository.findById(userId).orElse(null);
        if (stats == null) {
            log.warn("Cannot evaluate streak, UserStats not found for userId={}", userId);
            return;
        }

        // 1. Resolve Timezone from Redis cache
        String tzKey = TZ_CACHE_KEY_PREFIX + userId;
        String cachedTz = redisTemplate.opsForValue().get(tzKey);
        ZoneId zoneId;
        if (cachedTz != null) {
            zoneId = ZoneId.of(cachedTz);
        } else {
            log.warn("Timezone cache is empty for user {}. Defaulting streak evaluation to UTC.", userId);
            zoneId = ZoneId.of("UTC");
        }

        // 2. Convert event timestamp to user local date
        LocalDate eventDate = eventTimestamp.atZone(zoneId).toLocalDate();

        if (stats.getLastActive() == null) {
            // New streak
            stats.setStreak(1);
            stats.setLastActive(OffsetDateTime.ofInstant(eventTimestamp, zoneId));
            log.info("Initial streak established for user {}: streak = 1", userId);
        } else {
            // Convert last active to user local date
            LocalDate lastActiveDate = stats.getLastActive().atZoneSameInstant(zoneId).toLocalDate();

            if (eventDate.isEqual(lastActiveDate)) {
                // Same day, streak maintained but last active timestamp updated to latest activity
                stats.setLastActive(OffsetDateTime.ofInstant(eventTimestamp, zoneId));
                log.info("Streak maintained for user {} (already active today)", userId);
            } else if (eventDate.isEqual(lastActiveDate.plusDays(1))) {
                // Consecutive day
                stats.setStreak(stats.getStreak() + 1);
                stats.setLastActive(OffsetDateTime.ofInstant(eventTimestamp, zoneId));
                log.info("Streak incremented for user {}: new streak = {}", userId, stats.getStreak());
            } else if (eventDate.isAfter(lastActiveDate.plusDays(1))) {
                // Streak broken
                stats.setStreak(1);
                stats.setLastActive(OffsetDateTime.ofInstant(eventTimestamp, zoneId));
                log.warn("Streak broken for user {} (last active: {}, event: {}). Resetting streak to 1", 
                        userId, lastActiveDate, eventDate);
            } else {
                log.debug("Event date {} is before last active date {} for user {}. Streak unchanged.", 
                        eventDate, lastActiveDate, userId);
            }
        }

        userStatsRepository.save(stats);

        // 3. Update Redis Caches
        try {
            redisTemplate.opsForValue().set(STREAK_CACHE_KEY_PREFIX + userId, String.valueOf(stats.getStreak()), 48, TimeUnit.HOURS);
            redisTemplate.delete(STATS_CACHE_KEY_PREFIX + userId);
        } catch (Exception e) {
            log.error("Failed to update Redis streak caches: {}", e.getMessage());
        }
    }

    /**
     * Increment student total XP in UserStats.
     */
    public void incrementXp(UUID userId, int xpAmount) {
        UserStats stats = userStatsRepository.findById(userId).orElse(null);
        if (stats == null) {
            log.warn("UserStats record not found for userId={}", userId);
            return;
        }
        stats.setXp(stats.getXp() + xpAmount);
        userStatsRepository.save(stats);
        log.info("Incremented XP by {} for user {}. New total XP: {}", xpAmount, userId, stats.getXp());

        // Invalidate stats cache
        try {
            redisTemplate.delete(STATS_CACHE_KEY_PREFIX + userId);
        } catch (Exception e) {
            log.error("Failed to invalidate Redis stats cache: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public UserProfile getProfile(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));
    }

    @Transactional(readOnly = true)
    public UserStats getStats(UUID userId) {
        return userStatsRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User stats not found"));
    }

    @Transactional(readOnly = true)
    public List<UserProfile> listAllProfiles() {
        return userProfileRepository.findAll();
    }

    public UserProfile updateProfile(UUID userId, UserProfile update) {
        UserProfile existing = getProfile(userId);
        if (update.getDisplayName() != null) {
            existing.setDisplayName(update.getDisplayName());
        }
        return userProfileRepository.save(existing);
    }

    public UserProfile updateRole(UUID id, String role) {
        UserProfile existing = getProfile(id);
        existing.setRole(role);
        UserProfile saved = userProfileRepository.save(existing);

        userEventProducer.publishUserRoleUpdated(
            UserRoleUpdatedEvent.builder()
                .userId(id)
                .role(role)
                .build()
        );

        return saved;
    }

    public void deleteUser(UUID id) {
        userProfileRepository.deleteById(id);

        userEventProducer.publishUserSuspended(
            UserSuspendedEvent.builder()
                .userId(id)
                .build()
        );
    }
}
