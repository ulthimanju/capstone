package com.questly.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Filter that checks the incoming JWT access token's JTI claim against a Redis blacklist.
 * Rejecting requests immediately if the token has been invalidated by a logout action.
 * Fail-open design: if Redis is unavailable, the request is allowed through with a logged warning.
 */
@Component
public class JwtBlacklistFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtBlacklistFilter.class);

    @Autowired(required = false)
    private ReactiveStringRedisTemplate redisTemplate;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (redisTemplate == null) {
            log.trace("ReactiveStringRedisTemplate is not configured or disabled, bypassing JWT blacklist check");
            return chain.filter(exchange);
        }

        return exchange.getPrincipal()
                .filter(principal -> principal instanceof JwtAuthenticationToken)
                .cast(JwtAuthenticationToken.class)
                .flatMap(auth -> {
                    String jti = auth.getToken().getId(); // Accesses the JTI claim (jti)
                    if (jti == null || jti.trim().isEmpty()) {
                        log.debug("Token principal does not contain a JTI claim, skipping blacklist check");
                        return chain.filter(exchange);
                    }

                    String blacklistKey = "blacklist:jwt:" + jti;
                    return redisTemplate.hasKey(blacklistKey)
                            .flatMap(isBlacklisted -> {
                                if (Boolean.TRUE.equals(isBlacklisted)) {
                                    log.warn("Blocked request to {} due to blacklisted JTI: {}", 
                                            exchange.getRequest().getPath().value(), jti);
                                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                                    return exchange.getResponse().setComplete();
                                }
                                return chain.filter(exchange);
                            })
                            .onErrorResume(err -> {
                                log.error("Redis connection or command error when checking blacklist for JTI {}; allowing request (fail-open)", 
                                        jti, err);
                                return chain.filter(exchange);
                            });
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        // Runs immediately after TokenMaskingFilter and before RolePropagationFilter
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
