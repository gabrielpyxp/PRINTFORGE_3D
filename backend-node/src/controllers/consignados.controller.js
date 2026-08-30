const db = require('../db');

// Listar parceiros e seus lotes
const getConsignados = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.id as parceiro_id, p.nome as loja, p.telefone, p.comissao_padrao, p.frequencia_acerto,
        COALESCE(
          json_agg(c.*) FILTER (WHERE c.id IS NOT NULL), '[]'
        ) as lotes
      FROM parceiros p
      LEFT JOIN consignacoes c ON p.id = c.parceiro_id
      GROUP BY p.id
      ORDER BY p.criado_em DESC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Cadastrar nova loja/parceiro
const createParceiro = async (req, res, next) => {
  try {
    const { nome, telefone, comissao_padrao, frequencia_acerto } = req.body;
    const query = `
      INSERT INTO parceiros (nome, telefone, comissao_padrao, frequencia_acerto)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nome, telefone, comissao_padrao || 30.00, frequencia_acerto || 'Mensal']);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// Registrar um novo lote (Consignação ou Venda Direta)
const createLote = async (req, res, next) => {
  try {
    const { parceiro_id, tipo_negociacao, descricao, quantidade_enviada, preco_unitario, comissao_aplicada_perc } = req.body;
    
    // Se for Venda Direta, já entra como vendido e fechado
    const status = tipo_negociacao === 'Venda Direta' ? 'Fechado' : 'Ativo';
    const quantidade_vendida = tipo_negociacao === 'Venda Direta' ? quantidade_enviada : 0;
    const data_acerto = tipo_negociacao === 'Venda Direta' ? new Date() : null;

    const query = `
      INSERT INTO consignacoes 
        (parceiro_id, tipo_negociacao, descricao, quantidade_enviada, quantidade_vendida, preco_unitario, comissao_aplicada_perc, status, data_acerto)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [parceiro_id, tipo_negociacao, descricao, quantidade_enviada, quantidade_vendida, preco_unitario, comissao_aplicada_perc, status, data_acerto];
    
    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// Fazer o acerto (Informar quantos venderam e fechar o lote)
const fecharAcerto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantidade_vendida } = req.body;
    
    const query = `
      UPDATE consignacoes
      SET quantidade_vendida = $1, status = 'Fechado', data_acerto = CURRENT_DATE
      WHERE id = $2 AND status = 'Ativo'
      RETURNING *;
    `;
    const { rows } = await db.query(query, [quantidade_vendida, id]);
    
    if (!rows.length) return res.status(404).json({ message: 'Lote não encontrado ou já fechado.' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConsignados,
  createParceiro,
  createLote,
  fecharAcerto
};