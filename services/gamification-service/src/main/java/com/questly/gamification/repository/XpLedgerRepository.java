package com.questly.gamification.repository;

import com.questly.gamification.model.XpLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface XpLedgerRepository extends JpaRepository<XpLedger, UUID> {
    List<XpLedger> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT COALESCE(SUM(x.amount), 0) FROM XpLedger x WHERE x.userId = :userId")
    int sumAmountByUserId(@Param("userId") UUID userId);

    @Query("SELECT x.userId, CAST(SUM(x.amount) AS long) FROM XpLedger x GROUP BY x.userId ORDER BY SUM(x.amount) DESC")
    List<Object[]> getLeaderboardData();
}
