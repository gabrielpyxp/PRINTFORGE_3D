const { query } = require('../db/pool');
const { ApiError } = require('../utils/api-error');

function toAtivo(row) {
  if (!row) return row;
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    valorPago: Number(row.valor_pago),
    dataAquisicao: row.data_aquisicao,
    criadoEm: row.criado_em,
  };
}

async function list(req, res) {
  const { page = 1, limit = 20, busca, tipo } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;
  if (busca) { conditions.push(`nome ILIKE $${idx}`); params.push(`%${busca}%`); idx++; }
  if (tipo) { conditions.push(`tipo = $${idx}`); params.push(tipo); idx++; }
  const where = conditions.length ? conditions.join(' AND ') : 'true';
  const count = await query(`SELECT COUNT(*) FROM ativos WHERE ${where}`, params);
  const total = parseInt(count.rows[0].count, 10);
  params.push(limit, (page - 1) * limit);
  const result = await query(`SELECT * FROM ativos WHERE ${where} ORDER BY criado_em DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  res.json({ items: result.rows.map(toAtivo), page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) });
}

async function create(req, res) {
  const { nome, tipo, valorPago, dataAquisicao } = req.body;
  const result = await query(
    `INSERT INTO ativos (nome, tipo, valor_pago, data_aquisicao) VALUES ($1,$2,$3,$4) RETURNING *`,
    [nome, tipo || 'Impressora 3D', valorPago, dataAquisicao || null]
  );
  res.status(201).json(toAtivo(result.rows[0]));
}

async function update(req, res) {
  const { id } = req.params;
  const { nome, tipo, valorPago, dataAquisicao } = req.body;
  const sets = [];
  const params = [id];
  let idx = 2;
  const map = { nome: 'nome', tipo: 'tipo', valorPago: 'valor_pago', dataAquisicao: 'data_aquisicao' };
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) { sets.push(`${col} = $${idx}`); params.push(req.body[key]); idx++; }
  }
  if (!sets.length) throw new ApiError(400, 'Nenhum campo para atualizar');
  const result = await query(`UPDATE ativos SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, params);
  if (!result.rows.length) throw new ApiError(404, 'Ativo não encontrado');
  res.json(toAtivo(result.rows[0]));
}

async function remove(req, res) {
  const { id } = req.params;
  const result = await query('DELETE FROM ativos WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) throw new ApiError(404, 'Ativo não encontrado');
  res.status(204).send();
}

async function getById(req, res) {
  const { id } = req.params;
  const result = await query('SELECT * FROM ativos WHERE id = $1', [id]);
  if (!result.rows.length) throw new ApiError(404, 'Ativo não encontrado');
  res.json(toAtivo(result.rows[0]));
}

module.exports = { list, create, update, remove, getById };
