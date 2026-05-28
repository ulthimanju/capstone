package com.questly.practice.controller;

import com.questly.practice.dto.PracticeItemRequest;
import com.questly.practice.dto.PracticeStatsResponse;
import com.questly.practice.model.PracticeItem;
import com.questly.practice.model.PracticeList;
import com.questly.practice.service.PracticeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
@RequestMapping("/api/practice")
@RequiredArgsConstructor
public class PracticeController {

    private final PracticeService practiceService;

    @PostMapping("/lists")
    public ResponseEntity<PracticeList> createList(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String name = body.get("name");
        String platform = body.get("platform");

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "List name is required");
        }

        PracticeList practiceList = practiceService.createList(userId, name, platform);
        return ResponseEntity.status(HttpStatus.CREATED).body(practiceList);
    }

    @GetMapping("/lists")
    public ResponseEntity<List<PracticeList>> getLists(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        List<PracticeList> lists = practiceService.getLists(userId);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/lists/{id}")
    public ResponseEntity<PracticeList> getListDetails(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        PracticeList details = practiceService.getListDetails(userId, id);
        return ResponseEntity.ok(details);
    }

    @DeleteMapping("/lists/{id}")
    public ResponseEntity<Void> deleteList(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        practiceService.deleteList(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lists/{id}/items")
    public ResponseEntity<PracticeItem> addItemToList(
            @PathVariable UUID id,
            @Valid @RequestBody PracticeItemRequest req,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        PracticeItem item = practiceService.addItemToList(userId, id, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @DeleteMapping("/lists/{id}/items/{itemId}")
    public ResponseEntity<Void> removeItemFromList(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        practiceService.removeItemFromList(userId, id, itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/lists/{id}/items/{itemId}/status")
    public ResponseEntity<PracticeItem> updateSolveStatus(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        UUID userId = extractUserId(request);
        String status = body.get("status");
        PracticeItem item = practiceService.updateSolveStatus(userId, id, itemId, status);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/stats")
    public ResponseEntity<PracticeStatsResponse> getStats(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        PracticeStatsResponse stats = practiceService.getStats(userId);
        return ResponseEntity.ok(stats);
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
