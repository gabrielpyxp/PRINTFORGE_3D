package com.loja3d.calculadora.precificacao;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class PrecificacaoRequestValidationTest {

    private static jakarta.validation.ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void configurarValidador() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void encerrarValidador() {
        validatorFactory.close();
    }

    @Test
    void rejeitaPesoNegativoEMargemNegativa() {
        PrecificacaoRequest requisicao = new PrecificacaoRequest(
                new BigDecimal("-1"),
                new BigDecimal("80"),
                new BigDecimal("2"),
                new BigDecimal("120"),
                new BigDecimal("1"),
                new BigDecimal("-5")
        );

        Set<ConstraintViolation<PrecificacaoRequest>> violacoes = validator.validate(requisicao);

        assertThat(violacoes)
                .extracting(violacao -> violacao.getPropertyPath().toString())
                .contains("pesoFilamentoG", "margemLucroPercentual");
    }

    @Test
    void exigeTodosOsCampos() {
        PrecificacaoRequest requisicao = new PrecificacaoRequest(
                null, null, null, null, null, null
        );

        Set<ConstraintViolation<PrecificacaoRequest>> violacoes = validator.validate(requisicao);

        assertThat(violacoes).hasSize(6);
    }
}
