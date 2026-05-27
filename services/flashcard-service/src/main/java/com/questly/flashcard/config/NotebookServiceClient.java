package com.questly.flashcard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class NotebookServiceClient {

    @Value("${notebook-service.base-url:http://notebook-service:8083}")
    private String notebookServiceBaseUrl;

    @Value("${ai-service.base-url:http://ai-service:8089}")
    private String aiServiceBaseUrl;

    @Bean
    public RestClient notebookRestClient() {
        return RestClient.builder()
                .baseUrl(notebookServiceBaseUrl)
                .build();
    }

    @Bean
    public RestClient aiRestClient() {
        return RestClient.builder()
                .baseUrl(aiServiceBaseUrl)
                .build();
    }
}
