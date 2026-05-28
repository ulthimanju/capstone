package com.questly.gamification.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "xp_ledger")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class XpLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false, length = 100)
    private String reason; // QUIZ_COMPLETED | FLASHCARD_REVIEWED | MODULE_COMPLETED | PRACTICE_SOLVED | CHALLENGE_WON

    @Column(name = "ref_id")
    private UUID refId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
