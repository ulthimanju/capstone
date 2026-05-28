package com.questly.practice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "practice_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    @JsonIgnore
    private PracticeList practiceList;

    @Column
    private String title;

    @Column(name = "problem_url", nullable = false, columnDefinition = "TEXT")
    private String problemUrl;

    @Column
    private String difficulty; // EASY | MEDIUM | HARD

    @Column(nullable = false)
    @Builder.Default
    private String status = "UNSOLVED"; // UNSOLVED | ATTEMPTED | SOLVED

    @Column(name = "solved_at")
    private LocalDateTime solvedAt;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}
