package com.questly.course.service;

import com.questly.course.dto.CourseResponse;
import com.questly.course.dto.ProgressResponse;
import com.questly.course.event.ModuleCompletedEvent;
import com.questly.course.model.Course;
import com.questly.course.model.Enrollment;
import com.questly.course.model.Module;
import com.questly.course.repository.CourseRepository;
import com.questly.course.repository.EnrollmentRepository;
import com.questly.course.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String KAFKA_TOPIC = "module.completed";

    @Transactional(readOnly = true)
    public List<Course> listPublishedCourses() {
        return courseRepository.findByIsPublishedTrue();
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseDetails(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        List<CourseResponse.ModuleDto> moduleDtos = course.getModules().stream()
                .map(m -> CourseResponse.ModuleDto.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .content(m.getContent())
                        .orderIndex(m.getOrderIndex())
                        .dripUnlock(m.isDripUnlock())
                        .build())
                .toList();

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnail(course.getThumbnail())
                .modules(moduleDtos)
                .build();
    }

    @Transactional
    public Course createCourse(UUID tutorId, Course courseReq) {
        Course course = Course.builder()
                .tutorId(tutorId)
                .title(courseReq.getTitle())
                .description(courseReq.getDescription())
                .thumbnail(courseReq.getThumbnail())
                .isPublished(courseReq.isPublished())
                .build();

        if (courseReq.getModules() != null) {
            for (Module m : courseReq.getModules()) {
                m.setCourse(course);
                course.getModules().add(m);
            }
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(UUID tutorId, UUID courseId, Course courseReq) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getTutorId().equals(tutorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the course creator can update this course");
        }

        course.setTitle(courseReq.getTitle());
        course.setDescription(courseReq.getDescription());
        course.setThumbnail(courseReq.getThumbnail());
        course.setPublished(courseReq.isPublished());

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(UUID courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        courseRepository.deleteById(courseId);
    }

    @Transactional
    public Enrollment enrollStudent(UUID userId, UUID courseId) {
        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        List<Module> modules = new ArrayList<>(course.getModules());
        modules.sort(Comparator.comparingInt(Module::getOrderIndex));

        List<UUID> unlockedList = new ArrayList<>();
        if (!modules.isEmpty()) {
            // Unlock the first module by default
            unlockedList.add(modules.get(0).getId());
        }

        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .courseId(courseId)
                .progress(BigDecimal.ZERO)
                .unlockedModules(unlockedList)
                .completed(false)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public ProgressResponse getStudentProgress(UUID userId, UUID courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        return ProgressResponse.builder()
                .progress(enrollment.getProgress())
                .unlockedModules(enrollment.getUnlockedModules())
                .completed(enrollment.isCompleted())
                .build();
    }

    @Transactional
    public ProgressResponse completeModule(UUID userId, UUID courseId, UUID moduleId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Module completedModule = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found"));

        if (!completedModule.getCourse().getId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Module does not belong to the selected course");
        }

        List<UUID> unlocked = new ArrayList<>(enrollment.getUnlockedModules());
        if (!unlocked.contains(moduleId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot complete a module you have not unlocked yet");
        }

        // Sort modules to evaluate sequence
        List<Module> modules = new ArrayList<>(course.getModules());
        modules.sort(Comparator.comparingInt(Module::getOrderIndex));

        int completedIndex = -1;
        for (int i = 0; i < modules.size(); i++) {
            if (modules.get(i).getId().equals(moduleId)) {
                completedIndex = i;
                break;
            }
        }

        // 1. Calculate progress: Number of completed modules.
        // Assuming consecutive order completion: completing module index i means i + 1 modules completed.
        int totalModules = modules.size();
        int completedCount = completedIndex + 1;

        BigDecimal progress = BigDecimal.valueOf(completedCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalModules), 2, RoundingMode.HALF_UP);

        enrollment.setProgress(progress);

        // 2. Unlock the next module if dripUnlock is active and it exists
        if (completedIndex + 1 < totalModules) {
            Module nextModule = modules.get(completedIndex + 1);
            if (nextModule.isDripUnlock() && !unlocked.contains(nextModule.getId())) {
                unlocked.add(nextModule.getId());
                enrollment.setUnlockedModules(unlocked);
            }
        }

        // 3. Mark completed if 100% progress
        if (completedCount >= totalModules) {
            enrollment.setCompleted(true);
        }

        enrollmentRepository.save(enrollment);

        log.info("Student {} completed module {} in course {}. Progress: {}%", userId, moduleId, courseId, progress);

        // 4. Publish Kafka event
        publishModuleCompletedEvent(userId, courseId, moduleId);

        return ProgressResponse.builder()
                .progress(enrollment.getProgress())
                .unlockedModules(enrollment.getUnlockedModules())
                .completed(enrollment.isCompleted())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Enrollment> listCourseEnrollments(UUID tutorId, UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getTutorId().equals(tutorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Only the course tutor can view enrollments.");
        }

        return enrollmentRepository.findByCourseId(courseId);
    }

    @Transactional(readOnly = true)
    public List<Course> getEnrolledCourses(UUID userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        List<UUID> courseIds = enrollments.stream().map(Enrollment::getCourseId).toList();
        return courseRepository.findAllById(courseIds);
    }

    private void publishModuleCompletedEvent(UUID userId, UUID courseId, UUID moduleId) {
        try {
            ModuleCompletedEvent event = ModuleCompletedEvent.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .moduleId(moduleId)
                    .build();

            kafkaTemplate.send(KAFKA_TOPIC, moduleId.toString(), event);
            log.info("Published module.completed event for module {} to Kafka.", moduleId);
        } catch (Exception e) {
            log.error("Failed to publish module.completed event to Kafka: {}", e.getMessage());
        }
    }
}
