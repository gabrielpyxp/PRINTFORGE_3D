const { query } = require('../db/pool');
const { ApiError } = require('../utils/api-error');

function toSuprimento(row) {
  if (!row) return row;
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    cor: row.cor,
    pesoTotalG: Number(row.peso_total_g),
    pesoRestanteG: Number(row.peso_restante_g),
    valorPago: Number(row.valor_pago),
    criadoEm: row.criado_em,
  };
}

async function list(req, res) {
  try {
    const { page = 1, limit = 20, busca, tipo } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;
    if (busca) { conditions.push(`nome ILIKE $${idx}`); params.push(`%${busca}%`); idx++; }
    if (tipo) { conditions.push(`tipo = $${idx}`); params.push(tipo); idx++; }
    const where = conditions.length ? conditions.join(' AND ') : 'true';
    const count = await query(`SELECT COUNT(*) FROM suprimentos WHERE ${where}`, params);
    const total = parseInt(count.rows[0].count, 10);
    params.push(limit, (page - 1) * limit);
    const result = await query(`SELECT * FROM suprimentos WHERE ${where} ORDER BY criado_em DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ items: result.rows.map(toSuprimento), page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[Suprimentos.list] Erro:', error);
    return res.status(500).json({ error: error.message, detalhe: 'Falha ao listar suprimentos' });
  }
}

async function create(req, res) {
  try {
    const { nome, tipo, cor, pesoTotalG, valorPago } = req.body;
    const peso = Number(String(pesoTotalG).replace(',', '.')) || 0;
    const valor = Number(String(valorPago).replace(',', '.')) || 0;
    const result = await query(
      `INSERT INTO suprimentos (nome, tipo, cor, peso_total_g, peso_restante_g, valor_pago) VALUES ($1,$2,$3,$4,$4,$5) RETURNING *`,
      [nome, tipo || 'PLA', cor || null, peso, valor]
    );
    res.status(201).json(toSuprimento(result.rows[0]));
  } catch (error) {
    console.error('[Suprimentos.create] Erro ao inserir suprimento:', error);
    return res.status(500).json({ error: error.message, detalhe: 'Falha ao inserir suprimento' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const sets = [];
    const params = [id];
    let idx = 2;
    const map = { nome: 'nome', tipo: 'tipo', cor: 'cor', pesoTotalG: 'peso_total_g', pesoRestanteG: 'peso_restante_g', valorPago: 'valor_pago' };
    for (const [key, col] of Object.entries(map)) {
      if (req.body[key] !== undefined) {
        let val = req.body[key];
        if (key === 'pesoTotalG' || key === 'pesoRestanteG' || key === 'valorPago') val = Number(String(val).replace(',', '.')) || 0;
        sets.push(`${col} = $${idx}`); params.push(val); idx++;
      }
    }
    if (!sets.length) throw new ApiError(400, 'Nenhum campo para atualizar');
    const result = await query(`UPDATE suprimentos SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, params);
    if (!result.rows.length) throw new ApiError(404, 'Suprimento não encontrado');
    res.json(toSuprimento(result.rows[0]));
  } catch (error) {
    console.error('[Suprimentos.update] Erro:', error);
    if (error.status) throw error;
    return res.status(500).json({ error: error.message, detalhe: 'Falha ao atualizar suprimento' });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  const result = await query('DELETE FROM suprimentos WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) throw new ApiError(404, 'Suprimento não encontrado');
  res.status(204).send();
}

async function getById(req, res) {
  const { id } = req.params;
  const result = await query('SELECT * FROM suprimentos WHERE id = $1', [id]);
  if (!result.rows.length) throw new ApiError(404, 'Suprimento não encontrado');
  res.json(toSuprimento(result.rows[0]));
}

module.exports = { list, create, update, remove, getById };
