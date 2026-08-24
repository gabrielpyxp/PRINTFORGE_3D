const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { createSaleSchema, salesListSchema } = require('../schemas/sale.schema');
const saleController = require('../controllers/sale.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', validate(salesListSchema, 'query'), asyncHandler(saleController.list));
router.post('/', validate(createSaleSchema), asyncHandler(saleController.create));
router.delete('/:id', asyncHandler(saleController.remove));

module.exports = router;