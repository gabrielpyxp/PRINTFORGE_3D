const { query, withTransaction } = require('../db/pool');
const { ApiError } = require('../utils/api-error');
const { serializeSale } = require('../utils/normalizers');

function buildWhere(filters) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (filters.produtoId) {
    conditions.push(`produto_id = $${idx}`);
    params.push(filters.produtoId);
    idx++;
  }
  if (filters.produto) {
    conditions.push(`produto_nome ILIKE $${idx}`);
    params.push(`%${filters.produto}%`);
    idx++;
  }
  if (filters.dataInicial) {
    conditions.push(`data_venda >= $${idx}`);
    params.push(filters.dataInicial);
    idx++;
  }
  if (filters.dataFinal) {
    conditions.push(`data_venda <= $${idx}`);
    params.push(filters.dataFinal);
    idx++;
  }
  if (filters.valorMin !== undefined) {
    conditions.push(`preco_unitario * quantidade >= $${idx}`);
    params.push(filters.valorMin);
    idx++;
  }
  if (filters.valorMax !== undefined) {
    conditions.push(`preco_unitario * quantidade <= $${idx}`);
    params.push(filters.valorMax);
    idx++;
  }

  return { where: conditions.length ? conditions.join(' AND ') : 'true', params };
}

async function list(req, res) {
  const { page = 1, limit = 20, ...filters } = req.query;
  const offset = (page - 1) * limit;

  const { where, params } = buildWhere(filters);
  const countParams = [...params];
  const countResult = await query(`SELECT COUNT(*) FROM vendas WHERE ${where}`, countParams);
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);
  const dataResult = await query(
    `SELECT * FROM vendas WHERE ${where} ORDER BY data_venda DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    items: dataResult.rows.map(serializeSale),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages: Math.ceil(total / limit)
  });
}

async function create(req, res) {
  const data = req.body;
  let produtoId = data.produtoId;
  let produtoCriado = false;

  const result = await withTransaction(async (client) => {
    // 1. Se produtoId não informado, tenta achar por SKU ou nome
    if (!produtoId) {
      if (data.sku) {
        const found = await client.query('SELECT id FROM produtos WHERE sku = $1', [data.sku]);
        if (found.rows.length) produtoId = found.rows[0].id;
      }
      if (!produtoId && data.nomeProduto) {
        const found = await client.query('SELECT id FROM produtos WHERE nome = $1', [data.nomeProduto]);
        if (found.rows.length) produtoId = found.rows[0].id;
      }
    }

    // 2. Se ainda não achou e tem novoProduto, cria
    if (!produtoId && data.novoProduto?.nome) {
      const np = data.novoProduto;
      const insert = await client.query(
        `INSERT INTO produtos (sku, nome, categoria, filamento_id, peso_g, tempo_impressao_h, custo_producao, preco_venda, estoque, imagem_url, ativo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
         RETURNING id`,
        [
          np.sku, np.nome, np.categoria, np.filamentoId,
          np.pesoG, np.tempoImpressaoH, np.custoProducao,
          np.precoVenda || data.precoUnitario, np.estoqueInicial || 0, np.imagemUrl
        ]
      );
      produtoId = insert.rows[0].id;
      produtoCriado = true;
    }

    if (!produtoId) {
      throw new ApiError(400, 'Produto não encontrado e dados insuficientes para criar');
    }

    // 3. Verifica estoque
    const prod = await client.query('SELECT estoque FROM produtos WHERE id = $1', [produtoId]);
    if (prod.rows[0].estoque < data.quantidade) {
      throw new ApiError(400, 'Estoque insuficiente');
    }

    // 4. Registra venda
    const venda = await client.query(
      `INSERT INTO vendas (produto_id, quantidade, preco_unitario, margem_lucro_aplicada, data_venda)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [produtoId, data.quantidade, data.precoUnitario, data.margemLucroAplicada || 0, data.dataVenda || new Date()]
    );

    // 5. Atualiza estoque
    await client.query(
      'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
      [data.quantidade, produtoId]
    );

    return { venda: venda.rows[0], produtoCriado };
  });

  res.status(201).json({
    ...serializeSale(result.venda),
    produto_criado: produtoCriado
  });
}

async function remove(req, res) {
  const { id } = req.params;

  const result = await query('DELETE FROM vendas WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Venda não encontrada');
  }

  res.status(204).send();
}

module.exports = { list, create, remove };