package com.questly.gamification.controller;

import com.questly.gamification.dto.LeaderboardEntry;
import com.questly.gamification.dto.SkillTreeResponse;
import com.questly.gamification.dto.XpResponse;
import com.questly.gamification.model.Badge;
import com.questly.gamification.model.Challenge;
import com.questly.gamification.model.UserBadge;
import com.questly.gamification.service.GamificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/xp")
    public ResponseEntity<XpResponse> getXpDetails(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        int total = gamificationService.getUserXpTotal(userId);
        XpResponse response = XpResponse.builder()
                .total(total)
                .ledger(gamificationService.getUserXpLedger(userId))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/badges")
    public ResponseEntity<List<UserBadge>> getEarnedBadges(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<UserBadge> earned = gamificationService.getUserBadges(userId);
        return ResponseEntity.ok(earned);
    }

    @GetMapping("/badges/all")
    public ResponseEntity<List<Badge>> getAllBadges() {
        List<Badge> all = gamificationService.listAllBadges();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        List<LeaderboardEntry> leaderboard = gamificationService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/skill-tree")
    public ResponseEntity<SkillTreeResponse> getSkillTree(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        SkillTreeResponse response = gamificationService.getSkillTree(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/challenges")
    public ResponseEntity<Challenge> createChallenge(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String opponentIdStr = body.get("opponentId");
        String quizIdStr = body.get("quizId");

        if (opponentIdStr == null || opponentIdStr.isBlank() || quizIdStr == null || quizIdStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "opponentId and quizId are required");
        }

        try {
            UUID opponentId = UUID.fromString(opponentIdStr);
            UUID quizId = UUID.fromString(quizIdStr);
            Challenge challenge = gamificationService.createChallenge(userId, opponentId, quizId);
            return ResponseEntity.status(HttpStatus.CREATED).body(challenge);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID format for opponentId or quizId");
        }
    }

    @PostMapping("/challenges/{id}/join")
    public ResponseEntity<Challenge> joinChallenge(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        Challenge challenge = gamificationService.joinChallenge(userId, id);
        return ResponseEntity.ok(challenge);
    }

    @GetMapping("/challenges/{id}")
    public ResponseEntity<Challenge> getChallenge(
            @PathVariable UUID id) {
        Challenge challenge = gamificationService.getChallenge(id);
        return ResponseEntity.ok(challenge);
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
}
