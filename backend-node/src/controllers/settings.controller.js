const { query } = require('../db/pool');
const { ApiError } = require('../utils/api-error');

async function get(req, res) {
  const result = await query('SELECT * FROM configuracoes LIMIT 1');

  if (result.rows.length === 0) {
    return res.json({
      custo_kwh: 0.98,
      margem_lucro_padrao: 180,
      potencia_impressora_w: 220,
      estoque_baixo_limite: 5
    });
  }

  const row = result.rows[0];
  res.json({
    custo_kwh: Number(row.custo_kwh),
    margem_lucro_padrao: Number(row.margem_lucro_padrao),
    potencia_impressora_w: Number(row.potencia_impressora_w),
    estoque_baixo_limite: Number(row.estoque_baixo_limite)
  });
}

async function update(req, res) {
  // após mapAliases + zod, body vem em camelCase (custoKwh etc) mas também aceitamos snake_case para compat
  const custo_kwh = req.body.custo_kwh ?? req.body.custoKwh;
  const margem_lucro_padrao = req.body.margem_lucro_padrao ?? req.body.margemLucroPadrao;
  const potencia_impressora_w = req.body.potencia_impressora_w ?? req.body.potenciaImpressoraW;
  const estoque_baixo_limite = req.body.estoque_baixo_limite ?? req.body.estoqueBaixoLimite;

  const existing = await query('SELECT * FROM configuracoes LIMIT 1');

  let result;
  if (existing.rows.length === 0) {
    result = await query(
      `INSERT INTO configuracoes (custo_kwh, margem_lucro_padrao, potencia_impressora_w, estoque_baixo_limite)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [custo_kwh ?? 0.98, margem_lucro_padrao ?? 180, potencia_impressora_w ?? 220, estoque_baixo_limite ?? 5]
    );
  } else {
    const current = existing.rows[0];
    result = await query(
      `UPDATE configuracoes SET custo_kwh = $1, margem_lucro_padrao = $2, potencia_impressora_w = $3, estoque_baixo_limite = $4
       WHERE id = $5 RETURNING *`,
      [
        custo_kwh !== undefined ? custo_kwh : current.custo_kwh,
        margem_lucro_padrao !== undefined ? margem_lucro_padrao : current.margem_lucro_padrao,
        potencia_impressora_w !== undefined ? potencia_impressora_w : current.potencia_impressora_w,
        estoque_baixo_limite !== undefined ? estoque_baixo_limite : current.estoque_baixo_limite,
        existing.rows[0].id
      ]
    );
  }

  const row = result.rows[0];
  console.log('[DEBUG] Settings update result:', row);
  res.json({
    custo_kwh: Number(row.custo_kwh),
    margem_lucro_padrao: Number(row.margem_lucro_padrao),
    potencia_impressora_w: Number(row.potencia_impressora_w),
    estoque_baixo_limite: Number(row.estoque_baixo_limite)
  });
}

module.exports = { get, update };