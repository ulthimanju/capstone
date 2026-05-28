package com.questly.analytics.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_summaries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "date"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "xp_earned", nullable = false)
    @Builder.Default
    private int xpEarned = 0;

    @Column(name = "quizzes_taken", nullable = false)
    @Builder.Default
    private int quizzesTaken = 0;

    @Column(name = "avg_score", precision = 5, scale = 2)
    private BigDecimal avgScore;

    @Column(name = "cards_reviewed", nullable = false)
    @Builder.Default
    private int cardsReviewed = 0;

    @Column(name = "problems_solved", nullable = false)
    @Builder.Default
    private int problemsSolved = 0;

    @Column(name = "study_time_s", nullable = false)
    @Builder.Default
    private int studyTimeS = 0;
}
