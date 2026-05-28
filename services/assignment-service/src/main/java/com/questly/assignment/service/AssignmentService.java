package com.questly.assignment.service;

import com.questly.assignment.dto.*;
import com.questly.assignment.event.AssignmentGradedEvent;
import com.questly.assignment.event.AssignmentSubmittedEvent;
import com.questly.assignment.model.Assignment;
import com.questly.assignment.model.Submission;
import com.questly.assignment.repository.AssignmentRepository;
import com.questly.assignment.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final RestClient aiRestClient;
    private final RestClient courseRestClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String SUBMIT_TOPIC = "assignment.submitted";
    private static final String GRADED_TOPIC = "assignment.graded";

    @Transactional
    public Assignment createAssignment(Assignment req) {
        Assignment assignment = Assignment.builder()
                .courseId(req.getCourseId())
                .title(req.getTitle())
                .description(req.getDescription())
                .rubric(req.getRubric())
                .build();
        return assignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<Assignment> getAssignmentsForEnrolledCourses(UUID userId) {
        log.info("Fetching enrolled courses for student {} from course-service", userId);
        
        List<Map<String, Object>> courses;
        try {
            courses = courseRestClient.get()
                    .uri("/api/courses/enrolled")
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.error("Failed to query course-service for student {} enrollments: {}", userId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Course service unavailable: " + e.getMessage());
        }

        if (courses == null || courses.isEmpty()) {
            return new ArrayList<>();
        }

        List<UUID> courseIds = courses.stream()
                .map(c -> UUID.fromString((String) c.get("id")))
                .toList();

        return assignmentRepository.findByCourseIdIn(courseIds);
    }

    @Transactional(readOnly = true)
    public Assignment getAssignmentDetails(UUID id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
    }

    @Transactional
    public Submission submitAssignment(UUID userId, UUID assignmentId, SubmissionRequest req) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        Optional<Submission> existing = submissionRepository.findByAssignmentIdAndUserId(assignmentId, userId);
        Submission submission;

        if (existing.isPresent()) {
            submission = existing.get();
            submission.setContent(req.getContent());
            submission.setFilePath(req.getFilePath());
            submission.setStatus("PENDING");
            submission.setAiGrade(null);
            submission.setAiFeedback(null);
            submission.setGradedAt(null);
        } else {
            submission = Submission.builder()
                    .assignment(assignment)
                    .userId(userId)
                    .content(req.getContent())
                    .filePath(req.getFilePath())
                    .status("PENDING")
                    .build();
        }

        submission = submissionRepository.save(submission);
        log.info("Submission {} stored for student {} in assignment {}", submission.getId(), userId, assignmentId);

        // Publish assignment.submitted event to trigger async AI grading loop
        publishAssignmentSubmittedEvent(submission.getId(), assignmentId, userId, req.getContent(), assignment.getRubric());

        return submission;
    }

    @Transactional(readOnly = true)
    public Submission getStudentSubmission(UUID userId, UUID assignmentId) {
        return submissionRepository.findByAssignmentIdAndUserId(assignmentId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found for this assignment"));
    }

    @Transactional(readOnly = true)
    public List<Submission> listAssignmentSubmissions(UUID assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    // ==========================================
    // Event-Driven Auto-Grading Consumer (Self-Consumption)
    // ==========================================

    @KafkaListener(topics = SUBMIT_TOPIC, groupId = "assignment-grade-group")
    @Transactional
    public void consumeAssignmentSubmission(String message) {
        log.info("Received assignment.submitted event for AI grading: {}", message);
        try {
            // Deserialize event manual parsing
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            AssignmentSubmittedEvent event = mapper.readValue(message, AssignmentSubmittedEvent.class);

            UUID submissionId = event.getSubmissionId();
            Submission submission = submissionRepository.findById(submissionId).orElse(null);

            if (submission == null) {
                log.warn("Submission {} not found in database. Skipping grading.", submissionId);
                return;
            }

            // Call internal AI-Service synchronously to grade against rubric
            GradeRequest gradeRequest = GradeRequest.builder()
                    .submissionContent(event.getContent())
                    .rubric(event.getRubric())
                    .build();

            log.info("Sending submission {} to local AI-service for grading...", submissionId);

            GradeResponse gradeResponse = aiRestClient.post()
                    .uri("/internal/v1/ai/grade")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(gradeRequest)
                    .retrieve()
                    .body(GradeResponse.class);

            if (gradeResponse == null) {
                throw new IllegalStateException("AI-service returned null grading response");
            }

            // Save results
            submission.setAiGrade(gradeResponse.getScore());
            submission.setAiFeedback(gradeResponse.getFeedback());
            submission.setStatus("GRADED");
            submission.setGradedAt(LocalDateTime.now());
            submissionRepository.save(submission);

            log.info("Submission {} graded successfully. Score: {}%", submissionId, gradeResponse.getScore());

            // Publish assignment.graded event
            publishAssignmentGradedEvent(submissionId, submission.getUserId(), gradeResponse.getScore(), gradeResponse.getFeedback());

        } catch (Exception e) {
            log.error("Failed to execute AI grading for submission event: {}", e.getMessage(), e);
        }
    }

    // ==========================================
    // Event Publication Methods
    // ==========================================

    private void publishAssignmentSubmittedEvent(UUID submissionId, UUID assignmentId, UUID userId, String content, String rubric) {
        try {
            AssignmentSubmittedEvent event = AssignmentSubmittedEvent.builder()
                    .submissionId(submissionId)
                    .assignmentId(assignmentId)
                    .userId(userId)
                    .content(content)
                    .rubric(rubric)
                    .build();

            kafkaTemplate.send(SUBMIT_TOPIC, submissionId.toString(), event);
            log.info("Published assignment.submitted event to Kafka.");
        } catch (Exception e) {
            log.error("Failed to publish assignment.submitted event: {}", e.getMessage());
        }
    }

    private void publishAssignmentGradedEvent(UUID submissionId, UUID userId, java.math.BigDecimal score, String feedback) {
        try {
            AssignmentGradedEvent event = AssignmentGradedEvent.builder()
                    .submissionId(submissionId)
                    .userId(userId)
                    .grade(score)
                    .feedback(feedback)
                    .build();

            kafkaTemplate.send(GRADED_TOPIC, submissionId.toString(), event);
            log.info("Published assignment.graded event to Kafka.");
        } catch (Exception e) {
            log.error("Failed to publish assignment.graded event: {}", e.getMessage());
        }
    }
}
