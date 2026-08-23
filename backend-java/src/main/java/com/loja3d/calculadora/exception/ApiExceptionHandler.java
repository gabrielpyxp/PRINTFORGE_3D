package com.loja3d.calculadora.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> tratarValidacao(MethodArgumentNotValidException exception) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : exception.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }

        return resposta(
                HttpStatus.BAD_REQUEST,
                "Dados inválidos",
                "Corrija os campos informados e tente novamente.",
                campos
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> tratarJsonInvalido(HttpMessageNotReadableException exception) {
        return resposta(
                HttpStatus.BAD_REQUEST,
                "JSON inválido",
                "Envie um corpo JSON válido com todos os campos numéricos necessários.",
                Map.of()
        );
    }

    private ResponseEntity<ApiError> resposta(
            HttpStatus status,
            String erro,
            String mensagem,
            Map<String, String> campos
    ) {
        ApiError corpo = new ApiError(Instant.now(), status.value(), erro, mensagem, campos);
        return ResponseEntity.status(status).body(corpo);
    }
}
