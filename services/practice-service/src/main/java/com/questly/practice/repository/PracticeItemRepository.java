package com.questly.practice.repository;

import com.questly.practice.model.PracticeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PracticeItemRepository extends JpaRepository<PracticeItem, UUID> {
    List<PracticeItem> findByPracticeListId(UUID listId);
    long countByPracticeListUserIdAndStatus(UUID userId, String status);
    long countByPracticeListUserId(UUID userId);
}
