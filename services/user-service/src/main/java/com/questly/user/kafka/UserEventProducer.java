package com.questly.user.kafka;

import com.questly.user.event.UserRoleUpdatedEvent;
import com.questly.user.event.UserSuspendedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRoleUpdated(UserRoleUpdatedEvent event) {
        log.info("Publishing user.role-updated event for userId={}", event.getUserId());
        try {
            kafkaTemplate.send("user.role-updated", event.getUserId().toString(), event);
            log.info("user.role-updated event published successfully for userId={}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to publish user.role-updated event for userId={}", event.getUserId(), e);
        }
    }

    public void publishUserSuspended(UserSuspendedEvent event) {
        log.info("Publishing user.suspended event for userId={}", event.getUserId());
        try {
            kafkaTemplate.send("user.suspended", event.getUserId().toString(), event);
            log.info("user.suspended event published successfully for userId={}", event.getUserId());
        } catch (Exception e) {
            log.error("Failed to publish user.suspended event for userId={}", event.getUserId(), e);
        }
    }
}
