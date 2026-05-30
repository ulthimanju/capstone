package com.questly.ai.service;

import dev.langchain4j.data.embedding.Embedding;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    // Prefix for embedding cache keys
    private static final String EMBED_CACHE_PREFIX = "emb:";
    // Cache for 24 hours
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    /**
     * Attempts to get a cached embedding for the given text.
     */
    public Embedding getCachedEmbedding(String text) {
        try {
            String key = generateKey(text);
            float[] vector = (float[]) redisTemplate.opsForValue().get(key);
            if (vector != null) {
                log.debug("Embedding cache hit for text: [{}]", text);
                return Embedding.from(vector);
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve embedding from cache: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Caches the computed embedding for the given text.
     */
    public void cacheEmbedding(String text, Embedding embedding) {
        try {
            if (embedding == null || embedding.vector() == null) return;
            String key = generateKey(text);
            redisTemplate.opsForValue().set(key, embedding.vector(), CACHE_TTL);
            log.debug("Cached embedding for text: [{}]", text);
        } catch (Exception e) {
            log.warn("Failed to cache embedding: {}", e.getMessage());
        }
    }

    private String generateKey(String text) {
        // Hash the text or use it directly if small. For questions, they are relatively short.
        // We'll use the prefix and trim/lowercase it to maximize cache hits.
        String normalized = text.trim().toLowerCase();
        return EMBED_CACHE_PREFIX + normalized.hashCode();
    }
}
