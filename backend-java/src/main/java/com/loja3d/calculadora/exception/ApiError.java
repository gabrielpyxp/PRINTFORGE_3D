package com.loja3d.calculadora.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String erro,
        String mensagem,
        Map<String, String> campos
) {
}
