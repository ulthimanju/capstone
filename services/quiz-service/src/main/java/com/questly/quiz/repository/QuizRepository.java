package com.questly.quiz.repository;

import com.questly.quiz.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByUserIdAndNotebookId(UUID userId, UUID notebookId);
    List<Quiz> findByUserId(UUID userId);
}
