const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const saleRoutes = require('./sale.routes');
const catalogRoutes = require('./catalog.routes');
const settingsRoutes = require('./settings.routes');
const calculationRoutes = require('./calculation.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/produtos', productRoutes);
router.use('/vendas', saleRoutes);
router.use('/catalogo', catalogRoutes);
router.use('/configuracoes', settingsRoutes);
router.use('/calculos', calculationRoutes);

module.exports = router;