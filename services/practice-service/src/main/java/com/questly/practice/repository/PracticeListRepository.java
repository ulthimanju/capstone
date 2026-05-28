package com.questly.practice.repository;

import com.questly.practice.model.PracticeList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PracticeListRepository extends JpaRepository<PracticeList, UUID> {
    List<PracticeList> findByUserId(UUID userId);
}
