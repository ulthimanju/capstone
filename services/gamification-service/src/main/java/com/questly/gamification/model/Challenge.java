package com.questly.gamification.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "quiz_id", nullable = false)
    private UUID quizId;

    @Column(name = "challenger_id", nullable = false)
    private UUID challengerId;

    @Column(name = "opponent_id", nullable = false)
    private UUID opponentId;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING | ACCEPTED | REJECTED | ACTIVE | COMPLETED

    @Column(name = "winner_id")
    private UUID winnerId;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private int version = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
