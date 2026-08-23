package com.loja3d.calculadora.precificacao;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/calculo", produces = MediaType.APPLICATION_JSON_VALUE)
public class PrecificacaoController {

    private final PrecificacaoService precificacaoService;

    public PrecificacaoController(PrecificacaoService precificacaoService) {
        this.precificacaoService = precificacaoService;
    }

    @PostMapping(value = "/precificacao", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PrecificacaoResponse calcular(@Valid @RequestBody PrecificacaoRequest requisicao) {
        return precificacaoService.calcular(requisicao);
    }
}
