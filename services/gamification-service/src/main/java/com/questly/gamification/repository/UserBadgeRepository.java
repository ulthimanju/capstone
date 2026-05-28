package com.questly.gamification.repository;

import com.questly.gamification.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    List<UserBadge> findByUserId(UUID userId);
    Optional<UserBadge> findByUserIdAndBadgeId(UUID userId, UUID badgeId);
}
