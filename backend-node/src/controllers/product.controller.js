const { query, withTransaction } = require('../db/pool');
const { ApiError } = require('../utils/api-error');
const { serializeProduct } = require('../utils/normalizers');
const { config } = require('../config/env');

function buildWhere(filters) {
  const conditions = ['ativo = true'];
  const params = [];
  let idx = 1;

  if (filters.busca) {
    conditions.push(`(nome ILIKE $${idx} OR sku ILIKE $${idx})`);
    params.push(`%${filters.busca}%`);
    idx++;
  }
  if (filters.categoria) {
    conditions.push(`categoria = $${idx}`);
    params.push(filters.categoria);
    idx++;
  }
  if (filters.filamentoId) {
    conditions.push(`filamento_id = $${idx}`);
    params.push(filters.filamentoId);
    idx++;
  }
  if (filters.ativo !== undefined) {
    conditions.push(`ativo = $${idx}`);
    params.push(filters.ativo);
    idx++;
  }

  return { where: conditions.join(' AND '), params };
}

async function list(req, res) {
  const { page = 1, limit = 20, ...filters } = req.query;
  const offset = (page - 1) * limit;

  const { where, params } = buildWhere(filters);
  const countParams = [...params];
  const countResult = await query(`SELECT COUNT(*) FROM produtos WHERE ${where}`, countParams);
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const dataResult = await query(
    `SELECT * FROM produtos WHERE ${where} ORDER BY criado_em DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    items: dataResult.rows.map(serializeProduct),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages: Math.ceil(total / limit)
  });
}

async function create(req, res) {
  const data = req.body;

  const result = await withTransaction(async (client) => {
    const insert = await client.query(
      `INSERT INTO produtos (sku, nome, categoria, filamento_id, peso_g, tempo_impressao_h, custo_producao, preco_venda, estoque, imagem_url, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        data.sku, data.nome, data.categoria, data.filamentoId,
        data.pesoG, data.tempoImpressaoH, data.custoProducao, data.precoVenda,
        data.estoque, data.imagemUrl, data.ativo
      ]
    );
    return insert.rows[0];
  });

  res.status(201).json(serializeProduct(result));
}

async function getById(req, res) {
  const { id } = req.params;
  const result = await query('SELECT * FROM produtos WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Produto não encontrado');
  }

  res.json(serializeProduct(result.rows[0]));
}

async function update(req, res) {
  const { id } = req.params;
  const data = req.body;

  const sets = [];
  const params = [id];
  let idx = 2;

 async function update(req, res) {
  const { id } = req.params;
  const data = req.body;

  const sets = [];
  const params = [id];
  let idx = 2;

  // COLE ESTE BLOCO ATUALIZADO AQUI DENTRO:
  const fieldMap = {
    sku: 'sku', 
    nome: 'nome', 
    categoria: 'categoria',
    filamentoId: 'filamento_id', 
    filamento_id: 'filamento_id',
    pesoG: 'peso_g', 
    peso_g: 'peso_g',
    tempoImpressaoH: 'tempo_impressao_h', 
    tempo_impressao_h: 'tempo_impressao_h',
    custoProducao: 'custo_producao', 
    custo_producao: 'custo_producao',
    precoVenda: 'preco_venda', 
    preco_venda: 'preco_venda',
    estoque: 'estoque',
    imagemUrl: 'imagem_url', 
    imagem_url: 'imagem_url', 
    ativo: 'ativo'
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      sets.push(`${column} = $${idx}`);
      params.push(data[key]);
      idx++;
    }
  }

  if (sets.length === 0) {
    throw new ApiError(400, 'Nenhum campo para atualizar');
  }

  const result = await query(
    `UPDATE produtos SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Produto não encontrado');
  }

  res.json(serializeProduct(result.rows[0]));
}

async function remove(req, res) {
  const { id } = req.params;

  const result = await query('DELETE FROM produtos WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Produto não encontrado');
  }

  res.status(204).send();
}

async function uploadImage(req, res) {
  const { id } = req.params;
  
  if (!req.file) {
    throw new ApiError(400, 'Nenhuma imagem enviada');
  }

  // Convert image to base64 data URL
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const result = await query(
    'UPDATE produtos SET imagem_url = $1 WHERE id = $2 RETURNING *',
    [base64Image, id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Produto não encontrado');
  }

  res.json(serializeProduct(result.rows[0]));
}

module.exports = { list, create, getById, update, remove, uploadImage };