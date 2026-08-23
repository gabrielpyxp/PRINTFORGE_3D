const { query } = require('../db/pool');
const { config } = require('../config/env');
const fetch = require('node-fetch');

async function callCalculatorService(payload) {
  if (!config.calculatorServiceUrl) {
    return calculateLocally(payload);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.calculatorTimeoutMs);

    const response = await fetch(`${config.calculatorServiceUrl}/calculo/precificacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (config.calculatorStrict) {
        throw new Error(`Calculator service returned ${response.status}`);
      }
      return calculateLocally(payload);
    }

    return await response.json();
  } catch (error) {
    if (config.calculatorStrict) {
      throw error;
    }
    return calculateLocally(payload);
  }
}

function calculateLocally({ pesoFilamentoG, custoFilamentoPorKg, tempoImpressaoH, potenciaImpressoraW, custoKwh, margemLucroPercentual }) {
  const pesoKg = pesoFilamentoG / 1000;
  const potenciaKw = potenciaImpressoraW / 1000;

  const custoFilamento = pesoKg * custoFilamentoPorKg;
  const custoEnergia = tempoImpressaoH * potenciaKw * custoKwh;
  const custoTotal = custoFilamento + custoEnergia;
  const valorLucro = custoTotal * (margemLucroPercentual / 100);
  const precoFinal = custoTotal + valorLucro;

  return {
    custoFilamento: Number(custoFilamento.toFixed(2)),
    custoEnergia: Number(custoEnergia.toFixed(2)),
    custoTotalProducao: Number(custoTotal.toFixed(2)),
    valorLucro: Number(valorLucro.toFixed(2)),
    precoFinalSugerido: Number(precoFinal.toFixed(2))
  };
}

async function calculate(req, res) {
  const payload = req.body;
  const result = await callCalculatorService(payload);
  res.json(result);
}

async function save(req, res) {
  const payload = req.body;
  const result = await callCalculatorService(payload);

  const saved = await query(
    `INSERT INTO calculos (produto_id, custo_filamento, custo_energia, margem_aplicada, preco_final)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [payload.produtoId || null, result.custoFilamento, result.custoEnergia, payload.margemLucroPercentual, result.precoFinalSugerido]
  );

  res.status(201).json(saved.rows[0]);
}

module.exports = { calculate, save };