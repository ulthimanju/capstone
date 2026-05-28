package com.questly.gamification.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String icon;

    @Column(name = "condition_type", nullable = false, length = 50)
    private String conditionType; // XP_THRESHOLD | STREAK | QUIZ_COUNT | PRACTICE_COUNT

    @Column(name = "condition_value", nullable = false)
    private int conditionValue;
}
