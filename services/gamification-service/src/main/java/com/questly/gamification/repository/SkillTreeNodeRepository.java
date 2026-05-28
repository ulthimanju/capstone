package com.questly.gamification.repository;

import com.questly.gamification.model.SkillTreeNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillTreeNodeRepository extends JpaRepository<SkillTreeNode, UUID> {
    Optional<SkillTreeNode> findByLabel(String label);
}
