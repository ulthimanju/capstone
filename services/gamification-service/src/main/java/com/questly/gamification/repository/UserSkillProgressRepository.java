package com.questly.gamification.repository;

import com.questly.gamification.model.UserSkillProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSkillProgressRepository extends JpaRepository<UserSkillProgress, UUID> {
    Optional<UserSkillProgress> findByUserIdAndNodeId(UUID userId, UUID nodeId);
    List<UserSkillProgress> findByUserId(UUID userId);
}
