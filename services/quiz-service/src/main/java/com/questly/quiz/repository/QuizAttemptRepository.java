package com.questly.quiz.repository;

import com.questly.quiz.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByUserId(UUID userId);
    List<QuizAttempt> findByQuizId(UUID quizId);
    List<QuizAttempt> findByQuizIdAndUserId(UUID quizId, UUID userId);
}
