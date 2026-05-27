package com.questly.auth.kafka;

import com.questly.auth.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventProducer {

    private static final String TOPIC_USER_REGISTERED = "user.registered";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(UserRegisteredEvent event) {
        log.info("Publishing user.registered event for userId={}", event.getUserId());
        kafkaTemplate.send(TOPIC_USER_REGISTERED, event.getUserId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish user.registered event for userId={}", event.getUserId(), ex);
                    } else {
                        log.info("user.registered event published successfully for userId={}", event.getUserId());
                    }
                });
    }
}
