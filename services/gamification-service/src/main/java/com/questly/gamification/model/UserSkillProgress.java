package com.questly.gamification.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_skill_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "node_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkillProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "node_id", nullable = false)
    private UUID nodeId;

    @Column(nullable = false)
    @Builder.Default
    private boolean unlocked = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
