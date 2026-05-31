package com.questly.ai.config;

import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Slf4j
@Configuration
public class LangChain4jConfig {

    // OpenRouter (chat)
    @Value("${openrouter.api-key}")
    private String openRouterApiKey;

    @Value("${openrouter.base-url}")
    private String openRouterBaseUrl;

    @Value("${openrouter.chat-model}")
    private String chatModelName;

    // HuggingFace (embeddings)
    @Value("${huggingface.api-key}")
    private String hfApiKey;

    @Value("${huggingface.base-url}")
    private String hfBaseUrl;

    @Value("${huggingface.embedding-model}")
    private String embeddingModelName;

    // ChromaDB
    @Value("${chroma.base-url}")
    private String chromaBaseUrl;

    @Bean
    public OpenAiEmbeddingModel embeddingModel() {
        log.info("Configuring HuggingFace embedding model: {} at {}", embeddingModelName, hfBaseUrl);
        return OpenAiEmbeddingModel.builder()
                .baseUrl(hfBaseUrl)
                .apiKey(hfApiKey)
                .modelName(embeddingModelName)
                .timeout(Duration.ofSeconds(60))
                .build();
    }

    @Bean
    public OpenAiChatModel chatModel() {
        log.info("Configuring OpenRouter chat model: {} at {}", chatModelName, openRouterBaseUrl);
        return OpenAiChatModel.builder()
                .baseUrl(openRouterBaseUrl)
                .apiKey(openRouterApiKey)
                .modelName(chatModelName)
                .temperature(0.0)
                .timeout(Duration.ofSeconds(300))
                .logRequests(false)
                .logResponses(false)
                .build();
    }

    @Bean
    public OpenAiStreamingChatModel streamingChatModel() {
        log.info("Configuring OpenRouter streaming chat model: {} at {}", chatModelName, openRouterBaseUrl);
        return OpenAiStreamingChatModel.builder()
                .baseUrl(openRouterBaseUrl)
                .apiKey(openRouterApiKey)
                .modelName(chatModelName)
                .temperature(0.0)
                .timeout(Duration.ofSeconds(300))
                .logRequests(false)
                .logResponses(false)
                .build();
    }

    @Bean
    public ChromaEmbeddingStore chromaStore() {
        log.info("Configuring default ChromaDB store at {}", chromaBaseUrl);
        return ChromaEmbeddingStore.builder()
                .baseUrl(chromaBaseUrl)
                .collectionName("default")
                .build();
    }

    public String getChromaBaseUrl() {
        return chromaBaseUrl;
    }
}
