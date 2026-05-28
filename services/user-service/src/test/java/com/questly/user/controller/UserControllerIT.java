package com.questly.user.controller;

import com.questly.user.BaseIntegrationTest;
import com.questly.user.model.UserProfile;
import com.questly.user.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class UserControllerIT extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserProfileRepository userProfileRepository;

    private UUID testUserId;

    @BeforeEach
    void setupData() {
        userProfileRepository.deleteAll();
        testUserId = UUID.randomUUID();
        
        UserProfile profile = UserProfile.builder()
                .id(testUserId)
                .email("student@questly.com")
                .displayName("Questly Student")
                .role("STUDENT")
                .build();
        userProfileRepository.save(profile);
    }

    @Test
    void testGetOwnProfile_Success() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", testUserId.toString());
        headers.set("X-User-Timezone", "America/New_York");
        
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        ResponseEntity<UserController.UserProfileDto> response = restTemplate.exchange(
                "/api/users/me",
                HttpMethod.GET,
                entity,
                UserController.UserProfileDto.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Questly Student", response.getBody().getName());
        assertEquals("student@questly.com", response.getBody().getEmail());
    }

    @Test
    void testGetOwnProfile_UnauthorizedWhenHeaderMissing() {
        HttpEntity<Void> entity = new HttpEntity<>(new HttpHeaders());
        
        ResponseEntity<Void> response = restTemplate.exchange(
                "/api/users/me",
                HttpMethod.GET,
                entity,
                Void.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testGetAnyProfile_Success() {
        ResponseEntity<UserProfile> response = restTemplate.getForEntity(
                "/api/users/" + testUserId,
                UserProfile.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("student@questly.com", response.getBody().getEmail());
        assertEquals("Questly Student", response.getBody().getDisplayName());
    }
}
