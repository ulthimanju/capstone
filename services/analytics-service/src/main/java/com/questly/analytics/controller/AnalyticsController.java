package com.questly.analytics.controller;

import com.questly.analytics.model.ActivityEvent;
import com.questly.analytics.model.DailySummary;
import com.questly.analytics.repository.ActivityEventRepository;
import com.questly.analytics.repository.DailySummaryRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final DailySummaryRepository dailySummaryRepository;
    private final ActivityEventRepository activityEventRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<DailySummary> summaries = dailySummaryRepository.findByUserIdOrderByDateAsc(userId);

        int totalStudyTime = 0;
        int quizzesTaken = 0;
        int cardsReviewed = 0;
        int problemsSolved = 0;
        BigDecimal scoreSum = BigDecimal.ZERO;
        int scoresCount = 0;

        for (DailySummary s : summaries) {
            totalStudyTime += s.getStudyTimeS();
            quizzesTaken += s.getQuizzesTaken();
            cardsReviewed += s.getCardsReviewed();
            problemsSolved += s.getProblemsSolved();
            if (s.getAvgScore() != null) {
                scoreSum = scoreSum.add(s.getAvgScore());
                scoresCount++;
            }
        }

        BigDecimal avgScore = scoresCount > 0 
                ? scoreSum.divide(BigDecimal.valueOf(scoresCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Calculate XP progression for the last 7 days
        List<Integer> weeklyXp = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Map<LocalDate, Integer> xpByDate = new HashMap<>();
        for (DailySummary s : summaries) {
            xpByDate.put(s.getDate(), s.getXpEarned());
        }
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            weeklyXp.add(xpByDate.getOrDefault(date, 0));
        }

        return ResponseEntity.ok(DashboardSummaryDto.builder()
                .studyTimeSecs(totalStudyTime)
                .quizzesTaken(quizzesTaken)
                .avgScore(avgScore)
                .flashcardsReviewed(cardsReviewed)
                .problemsSolved(problemsSolved)
                .weeklyXp(weeklyXp)
                .build());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicBreakdownDto>> getTopicBreakdown(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<ActivityEvent> events = activityEventRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, TopicStats> statsMap = new HashMap<>();
        for (ActivityEvent e : events) {
            if (e.getTopic() == null || e.getTopic().isBlank()) continue;
            TopicStats stats = statsMap.computeIfAbsent(e.getTopic(), k -> new TopicStats());
            if (e.getDurationS() != null) {
                stats.durationSum += e.getDurationS();
            }
            if (e.getScore() != null) {
                stats.scoreSum = stats.scoreSum.add(e.getScore());
                stats.scoreCount++;
            }
        }

        List<TopicBreakdownDto> result = new ArrayList<>();
        for (Map.Entry<String, TopicStats> entry : statsMap.entrySet()) {
            TopicStats stats = entry.getValue();
            BigDecimal avgScore = stats.scoreCount > 0 
                    ? stats.scoreSum.divide(BigDecimal.valueOf(stats.scoreCount), 2, RoundingMode.HALF_UP)
                    : null;
            result.add(TopicBreakdownDto.builder()
                    .topic(entry.getKey())
                    .studyTimeSecs(stats.durationSum)
                    .avgScore(avgScore)
                    .build());
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/scores")
    public ResponseEntity<List<ScoreTrendDto>> getScoreTrend(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<DailySummary> summaries = dailySummaryRepository.findByUserIdOrderByDateAsc(userId);

        List<ScoreTrendDto> trend = new ArrayList<>();
        for (DailySummary s : summaries) {
            if (s.getAvgScore() != null) {
                trend.add(ScoreTrendDto.builder()
                        .date(s.getDate().toString())
                        .avgScore(s.getAvgScore())
                        .build());
            }
        }
        return ResponseEntity.ok(trend);
    }

    @GetMapping("/weak-spots")
    public ResponseEntity<List<String>> getWeakSpots(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<ActivityEvent> events = activityEventRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // Simple aggregation logic: find topics with scores under 50%
        Set<String> weakSpots = new LinkedHashSet<>();
        for (ActivityEvent e : events) {
            if (e.getTopic() != null && e.getScore() != null && e.getScore().compareTo(BigDecimal.valueOf(50)) < 0) {
                weakSpots.add(e.getTopic());
            }
        }
        return ResponseEntity.ok(new ArrayList<>(weakSpots));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<DashboardSummaryDto> getStudentAnalytics(@PathVariable UUID id) {
        // Tutor-only: fetch details for a specific student id
        List<DailySummary> summaries = dailySummaryRepository.findByUserIdOrderByDateAsc(id);
        int totalStudyTime = 0;
        int quizzesTaken = 0;
        int cardsReviewed = 0;
        int problemsSolved = 0;
        BigDecimal scoreSum = BigDecimal.ZERO;
        int scoresCount = 0;

        for (DailySummary s : summaries) {
            totalStudyTime += s.getStudyTimeS();
            quizzesTaken += s.getQuizzesTaken();
            cardsReviewed += s.getCardsReviewed();
            problemsSolved += s.getProblemsSolved();
            if (s.getAvgScore() != null) {
                scoreSum = scoreSum.add(s.getAvgScore());
                scoresCount++;
            }
        }

        BigDecimal avgScore = scoresCount > 0 
                ? scoreSum.divide(BigDecimal.valueOf(scoresCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return ResponseEntity.ok(DashboardSummaryDto.builder()
                .studyTimeSecs(totalStudyTime)
                .quizzesTaken(quizzesTaken)
                .avgScore(avgScore)
                .flashcardsReviewed(cardsReviewed)
                .problemsSolved(problemsSolved)
                .weeklyXp(new ArrayList<>())
                .build());
    }

    @GetMapping("/platform")
    public ResponseEntity<Map<String, Object>> getPlatformAnalytics() {
        // Admin-only global stats
        List<DailySummary> all = dailySummaryRepository.findAll();
        int totalStudyTime = 0;
        int quizzes = 0;
        int problems = 0;
        for (DailySummary s : all) {
            totalStudyTime += s.getStudyTimeS();
            quizzes += s.getQuizzesTaken();
            problems += s.getProblemsSolved();
        }
        Map<String, Object> platform = new HashMap<>();
        platform.put("platformQuizzes", quizzes);
        platform.put("platformProblems", problems);
        platform.put("platformStudyTimeHrs", totalStudyTime / 3600);
        return ResponseEntity.ok(platform);
    }

    private UUID extractUserId(HttpServletRequest request) {
        String header = request.getHeader("X-User-Id");
        if (header == null || header.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid X-User-Id header format");
        }
    }

    private static class TopicStats {
        int durationSum = 0;
        BigDecimal scoreSum = BigDecimal.ZERO;
        int scoreCount = 0;
    }

    @Data
    @Builder
    public static class DashboardSummaryDto {
        private int studyTimeSecs;
        private int quizzesTaken;
        private BigDecimal avgScore;
        private int flashcardsReviewed;
        private int problemsSolved;
        private List<Integer> weeklyXp;
    }

    @Data
    @Builder
    public static class TopicBreakdownDto {
        private String topic;
        private int studyTimeSecs;
        private BigDecimal avgScore;
    }

    @Data
    @Builder
    public static class ScoreTrendDto {
        private String date;
        private BigDecimal avgScore;
    }
}
