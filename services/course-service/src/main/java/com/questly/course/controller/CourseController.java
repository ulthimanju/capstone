package com.questly.course.controller;

import com.questly.course.dto.CourseResponse;
import com.questly.course.dto.ProgressResponse;
import com.questly.course.model.Course;
import com.questly.course.model.Enrollment;
import com.questly.course.service.CourseService;
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
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> listPublishedCourses() {
        List<Course> courses = courseService.listPublishedCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/enrolled")
    public ResponseEntity<List<Course>> getEnrolledCourses(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<Course> courses = courseService.getEnrolledCourses(userId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseDetails(@PathVariable UUID id) {
        CourseResponse courseResponse = courseService.getCourseDetails(id);
        return ResponseEntity.ok(courseResponse);
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(
            @Valid @RequestBody Course course,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String role = extractUserRole(request);

        if (!"TUTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Tutors or Admins can create courses");
        }

        Course created = courseService.createCourse(userId, course);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable UUID id,
            @Valid @RequestBody Course course,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String role = extractUserRole(request);

        if (!"TUTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Tutors or Admins can update courses");
        }

        Course updated = courseService.updateCourse(userId, id, course);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable UUID id,
            HttpServletRequest request) {
        String role = extractUserRole(request);

        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admins can delete courses");
        }

        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<Enrollment> enrollStudent(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Enrollment enrollment = courseService.enrollStudent(userId, id);
        return ResponseEntity.ok(enrollment);
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ProgressResponse> getStudentProgress(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        ProgressResponse progress = courseService.getStudentProgress(userId, id);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/{id}/modules/{moduleId}/complete")
    public ResponseEntity<ProgressResponse> completeModule(
            @PathVariable UUID id,
            @PathVariable UUID moduleId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        ProgressResponse progress = courseService.completeModule(userId, id, moduleId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{id}/enrollments")
    public ResponseEntity<List<Enrollment>> listCourseEnrollments(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String role = extractUserRole(request);

        if (!"TUTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Tutors or Admins can view enrollments");
        }

        List<Enrollment> enrollments = courseService.listCourseEnrollments(userId, id);
        return ResponseEntity.ok(enrollments);
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
            // Defaulting safely if missing, but gateway should propagate
            return "STUDENT";
        }
        return header.toUpperCase();
    }
}
