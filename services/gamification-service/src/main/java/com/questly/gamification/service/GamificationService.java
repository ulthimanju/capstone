package com.questly.gamification.service;

import com.questly.gamification.dto.SkillTreeResponse;
import com.questly.gamification.event.BadgeEarnedEvent;
import com.questly.gamification.event.ChallengeCompletedEvent;
import com.questly.gamification.event.NotificationDispatchEvent;
import com.questly.gamification.event.XpAwardedEvent;
import com.questly.gamification.model.*;
import com.questly.gamification.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final XpLedgerRepository xpLedgerRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final SkillTreeNodeRepository nodeRepository;
    private final UserSkillProgressRepository progressRepository;
    private final ChallengeRepository challengeRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final StringRedisTemplate redisTemplate;

    // Seed data UUIDs for absolute reproducibility of Skill Tree DAG
    private static final UUID NODE_A_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID NODE_B_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID NODE_C_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final UUID NODE_D_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID NODE_E_ID = UUID.fromString("55555555-5555-5555-5555-555555555555");

    /**
     * Seed initial Badges and Skill Tree DAG nodes on Application Ready.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDatabase() {
        log.info("Checking gamification seed data...");

        // 1. Seed Badges
        if (badgeRepository.count() == 0) {
            log.info("Seeding default badges...");
            badgeRepository.save(Badge.builder().name("First Steps").description("Earn 100 XP").icon("🚀").conditionType("XP_THRESHOLD").conditionValue(100).build());
            badgeRepository.save(Badge.builder().name("Spaced Scholar").description("Review 5 Flashcard sessions").icon("🧠").conditionType("FLASHCARD_COUNT").conditionValue(5).build());
            badgeRepository.save(Badge.builder().name("Leet Solver").description("Solve 5 practice problems").icon("💻").conditionType("PRACTICE_COUNT").conditionValue(5).build());
            badgeRepository.save(Badge.builder().name("Quiz Champion").description("Pass 5 quizzes").icon("🏆").conditionType("QUIZ_COUNT").conditionValue(5).build());
            badgeRepository.save(Badge.builder().name("Grandmaster").description("Earn 1000 XP").icon("👑").conditionType("XP_THRESHOLD").conditionValue(1000).build());
            badgeRepository.save(Badge.builder().name("Consistent Learner").description("Maintain a 7-day learning streak").icon("🔥").conditionType("STREAK").conditionValue(7).build());
        }

        // 2. Seed Skill Tree nodes (DAG structure)
        if (nodeRepository.count() == 0) {
            log.info("Seeding default Skill Tree DAG nodes...");
            
            // Node A: Basic Programming (No prereq)
            nodeRepository.save(SkillTreeNode.builder()
                    .id(NODE_A_ID)
                    .label("Basic Programming")
                    .description("Master loops, conditionals, and standard types.")
                    .prerequisites(new ArrayList<>())
                    .build());

            // Node B: Data Structures (Prereq: Node A)
            nodeRepository.save(SkillTreeNode.builder()
                    .id(NODE_B_ID)
                    .label("Data Structures")
                    .description("Master Arrays, Lists, Maps, and Trees.")
                    .prerequisites(List.of(NODE_A_ID))
                    .build());

            // Node C: Algorithms (Prereq: Node B)
            nodeRepository.save(SkillTreeNode.builder()
                    .id(NODE_C_ID)
                    .label("Algorithms")
                    .description("Master Sorting, Searching, and Dynamic Programming.")
                    .prerequisites(List.of(NODE_B_ID))
                    .build());

            // Node D: AI Basics (Prereq: Node A)
            nodeRepository.save(SkillTreeNode.builder()
                    .id(NODE_D_ID)
                    .label("AI Basics")
                    .description("Understand prompt engineering, vector spaces, and embeddings.")
                    .prerequisites(List.of(NODE_A_ID))
                    .build());

            // Node E: Machine Learning (Prereq: Node C & Node D)
            nodeRepository.save(SkillTreeNode.builder()
                    .id(NODE_E_ID)
                    .label("Machine Learning")
                    .description("Master linear regression, neural networks, and deep transformers.")
                    .prerequisites(List.of(NODE_C_ID, NODE_D_ID))
                    .build());
        }
        log.info("Gamification seed check complete.");
    }

    /**
     * Award XP to user using double-entry bookkeeping ledger, evaluating badges.
     */
    @Transactional
    public void awardXp(UUID userId, int amount, String reason, UUID refId) {
        log.info("Awarding {} XP to user {} for {}", amount, userId, reason);
        XpLedger entry = XpLedger.builder()
                 .userId(userId)
                 .amount(amount)
                 .reason(reason)
                 .refId(refId)
                 .build();
        xpLedgerRepository.save(entry);

        // Publish xp.awarded event
        publishXpAwardedEvent(userId, amount, reason, refId);

        // ZSET Leaderboard Sync
        try {
            int newTotal = sumXpLedgerDirect(userId);
            redisTemplate.opsForZSet().add("leaderboard:global", userId.toString(), (double) newTotal);
            log.info("Synced Redis ZSET leaderboard for user {} score {}", userId, newTotal);
        } catch (Exception e) {
            log.error("Failed to sync leaderboard to Redis ZSET: {}", e.getMessage());
        }

        // Check badge awards asynchronously
        evaluateAllBadges(userId);
    }

    private int sumXpLedgerDirect(UUID userId) {
        return xpLedgerRepository.sumAmountByUserId(userId);
    }

    @Transactional(readOnly = true)
    public int getUserXpTotal(UUID userId) {
        return xpLedgerRepository.sumAmountByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<XpLedger> getUserXpLedger(UUID userId) {
        return xpLedgerRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<UserBadge> getUserBadges(UUID userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Badge> listAllBadges() {
        return badgeRepository.findAll();
    }

    /**
     * Skill Tree DAG state evaluation for user.
     * Computes unlock state dynamically based on prerequisites and completed progresses.
     */
    @Transactional
    public SkillTreeResponse getSkillTree(UUID userId) {
        List<SkillTreeNode> allNodes = nodeRepository.findAll();
        List<UserSkillProgress> userProgressList = progressRepository.findByUserId(userId);

        Map<UUID, UserSkillProgress> progressMap = new HashMap<>();
        for (UserSkillProgress p : userProgressList) {
            progressMap.put(p.getNodeId(), p);
        }

        List<SkillTreeResponse.NodeDto> dtos = new ArrayList<>();
        boolean updated = false;

        for (SkillTreeNode node : allNodes) {
            UserSkillProgress progress = progressMap.get(node.getId());
            
            if (progress == null) {
                // Initialize user progress for this node
                boolean unlocked = node.getPrerequisites().isEmpty(); // Unlocked by default if no prereq
                progress = UserSkillProgress.builder()
                        .userId(userId)
                        .nodeId(node.getId())
                        .unlocked(unlocked)
                        .completedAt(null)
                        .build();
                progressRepository.save(progress);
                progressMap.put(node.getId(), progress);
                updated = true;
            }

            boolean completed = progress.getCompletedAt() != null;

            dtos.add(SkillTreeResponse.NodeDto.builder()
                    .id(node.getId())
                    .label(node.getLabel())
                    .description(node.getDescription())
                    .unlocked(progress.isUnlocked())
                    .completed(completed)
                    .completedAt(progress.getCompletedAt())
                    .prerequisites(node.getPrerequisites())
                    .build());
        }

        // Trigger dynamic DAG evaluation propagation in case prerequisites just completed
        if (updated) {
            evaluateSkillTreeUnlocks(userId);
        }

        return SkillTreeResponse.builder().nodes(dtos).build();
    }

    /**
     * Traverse the Skill Tree DAG and unlock child nodes if all prerequisites are completed.
     */
    @Transactional
    public void evaluateSkillTreeUnlocks(UUID userId) {
        List<SkillTreeNode> nodes = nodeRepository.findAll();
        List<UserSkillProgress> progresses = progressRepository.findByUserId(userId);

        Map<UUID, UserSkillProgress> progressMap = new HashMap<>();
        for (UserSkillProgress p : progresses) {
            progressMap.put(p.getNodeId(), p);
        }

        for (SkillTreeNode node : nodes) {
            UserSkillProgress currentProg = progressMap.get(node.getId());
            if (currentProg != null && !currentProg.isUnlocked()) {
                // Check if all prerequisites are completed
                boolean allPrereqsMet = true;
                for (UUID prereqId : node.getPrerequisites()) {
                    UserSkillProgress prereqProg = progressMap.get(prereqId);
                    if (prereqProg == null || prereqProg.getCompletedAt() == null) {
                        allPrereqsMet = false;
                        break;
                    }
                }

                if (allPrereqsMet) {
                    currentProg.setUnlocked(true);
                    progressRepository.save(currentProg);
                    log.info("Unlocked skill tree node '{}' for user {}", node.getLabel(), userId);

                    // Publish notification.dispatch of type SKILL_TREE_UNLOCKED
                    publishNotificationDispatchEvent(userId, 
                            "Skill Unlocked!", 
                            "You have unlocked the '" + node.getLabel() + "' skill node. Keep learning!", 
                            "SKILL_TREE_UNLOCKED", 
                            node.getId());
                }
            }
        }
    }

    /**
     * Mark a skill tree node complete when a corresponding topic module or quiz is solved.
     */
    @Transactional
    public void completeSkillNode(UUID userId, UUID nodeId) {
        UserSkillProgress progress = progressRepository.findByUserIdAndNodeId(userId, nodeId)
                .orElse(null);

        if (progress == null) {
            progress = UserSkillProgress.builder()
                    .userId(userId)
                    .nodeId(nodeId)
                    .unlocked(true) // Complete implies unlocked
                    .completedAt(LocalDateTime.now())
                    .build();
        } else if (progress.getCompletedAt() == null) {
            progress.setUnlocked(true);
            progress.setCompletedAt(LocalDateTime.now());
        } else {
            return; // Already completed
        }

        progressRepository.save(progress);
        log.info("Completed skill tree node ID {} for user {}", nodeId, userId);

        // Propagate unlocks to children
        evaluateSkillTreeUnlocks(userId);
    }

    /**
     * Complete a node by labels matching learning event details (e.g. Topic string match).
     */
    @Transactional
    public void completeSkillNodeByLabelMatch(UUID userId, String labelMatch) {
        if (labelMatch == null || labelMatch.isBlank()) return;
        Optional<SkillTreeNode> nodeOpt = nodeRepository.findByLabel(labelMatch);
        if (nodeOpt.isPresent()) {
            completeSkillNode(userId, nodeOpt.get().getId());
        }
    }

    /**
     * Evaluate badge awards comprehensively across XP, flashcards, practice, quizzes, and streaks.
     */
    public void evaluateAllBadges(UUID userId) {
        log.info("Evaluating all badges for user {}", userId);
        try {
            List<Badge> allBadges = badgeRepository.findAll();
            List<UserBadge> earned = userBadgeRepository.findByUserId(userId);

            Set<UUID> earnedBadgeIds = new HashSet<>();
            for (UserBadge ub : earned) {
                earnedBadgeIds.add(ub.getBadge().getId());
            }

            for (Badge badge : allBadges) {
                if (earnedBadgeIds.contains(badge.getId())) {
                    continue;
                }

                String condType = badge.getConditionType().toUpperCase();
                int condValue = badge.getConditionValue();
                boolean eligible = false;

                switch (condType) {
                    case "XP_THRESHOLD":
                        int totalXp = getUserXpTotal(userId);
                        eligible = (totalXp >= condValue);
                        break;
                    case "FLASHCARD_COUNT":
                        int flashcards = xpLedgerRepository.countByUserIdAndReason(userId, "FLASHCARD_REVIEWED");
                        eligible = (flashcards >= condValue);
                        break;
                    case "PRACTICE_COUNT":
                        int practice = xpLedgerRepository.countByUserIdAndReason(userId, "PRACTICE_SOLVED");
                        eligible = (practice >= condValue);
                        break;
                    case "QUIZ_COUNT":
                        int quizzes = xpLedgerRepository.countByUserIdAndReason(userId, "QUIZ_COMPLETED");
                        eligible = (quizzes >= condValue);
                        break;
                    case "STREAK":
                        // Retrieve current user streak from Redis
                        String streakStr = redisTemplate.opsForValue().get("user:streak:" + userId);
                        int streak = 0;
                        if (streakStr != null) {
                            try {
                                streak = Integer.parseInt(streakStr);
                            } catch (NumberFormatException ignored) {}
                        }
                        eligible = (streak >= condValue);
                        break;
                    default:
                        log.warn("Unknown badge condition type: {}", condType);
                }

                if (eligible) {
                    awardBadge(userId, badge);
                }
            }
        } catch (Exception e) {
            log.error("Failed to evaluate badges for user {}: {}", userId, e.getMessage(), e);
        }
    }

    /**
     * Helper to award a badge to student, publishing badge.earned and dispatch events.
     */
    @Transactional
    public void awardBadge(UUID userId, Badge badge) {
        Optional<UserBadge> existing = userBadgeRepository.findByUserIdAndBadgeId(userId, badge.getId());
        if (existing.isPresent()) return;

        UserBadge userBadge = UserBadge.builder()
                .userId(userId)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);

        log.info("Badge '{}' earned by user {}", badge.getName(), userId);

        // Publish badge.earned
        publishBadgeEarnedEvent(userId, badge.getId(), badge.getName());

        // Publish notification.dispatch for real-time SSE display
        publishNotificationDispatchEvent(userId, 
                "New Badge Earned!", 
                "Congratulations! You unlocked the '" + badge.getName() + "' badge: " + badge.getDescription(), 
                "BADGE_EARNED", 
                badge.getId());
    }

    // ==========================================
    // Turn-Based Challenge / Quiz Battles
    // ==========================================

    @Transactional
    public Challenge createChallenge(UUID challengerId, UUID opponentId, UUID quizId) {
        Challenge challenge = Challenge.builder()
                .quizId(quizId)
                .challengerId(challengerId)
                .opponentId(opponentId)
                .status("PENDING")
                .build();

        return challengeRepository.save(challenge);
    }

    @Transactional
    public Challenge joinChallenge(UUID opponentId, UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));

        if (!challenge.getOpponentId().equals(opponentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the designated opponent can accept this challenge");
        }

        if (!"PENDING".equalsIgnoreCase(challenge.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge is not in a joinable pending state");
        }

        challenge.setStatus("ACTIVE");
        return challengeRepository.save(challenge);
    }

    @Transactional(readOnly = true)
    public Challenge getChallenge(UUID challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found"));
    }

    // ==========================================
    // Event Publication Methods
    // ==========================================

    private void publishXpAwardedEvent(UUID userId, int amount, String reason, UUID refId) {
        try {
            XpAwardedEvent event = XpAwardedEvent.builder()
                    .userId(userId)
                    .amount(amount)
                    .reason(reason)
                    .refId(refId)
                    .build();
            kafkaTemplate.send("xp.awarded", userId.toString(), event);
        } catch (Exception e) {
            log.error("Failed to publish xp.awarded event: {}", e.getMessage());
        }
    }

    private void publishBadgeEarnedEvent(UUID userId, UUID badgeId, String badgeName) {
        try {
            BadgeEarnedEvent event = BadgeEarnedEvent.builder()
                    .userId(userId)
                    .badgeId(badgeId)
                    .badgeName(badgeName)
                    .build();
            kafkaTemplate.send("badge.earned", userId.toString(), event);
        } catch (Exception e) {
            log.error("Failed to publish badge.earned event: {}", e.getMessage());
        }
    }

    public void publishChallengeCompletedEvent(UUID challengeId, UUID challengerId, UUID opponentId, UUID winnerId) {
        try {
            ChallengeCompletedEvent event = ChallengeCompletedEvent.builder()
                    .challengeId(challengeId)
                    .challengerId(challengerId)
                    .opponentId(opponentId)
                    .winnerId(winnerId)
                    .build();
            kafkaTemplate.send("challenge.completed", challengeId.toString(), event);
        } catch (Exception e) {
            log.error("Failed to publish challenge.completed event: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<com.questly.gamification.dto.LeaderboardEntry> getLeaderboard() {
        List<Object[]> data = xpLedgerRepository.getLeaderboardData();
        List<com.questly.gamification.dto.LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : data) {
            UUID userId = (UUID) row[0];
            long xp = (long) row[1];
            entries.add(com.questly.gamification.dto.LeaderboardEntry.builder()
                    .userId(userId)
                    .name("Student-" + userId.toString().substring(0, 4))
                    .xp(xp)
                    .rank(rank++)
                    .build());
        }
        return entries;
    }

    private void publishNotificationDispatchEvent(UUID userId, String title, String body, String type, UUID refId) {
        try {
            NotificationDispatchEvent event = NotificationDispatchEvent.builder()
                    .userId(userId)
                    .title(title)
                    .body(body)
                    .type(type)
                    .refId(refId)
                    .build();
            kafkaTemplate.send("notification.dispatch", userId.toString(), event);
        } catch (Exception e) {
            log.error("Failed to publish notification.dispatch event: {}", e.getMessage());
        }
    }
}
