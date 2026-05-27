package com.questly.quiz.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weak_spots", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "notebook_id", "topic"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeakSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "notebook_id", nullable = false)
    private UUID notebookId;

    @Column(name = "topic", nullable = false, length = 255)
    private String topic;

    @Column(name = "wrong_count", nullable = false)
    @Builder.Default
    private Integer wrongCount = 1;

    @Column(name = "correct_streak", nullable = false)
    @Builder.Default
    private Integer correctStreak = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @UpdateTimestamp
    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;
}
