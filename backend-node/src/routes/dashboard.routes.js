const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { query } = require('../db/pool');
const { serializeProduct } = require('../utils/normalizers');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const [productsResult, salesResult, settingsResult, consignResult] = await Promise.all([
    query('SELECT * FROM produtos WHERE ativo = true'),
    query('SELECT * FROM vendas ORDER BY data_venda DESC LIMIT 100'),
    query('SELECT * FROM configuracoes LIMIT 1'),
    query("SELECT * FROM consignacoes WHERE status = 'Fechado'").catch(() => ({ rows: [] }))
  ]);

  const products = productsResult.rows.map(serializeProduct);
  const sales = salesResult.rows;
  const settings = settingsResult.rows[0] || { estoque_baixo_limite: 5 };
  const consignFechados = consignResult.rows || [];

  const lowLimit = Number(settings.estoque_baixo_limite || 5);
  const lowStock = products.filter(p => Number(p.estoque) <= lowLimit);

  const vendasRevenue = sales.reduce((sum, s) => sum + Number(s.preco_unitario) * Number(s.quantidade), 0);
  const vendasQty = sales.reduce((sum, s) => sum + Number(s.quantidade), 0);
  const vendasProfit = sales.reduce((sum, s) => {
    const product = products.find(p => p.id === s.produto_id);
    const unitCost = Number(product?.custo_producao || 0);
    return sum + ((Number(s.preco_unitario) - unitCost) * Number(s.quantidade));
  }, 0);

  // Consignados fechados: Venda Direta (imediata) + Acertos de consignação
  const consignRevenue = consignFechados.reduce((sum, c) => {
    const qtd = Number(c.quantidade_vendida || 0);
    const preco = Number(c.preco_unitario || 0);
    const comissao = Number(c.comissao_aplicada_perc || 0) / 100;
    return sum + qtd * preco * (1 - comissao);
  }, 0);
  const consignQty = consignFechados.reduce((sum, c) => sum + Number(c.quantidade_vendida || 0), 0);
  const consignProfit = consignRevenue; // líquido após comissão (custo de produção não vinculado ao lote)

  const totalRevenue = vendasRevenue + consignRevenue;
  const totalOrders = vendasQty + consignQty;
  const estimatedProfit = vendasProfit + consignProfit;

  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const vendasMes = sales
      .filter(s => new Date(s.data_venda) >= monthStart && new Date(s.data_venda) <= monthEnd)
      .reduce((sum, s) => sum + Number(s.preco_unitario) * Number(s.quantidade), 0);
    const consignMes = consignFechados
      .filter(c => {
        const d = c.data_acerto ? new Date(c.data_acerto) : null;
        return d && d >= monthStart && d <= monthEnd;
      })
      .reduce((sum, c) => sum + Number(c.quantidade_vendida || 0) * Number(c.preco_unitario || 0) * (1 - Number(c.comissao_aplicada_perc || 0) / 100), 0);
    return vendasMes + consignMes;
  });

  const topProducts = [...products].map(p => ({
    ...p,
    sold: sales.filter(s => s.produto_id === p.id).reduce((sum, s) => sum + Number(s.quantidade), 0)
  })).sort((a, b) => b.sold - a.sold).slice(0, 4);

  // Vendas recentes unificadas (vendas + consignados fechados) ordenadas por data
  const consignRecentes = consignFechados
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      produto_nome: `[Consignado] ${c.descricao || 'Lote'}`,
      quantidade: c.quantidade_vendida,
      preco_unitario: Number(c.preco_unitario) * (1 - Number(c.comissao_aplicada_perc || 0) / 100),
      data_venda: c.data_acerto,
      origem: c.tipo_negociacao
    }));
  const vendasRecentes = sales.slice(0, 5).map(s => {
    const product = products.find(p => p.id === s.produto_id);
    return { ...s, produto_nome: product?.nome || s.produto_nome };
  });

  res.json({
    faturamento: totalRevenue,
    total_vendas: totalOrders,
    lucro_acumulado: estimatedProfit,
    estoque_baixo: lowStock.length,
    faturamento_mensal: monthlyRevenue,
    top_produtos: topProducts,
    vendas_recentes: vendasRecentes,
    // breakdown para UI opcional
    faturamento_vendas: vendasRevenue,
    faturamento_consignados: consignRevenue,
    vendas_consignados: consignQty
  });
}));

module.exports = router;