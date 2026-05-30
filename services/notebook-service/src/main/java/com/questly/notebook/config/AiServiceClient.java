package com.questly.notebook.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiServiceClient {

    @Value("${ai-service.base-url}")
    private String aiServiceBaseUrl;

    @Bean
    public RestClient aiRestClient() {
        return RestClient.builder()
                .baseUrl(aiServiceBaseUrl)
                .build();
    }

    @Bean
    public WebClient aiWebClient(WebClient.Builder builder) {
        return builder.baseUrl(aiServiceBaseUrl).build();
    }
}
