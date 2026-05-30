package com.questly.ai.config;

import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.ollama.OllamaStreamingChatModel;
import dev.langchain4j.model.ollama.OllamaEmbeddingModel;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Slf4j
@Configuration
public class LangChain4jConfig {

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${ollama.chat-model}")
    private String chatModelName;

    @Value("${ollama.embedding-model}")
    private String embeddingModelName;

    @Value("${chroma.base-url}")
    private String chromaBaseUrl;

    @Bean
    public OllamaEmbeddingModel embeddingModel() {
        log.info("Configuring Ollama embedding model: {} at {}", embeddingModelName, ollamaBaseUrl);
        return OllamaEmbeddingModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName(embeddingModelName)
                .build();
    }

    @Bean
    public OllamaChatModel chatModel() {
        log.info("Configuring Ollama chat model: {} at {}", chatModelName, ollamaBaseUrl);
        return OllamaChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName(chatModelName)
                .temperature(0.0)
                .timeout(Duration.ofSeconds(300))
                .build();
    }

    @Bean
    public OllamaStreamingChatModel streamingChatModel() {
        log.info("Configuring Ollama streaming chat model: {} at {}", chatModelName, ollamaBaseUrl);
        return OllamaStreamingChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName(chatModelName)
                .temperature(0.0)
                .timeout(Duration.ofSeconds(300))
                .build();
    }

    @Bean
    public ChromaEmbeddingStore chromaStore() {
        log.info("Configuring default ChromaDB store at {}", chromaBaseUrl);
        // Default store bean (collection set dynamically per notebook in services)
        return ChromaEmbeddingStore.builder()
                .baseUrl(chromaBaseUrl)
                .collectionName("default")
                .build();
    }

    public String getChromaBaseUrl() {
        return chromaBaseUrl;
    }
}
