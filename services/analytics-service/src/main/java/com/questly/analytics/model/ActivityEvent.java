package com.questly.analytics.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "ref_id")
    private UUID refId;

    @Column(name = "topic", length = 255)
    private String topic;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "duration_s")
    private Integer durationS;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
