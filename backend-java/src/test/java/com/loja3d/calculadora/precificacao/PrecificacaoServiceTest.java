package com.loja3d.calculadora.precificacao;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class PrecificacaoServiceTest {

    private final PrecificacaoService service = new PrecificacaoService();

    @Test
    void calculaPrecoComAsFormulasDeFilamentoEnergiaEMargem() {
        PrecificacaoRequest requisicao = new PrecificacaoRequest(
                new BigDecimal("120"),
                new BigDecimal("95"),
                new BigDecimal("6.5"),
                new BigDecimal("150"),
                new BigDecimal("0.95"),
                new BigDecimal("40")
        );

        PrecificacaoResponse resposta = service.calcular(requisicao);

        assertThat(resposta.custoFilamento()).isEqualByComparingTo("11.40");
        assertThat(resposta.custoEnergia()).isEqualByComparingTo("0.93");
        assertThat(resposta.custoTotalProducao()).isEqualByComparingTo("12.33");
        assertThat(resposta.valorLucro()).isEqualByComparingTo("4.93");
        assertThat(resposta.precoFinalSugerido()).isEqualByComparingTo("17.26");
    }

    @Test
    void aceitaCustosETempoNulosEmValorSemGerarPrecoNegativo() {
        PrecificacaoRequest requisicao = new PrecificacaoRequest(
                new BigDecimal("100"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );

        PrecificacaoResponse resposta = service.calcular(requisicao);

        assertThat(resposta.custoFilamento()).isEqualByComparingTo("0.00");
        assertThat(resposta.custoEnergia()).isEqualByComparingTo("0.00");
        assertThat(resposta.custoTotalProducao()).isEqualByComparingTo("0.00");
        assertThat(resposta.valorLucro()).isEqualByComparingTo("0.00");
        assertThat(resposta.precoFinalSugerido()).isEqualByComparingTo("0.00");
    }
}
