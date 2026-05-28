package com.questly.user.controller;

import com.questly.user.model.UserProfile;
import com.questly.user.model.UserStats;
import com.questly.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.Data;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getOwnProfile(
            @RequestHeader(value = "X-User-Timezone", required = false) String timezoneHeader,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        userService.cacheUserTimezone(userId, timezoneHeader);
        UserProfile profile = userService.getProfile(userId);
        
        return ResponseEntity.ok(UserProfileDto.builder()
                .id(profile.getId())
                .name(profile.getDisplayName() != null ? profile.getDisplayName() : profile.getEmail().split("@")[0])
                .email(profile.getEmail())
                .role(profile.getRole())
                .avatarUrl(null)
                .bio(null)
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateProfile(
            @RequestBody UserProfile update,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UserProfile profile = userService.updateProfile(userId, update);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/me/stats")
    public ResponseEntity<UserStatsDto> getOwnStats(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        UserStats stats = userService.getStats(userId);
        
        // Mock aggregates in v1 based on LLD/Stories (since flashcard and quiz are decoupled, actual dashboard fetches those live)
        return ResponseEntity.ok(UserStatsDto.builder()
                .xp(stats.getXp())
                .streak(stats.getStreak())
                .totalQuizzes(12) // Placeholder default
                .totalFlashcards(42) // Placeholder default
                .totalSolved(10) // Placeholder default
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getAnyProfile(@PathVariable UUID id) {
        UserProfile profile = userService.getProfile(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping
    public ResponseEntity<List<UserProfile>> listAllProfiles() {
        List<UserProfile> list = userService.listAllProfiles();
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserProfile> updateRole(
            @PathVariable UUID id,
            @RequestBody RoleUpdateDto body) {
        if (body.getRole() == null || body.getRole().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }
        UserProfile profile = userService.updateRole(id, body.getRole());
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> suspendUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
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

    @Data
    @Builder
    public static class UserProfileDto {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private String avatarUrl;
        private String bio;
    }

    @Data
    @Builder
    public static class UserStatsDto {
        private int xp;
        private int streak;
        private int totalQuizzes;
        private int totalFlashcards;
        private int totalSolved;
    }

    @Data
    public static class RoleUpdateDto {
        private String role;
    }
}
