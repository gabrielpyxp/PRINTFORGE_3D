const { query } = require('../db/pool');
const { normalizeProduct } = require('../utils/normalizers');

async function list(req, res) {
  const { busca, categoria, filamento, precoMax } = req.query;

  const conditions = ['ativo = true', 'estoque > 0'];
  const params = [];
  let idx = 1;

  if (busca) {
    conditions.push(`(nome ILIKE $${idx} OR categoria ILIKE $${idx} OR filamento_nome ILIKE $${idx})`);
    params.push(`%${busca}%`);
    idx++;
  }
  if (categoria) {
    conditions.push(`categoria = $${idx}`);
    params.push(categoria);
    idx++;
  }
  if (filamento) {
    conditions.push(`filamento_tipo = $${idx}`);
    params.push(filamento);
    idx++;
  }
  if (precoMax) {
    conditions.push(`preco_venda <= $${idx}`);
    params.push(precoMax);
    idx++;
  }

  const result = await query(
    `SELECT * FROM produtos WHERE ${conditions.join(' AND ')} ORDER BY criado_em DESC`,
    params
  );

  res.json({ items: result.rows.map(normalizeProduct) });
}

module.exports = { list };