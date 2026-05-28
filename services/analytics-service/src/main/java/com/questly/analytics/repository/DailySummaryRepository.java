package com.questly.analytics.repository;

import com.questly.analytics.model.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailySummaryRepository extends JpaRepository<DailySummary, UUID> {

    Optional<DailySummary> findByUserIdAndDate(UUID userId, LocalDate date);

    List<DailySummary> findByUserIdOrderByDateAsc(UUID userId);
}
