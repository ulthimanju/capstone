package com.questly.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questly.ai.dto.QueryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueryCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String CACHE_PREFIX = "query:";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    public QueryResponse getCachedResponse(UUID notebookId, String question) {
        String key = generateKey(notebookId, question);
        try {
            Object obj = redisTemplate.opsForValue().get(key);
            if (obj != null) {
                log.info("Cache hit for query in notebook {}", notebookId);
                return objectMapper.convertValue(obj, QueryResponse.class);
            }
        } catch (Exception e) {
            log.warn("Failed to get query response from cache: {}", e.getMessage());
        }
        return null;
    }

    public void cacheResponse(UUID notebookId, String question, QueryResponse response) {
        String key = generateKey(notebookId, question);
        try {
            redisTemplate.opsForValue().set(key, response, CACHE_TTL);
            log.info("Cached query response for notebook {}", notebookId);
        } catch (Exception e) {
            log.warn("Failed to cache query response: {}", e.getMessage());
        }
    }

    public void invalidateNotebookCache(UUID notebookId) {
        try {
            String pattern = CACHE_PREFIX + notebookId + ":*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Invalidated {} query cache entries for notebook {}", keys.size(), notebookId);
            }
        } catch (Exception e) {
            log.warn("Failed to invalidate cache for notebook {}: {}", notebookId, e.getMessage());
        }
    }

    private String generateKey(UUID notebookId, String question) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(question.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return CACHE_PREFIX + notebookId + ":" + hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return CACHE_PREFIX + notebookId + ":" + question.hashCode();
        }
    }
}
