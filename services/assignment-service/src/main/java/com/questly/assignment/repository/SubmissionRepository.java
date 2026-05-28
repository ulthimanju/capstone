package com.questly.assignment.repository;

import com.questly.assignment.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    Optional<Submission> findByAssignmentIdAndUserId(UUID assignmentId, UUID userId);
    List<Submission> findByAssignmentId(UUID assignmentId);
    List<Submission> findByUserId(UUID userId);
}
