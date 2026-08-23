const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { createProductSchema, updateProductSchema, productListSchema, productAliases } = require('../schemas/product.schema');
const { mapAliases } = require('../schemas/helpers');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', validate(productListSchema), asyncHandler(productController.list));
router.post('/', validate(createProductSchema), asyncHandler(productController.create));
router.get('/:id', asyncHandler(productController.getById));
router.put('/:id', validate(updateProductSchema), asyncHandler(productController.update));
router.delete('/:id', asyncHandler(productController.remove));

module.exports = router;