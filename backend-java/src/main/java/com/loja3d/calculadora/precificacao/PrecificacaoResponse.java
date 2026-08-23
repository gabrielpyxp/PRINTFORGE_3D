package com.loja3d.calculadora.precificacao;

import java.math.BigDecimal;

/** Valores monetários em reais, normalizados em duas casas decimais. */
public record PrecificacaoResponse(
        BigDecimal custoFilamento,
        BigDecimal custoEnergia,
        BigDecimal custoTotalProducao,
        BigDecimal valorLucro,
        BigDecimal precoFinalSugerido
) {
}
