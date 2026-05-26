package com.questly.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TokenMaskingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(TokenMaskingFilter.class);
    private static final String GOOGLE_TOKEN_HEADER = "X-Google-Access-Token";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpHeaders headers = exchange.getRequest().getHeaders();
        if (logger.isInfoEnabled()) {
            String path = exchange.getRequest().getPath().value();
            String method = exchange.getRequest().getMethod().name();
            logger.info("Incoming request: {} {}", method, path);
            
            headers.forEach((name, values) -> {
                if (GOOGLE_TOKEN_HEADER.equalsIgnoreCase(name)) {
                    logger.info("Header: {} = [MASKED]", name);
                } else {
                    logger.debug("Header: {} = {}", name, values);
                }
            });
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
