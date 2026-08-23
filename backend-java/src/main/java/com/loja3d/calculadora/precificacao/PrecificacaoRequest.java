package com.loja3d.calculadora.precificacao;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Valores monetários devem ser enviados em reais, sem formatação de moeda.
 * Os limites de dígitos impedem entradas desproporcionais sem restringir a margem de lucro configurável.
 */
public record PrecificacaoRequest(
        @NotNull(message = "pesoFilamentoG é obrigatório")
        @Positive(message = "pesoFilamentoG deve ser maior que zero")
        @Digits(integer = 12, fraction = 6, message = "pesoFilamentoG aceita até 12 dígitos inteiros e 6 decimais")
        BigDecimal pesoFilamentoG,

        @NotNull(message = "custoFilamentoPorKg é obrigatório")
        @PositiveOrZero(message = "custoFilamentoPorKg não pode ser negativo")
        @Digits(integer = 12, fraction = 6, message = "custoFilamentoPorKg aceita até 12 dígitos inteiros e 6 decimais")
        BigDecimal custoFilamentoPorKg,

        @NotNull(message = "tempoImpressaoH é obrigatório")
        @PositiveOrZero(message = "tempoImpressaoH não pode ser negativo")
        @Digits(integer = 12, fraction = 6, message = "tempoImpressaoH aceita até 12 dígitos inteiros e 6 decimais")
        BigDecimal tempoImpressaoH,

        @NotNull(message = "potenciaImpressoraW é obrigatório")
        @PositiveOrZero(message = "potenciaImpressoraW não pode ser negativa")
        @Digits(integer = 12, fraction = 6, message = "potenciaImpressoraW aceita até 12 dígitos inteiros e 6 decimais")
        BigDecimal potenciaImpressoraW,

        @NotNull(message = "custoKwh é obrigatório")
        @PositiveOrZero(message = "custoKwh não pode ser negativo")
        @Digits(integer = 12, fraction = 6, message = "custoKwh aceita até 12 dígitos inteiros e 6 decimais")
        BigDecimal custoKwh,

        @NotNull(message = "margemLucroPercentual é obrigatória")
        @DecimalMin(value = "0.0", inclusive = true, message = "margemLucroPercentual não pode ser negativa")
        @Digits(integer = 12, fraction = 6, message = "margemLucroPercentual aceita até 12 dígitos inteiros e 6 decimais")
        BigDecimal margemLucroPercentual
) {
}
