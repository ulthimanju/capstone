package com.questly.practice.service;

import com.questly.practice.dto.PracticeItemRequest;
import com.questly.practice.dto.PracticeStatsResponse;
import com.questly.practice.event.PracticeSolvedEvent;
import com.questly.practice.model.PracticeItem;
import com.questly.practice.model.PracticeList;
import com.questly.practice.repository.PracticeItemRepository;
import com.questly.practice.repository.PracticeListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PracticeService {

    private final PracticeListRepository listRepository;
    private final PracticeItemRepository itemRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String KAFKA_TOPIC = "practice.solved";

    @Transactional
    public PracticeList createList(UUID userId, String name, String platform) {
        PracticeList practiceList = PracticeList.builder()
                .userId(userId)
                .name(name)
                .platform(platform != null && !platform.isBlank() ? platform : "LeetCode")
                .build();
        return listRepository.save(practiceList);
    }

    @Transactional(readOnly = true)
    public List<PracticeList> getLists(UUID userId) {
        return listRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public PracticeList getListDetails(UUID userId, UUID listId) {
        PracticeList practiceList = listRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice list not found"));

        if (!practiceList.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this practice list.");
        }

        // Initialize items
        practiceList.getItems().size();
        return practiceList;
    }

    @Transactional
    public void deleteList(UUID userId, UUID listId) {
        PracticeList practiceList = listRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice list not found"));

        if (!practiceList.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this practice list.");
        }

        listRepository.delete(practiceList);
    }

    @Transactional
    public PracticeItem addItemToList(UUID userId, UUID listId, PracticeItemRequest req) {
        PracticeList practiceList = listRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice list not found"));

        if (!practiceList.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this practice list.");
        }

        PracticeItem item = PracticeItem.builder()
                .practiceList(practiceList)
                .title(req.getTitle())
                .problemUrl(req.getProblemUrl())
                .difficulty(req.getDifficulty() != null ? req.getDifficulty().toUpperCase() : "MEDIUM")
                .status("UNSOLVED")
                .build();

        return itemRepository.save(item);
    }

    @Transactional
    public void removeItemFromList(UUID userId, UUID listId, UUID itemId) {
        PracticeList practiceList = listRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice list not found"));

        if (!practiceList.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this practice list.");
        }

        PracticeItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice item not found"));

        if (!item.getPracticeList().getId().equals(listId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the selected practice list");
        }

        itemRepository.delete(item);
    }

    @Transactional
    public PracticeItem updateSolveStatus(UUID userId, UUID listId, UUID itemId, String newStatus) {
        PracticeList practiceList = listRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice list not found"));

        if (!practiceList.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. You do not own this practice list.");
        }

        PracticeItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Practice item not found"));

        if (!item.getPracticeList().getId().equals(listId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item does not belong to the selected practice list");
        }

        String formattedStatus = newStatus != null ? newStatus.toUpperCase() : "UNSOLVED";
        if (!List.of("UNSOLVED", "ATTEMPTED", "SOLVED").contains(formattedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid solve status value. Must be UNSOLVED, ATTEMPTED, or SOLVED.");
        }

        String oldStatus = item.getStatus();
        item.setStatus(formattedStatus);

        if ("SOLVED".equals(formattedStatus)) {
            item.setSolvedAt(LocalDateTime.now());
            // Produce practice.solved event only when transitioning to SOLVED from another state
            if (!"SOLVED".equals(oldStatus)) {
                publishPracticeSolvedEvent(userId, itemId, listId, item.getDifficulty());
            }
        } else {
            item.setSolvedAt(null);
        }

        return itemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public PracticeStatsResponse getStats(UUID userId) {
        long total = itemRepository.countByPracticeListUserId(userId);
        long solved = itemRepository.countByPracticeListUserIdAndStatus(userId, "SOLVED");
        long attempted = itemRepository.countByPracticeListUserIdAndStatus(userId, "ATTEMPTED");
        long unsolved = itemRepository.countByPracticeListUserIdAndStatus(userId, "UNSOLVED");

        return PracticeStatsResponse.builder()
                .totalProblems(total)
                .solved(solved)
                .attempted(attempted)
                .unsolved(unsolved)
                .build();
    }

    private void publishPracticeSolvedEvent(UUID userId, UUID itemId, UUID listId, String difficulty) {
        try {
            PracticeSolvedEvent event = PracticeSolvedEvent.builder()
                    .userId(userId)
                    .itemId(itemId)
                    .listId(listId)
                    .difficulty(difficulty)
                    .build();

            kafkaTemplate.send(KAFKA_TOPIC, itemId.toString(), event);
            log.info("Published practice.solved event for item {} to Kafka.", itemId);
        } catch (Exception e) {
            log.error("Failed to publish practice.solved event to Kafka: {}", e.getMessage());
        }
    }
}
