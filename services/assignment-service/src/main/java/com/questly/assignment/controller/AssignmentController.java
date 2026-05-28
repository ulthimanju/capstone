package com.questly.assignment.controller;

import com.questly.assignment.dto.SubmissionRequest;
import com.questly.assignment.model.Assignment;
import com.questly.assignment.model.Submission;
import com.questly.assignment.service.AssignmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @Valid @RequestBody Assignment assignment,
            HttpServletRequest request) {
        String role = extractUserRole(request);
        if (!"TUTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Tutors or Admins can create assignments");
        }
        Assignment created = assignmentService.createAssignment(assignment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAssignmentsForEnrolledCourses(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Assignment> assignments = assignmentService.getAssignmentsForEnrolledCourses(userId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentDetails(@PathVariable UUID id) {
        Assignment assignment = assignmentService.getAssignmentDetails(id);
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable UUID id,
            @Valid @RequestBody SubmissionRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Submission submission = assignmentService.submitAssignment(userId, id, req);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/{id}/submission")
    public ResponseEntity<Submission> getStudentSubmission(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Submission submission = assignmentService.getStudentSubmission(userId, id);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<Submission>> listAssignmentSubmissions(
            @PathVariable UUID id,
            HttpServletRequest request) {
        String role = extractUserRole(request);
        if (!"TUTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Tutors or Admins can view all submissions");
        }
        List<Submission> submissions = assignmentService.listAssignmentSubmissions(id);
        return ResponseEntity.ok(submissions);
    }

    private UUID extractUserId(HttpServletRequest request) {
        String header = request.getHeader("X-User-Id");
        if (header == null || header.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid X-User-Id header format");
        }
    }

    private String extractUserRole(HttpServletRequest request) {
        String header = request.getHeader("X-User-Role");
        if (header == null || header.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Role header");
        }
        return header;
    }
}
