package com.questly.gateway;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Date;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.cloud.config.enabled=false",
    "eureka.client.enabled=false",
    "spring.cloud.gateway.discovery.locator.enabled=false",
    "spring.cloud.gateway.routes[0].id=test-auth-route",
    "spring.cloud.gateway.routes[0].uri=http://localhost:${wiremock.port}",
    "spring.cloud.gateway.routes[0].predicates[0]=Path=/api/auth/**",
    "spring.cloud.gateway.routes[1].id=test-course-route",
    "spring.cloud.gateway.routes[1].uri=http://localhost:${wiremock.port}",
    "spring.cloud.gateway.routes[1].predicates[0]=Path=/api/courses/**",
    "spring.cloud.gateway.routes[2].id=test-assignment-route",
    "spring.cloud.gateway.routes[2].uri=http://localhost:${wiremock.port}",
    "spring.cloud.gateway.routes[2].predicates[0]=Path=/api/assignments/**",
    "spring.cloud.gateway.routes[3].id=test-analytics-route",
    "spring.cloud.gateway.routes[3].uri=http://localhost:${wiremock.port}",
    "spring.cloud.gateway.routes[3].predicates[0]=Path=/api/analytics/**"
})
public class GatewaySecurityIT {

    private static WireMockServer wireMockServer;
    private static String testPublicKeyPem;
    private static RSAPrivateKey privateKey;

    @Autowired
    private WebTestClient webTestClient;

    @BeforeAll
    public static void setupSpec() throws Exception {
        // Start WireMock
        wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().dynamicPort());
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());

        // Generate RSA Key Pair
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();

        // Convert Public Key to PEM
        byte[] encoded = publicKey.getEncoded();
        String base64 = Base64.getEncoder().encodeToString(encoded);
        testPublicKeyPem = "-----BEGIN PUBLIC KEY-----\n" + base64 + "\n-----END PUBLIC KEY-----";
    }

    @AfterAll
    public static void tearDownSpec() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }

    @BeforeEach
    public void setup() {
        wireMockServer.resetAll();
    }

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.security.oauth2.resourceserver.jwt.public-key-value", () -> testPublicKeyPem);
        registry.add("wiremock.port", () -> wireMockServer.port());
    }

    private String generateToken(String subject, String role, String email, boolean expired) throws Exception {
        JWSSigner signer = new RSASSASigner(privateKey);
        Date expiry = expired ? new Date(System.currentTimeMillis() - 3600000) : new Date(System.currentTimeMillis() + 3600000);
        
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(subject)
                .claim("role", role)
                .claim("email", email)
                .issuer("questly")
                .issueTime(new Date())
                .expirationTime(expiry)
                .build();
                
        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).build(),
                claimsSet);
                
        signedJWT.sign(signer);
        return signedJWT.serialize();
    }

    @Test
    public void testPermitAllRoutesWithoutToken() {
        stubFor(get(urlEqualTo("/api/auth/login"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"status\":\"success\"}")));

        webTestClient.get()
                .uri("/api/auth/login")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("success");
    }

    @Test
    public void testAuthenticatedRoutesWithoutToken() {
        webTestClient.get()
                .uri("/api/courses")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    public void testAuthenticatedRoutesWithInvalidToken() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        RSAPrivateKey differentPrivateKey = (RSAPrivateKey) kpg.generateKeyPair().getPrivate();
        
        JWSSigner signer = new RSASSASigner(differentPrivateKey);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject("hacker-123")
                .claim("role", "STUDENT")
                .issuer("questly")
                .expirationTime(new Date(System.currentTimeMillis() + 3600000))
                .build();
        SignedJWT signedJWT = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).build(), claimsSet);
        signedJWT.sign(signer);
        String invalidToken = signedJWT.serialize();

        webTestClient.get()
                .uri("/api/courses")
                .header("Authorization", "Bearer " + invalidToken)
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    public void testAuthenticatedRoutesWithExpiredToken() throws Exception {
        String expiredToken = generateToken("student-123", "STUDENT", "student@questly.edu", true);

        webTestClient.get()
                .uri("/api/courses")
                .header("Authorization", "Bearer " + expiredToken)
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    public void testStudentAllowedRoutesWithHeaderPropagation() throws Exception {
        String token = generateToken("student-123", "STUDENT", "student@questly.edu", false);

        stubFor(get(urlEqualTo("/api/courses"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("[]")));

        webTestClient.get()
                .uri("/api/courses")
                .header("Authorization", "Bearer " + token)
                .header("X-User-Timezone", "Asia/Kolkata")
                .exchange()
                .expectStatus().isOk();

        verify(getRequestedFor(urlEqualTo("/api/courses"))
                .withHeader("X-User-Id", equalTo("student-123"))
                .withHeader("X-User-Role", equalTo("STUDENT"))
                .withHeader("X-User-Timezone", equalTo("Asia/Kolkata")));
    }

    @Test
    public void testStudentBlockedFromTutorRoutes() throws Exception {
        String token = generateToken("student-123", "STUDENT", "student@questly.edu", false);

        webTestClient.post()
                .uri("/api/courses")
                .header("Authorization", "Bearer " + token)
                .exchange()
                .expectStatus().isForbidden();

        verify(0, postRequestedFor(urlEqualTo("/api/courses")));
    }

    @Test
    public void testTutorAllowedOnTutorRoutes() throws Exception {
        String token = generateToken("tutor-456", "TUTOR", "tutor@questly.edu", false);

        stubFor(post(urlEqualTo("/api/courses"))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withBody("{\"id\":\"course-1\"}")));

        webTestClient.post()
                .uri("/api/courses")
                .header("Authorization", "Bearer " + token)
                .header("X-User-Timezone", "America/New_York")
                .exchange()
                .expectStatus().isCreated();

        verify(postRequestedFor(urlEqualTo("/api/courses"))
                .withHeader("X-User-Id", equalTo("tutor-456"))
                .withHeader("X-User-Role", equalTo("TUTOR"))
                .withHeader("X-User-Timezone", equalTo("America/New_York")));
    }

    @Test
    public void testStudentBlockedFromAnalytics() throws Exception {
        String token = generateToken("student-123", "STUDENT", "student@questly.edu", false);

        webTestClient.get()
                .uri("/api/analytics/students/student-123")
                .header("Authorization", "Bearer " + token)
                .exchange()
                .expectStatus().isForbidden();

        verify(0, getRequestedFor(urlEqualTo("/api/analytics/students/student-123")));
    }

    @Test
    public void testTutorAllowedOnAnalytics() throws Exception {
        String token = generateToken("tutor-456", "TUTOR", "tutor@questly.edu", false);

        stubFor(get(urlEqualTo("/api/analytics/students/student-123"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody("{\"xp\":120}")));

        webTestClient.get()
                .uri("/api/analytics/students/student-123")
                .header("Authorization", "Bearer " + token)
                .exchange()
                .expectStatus().isOk();

        verify(getRequestedFor(urlEqualTo("/api/analytics/students/student-123"))
                .withHeader("X-User-Id", equalTo("tutor-456"))
                .withHeader("X-User-Role", equalTo("TUTOR")));
    }
}
