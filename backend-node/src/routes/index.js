const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const saleRoutes = require('./sale.routes');
const catalogRoutes = require('./catalog.routes');
const settingsRoutes = require('./settings.routes');
const calculationRoutes = require('./calculation.routes');
const dashboardRoutes = require('./dashboard.routes');
const ativoRoutes = require('./ativo.routes');
const suprimentoRoutes = require('./suprimento.routes');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'PrintForge API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      produtos: '/api/produtos',
      vendas: '/api/vendas',
      catalogo: '/api/catalogo',
      configuracoes: '/api/configuracoes',
      calculos: '/api/calculos',
      dashboard: '/api/dashboard',
      ativos: '/api/ativos',
      suprimentos: '/api/suprimentos'
    }
  });
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PrintForge API' });
});

router.use('/auth', authRoutes);
router.use('/produtos', productRoutes);
router.use('/vendas', saleRoutes);
router.use('/catalogo', catalogRoutes);
router.use('/configuracoes', settingsRoutes);
router.use('/calculos', calculationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ativos', ativoRoutes);
router.use('/suprimentos', suprimentoRoutes);
router.use('/consignados', consignadosRoutes);

module.exports = router;