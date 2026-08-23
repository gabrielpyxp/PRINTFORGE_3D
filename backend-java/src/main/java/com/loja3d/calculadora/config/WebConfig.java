package com.loja3d.calculadora.config;

import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableConfigurationProperties(CorsProperties.class)
public class WebConfig {

    @Bean
    CorsFilter corsFilter(CorsProperties properties) {
        List<String> allowedOrigins = properties.getAllowedOrigins().stream()
                .filter(origin -> origin != null && !origin.isBlank())
                .map(String::trim)
                .toList();

        if (allowedOrigins.isEmpty()) {
            throw new IllegalStateException("app.cors.allowed-origins deve conter ao menos uma origem");
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("POST", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Accept", "Origin"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3_600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return new CorsFilter(source);
    }
}
