package com.questly.gamification.repository;

import com.questly.gamification.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {
    List<Challenge> findByChallengerIdOrOpponentId(UUID challengerId, UUID opponentId);
}
