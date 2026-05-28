package com.questly.gamification.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "skill_tree_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillTreeNode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "prerequisites", columnDefinition = "uuid[]", nullable = false)
    @Builder.Default
    private List<UUID> prerequisites = new ArrayList<>();

    @Column(name = "unlock_condition", length = 100)
    private String unlockCondition; // QUIZ_PASS | MODULE_COMPLETE

    @Column(name = "unlock_ref_id")
    private UUID unlockRefId;
}
