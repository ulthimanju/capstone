package com.questly.gateway.filter;

import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;

/**
 * Propagates authenticated user identity (X-User-Id, X-User-Role) from the
 * validated JWT downstream to all backend microservices.
 * Runs at HIGHEST_PRECEDENCE + 1, just after the TokenMaskingFilter.
 */
@Component
public class RolePropagationFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return exchange.getPrincipal()
                .cast(JwtAuthenticationToken.class)
                .flatMap(auth -> {
                    var jwt = auth.getToken();
                    ServerHttpRequest mutated = exchange.getRequest().mutate()
                            .header("X-User-Id",   jwt.getSubject())
                            .header("X-User-Role", jwt.getClaimAsString("role"))
                            .build();
                    return chain.filter(exchange.mutate().request(mutated).build());
                })
                // Pass through unauthenticated requests (public routes like /api/auth/**)
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        // Run just after JwtBlacklistFilter (Ordered.HIGHEST_PRECEDENCE + 1)
        return Ordered.HIGHEST_PRECEDENCE + 2;
    }
}
