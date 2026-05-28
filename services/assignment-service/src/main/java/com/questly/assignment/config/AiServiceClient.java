package com.questly.assignment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AiServiceClient {

    @Value("${ai-service.base-url:http://ai-service:8089}")
    private String aiServiceBaseUrl;

    @Value("${course-service.base-url:http://course-service:8086}")
    private String courseServiceBaseUrl;

    @Bean
    public RestClient aiRestClient() {
        return RestClient.builder()
                .baseUrl(aiServiceBaseUrl)
                .build();
    }

    @Bean
    public RestClient courseRestClient() {
        return RestClient.builder()
                .baseUrl(courseServiceBaseUrl)
                .build();
    }
}
