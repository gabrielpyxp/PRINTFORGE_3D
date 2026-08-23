package com.loja3d.calculadora.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Externalized CORS settings for browser clients of this service. */
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    private List<String> allowedOrigins = new ArrayList<>();

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins == null ? new ArrayList<>() : new ArrayList<>(allowedOrigins);
    }
}
