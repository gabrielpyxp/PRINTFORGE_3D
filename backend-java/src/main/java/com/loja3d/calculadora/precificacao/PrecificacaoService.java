package com.loja3d.calculadora.precificacao;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

@Service
public class PrecificacaoService {

    private static final int ESCALA_MONETARIA = 2;
    private static final RoundingMode ARREDONDAMENTO_MONETARIO = RoundingMode.HALF_UP;

    /**
     * Aplica as fórmulas de referência do projeto usando BigDecimal.
     * A conversão de g para kg e W para kW usa deslocamento decimal exato; cada etapa financeira é então
     * normalizada em centavos para que total, lucro e preço final permaneçam conciliáveis entre si.
     */
    public PrecificacaoResponse calcular(PrecificacaoRequest requisicao) {
        BigDecimal custoFilamento = monetario(
                requisicao.pesoFilamentoG()
                        .movePointLeft(3)
                        .multiply(requisicao.custoFilamentoPorKg())
        );

        BigDecimal custoEnergia = monetario(
                requisicao.tempoImpressaoH()
                        .multiply(requisicao.potenciaImpressoraW().movePointLeft(3))
                        .multiply(requisicao.custoKwh())
        );

        BigDecimal custoTotal = custoFilamento.add(custoEnergia);
        BigDecimal valorLucro = monetario(
                custoTotal.multiply(requisicao.margemLucroPercentual().movePointLeft(2))
        );
        BigDecimal precoFinal = custoTotal.add(valorLucro);

        return new PrecificacaoResponse(
                custoFilamento,
                custoEnergia,
                custoTotal,
                valorLucro,
                precoFinal
        );
    }

    private BigDecimal monetario(BigDecimal valor) {
        return valor.setScale(ESCALA_MONETARIA, ARREDONDAMENTO_MONETARIO);
    }
}
