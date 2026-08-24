const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { createProductSchema, updateProductSchema, productListSchema, productAliases } = require('../schemas/product.schema');
const { mapAliases } = require('../schemas/helpers');
const productController = require('../controllers/product.controller');
const multer = require('multer');

const router = express.Router();
const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

router.use(requireAuth);

router.get('/', validate(productListSchema, 'query'), asyncHandler(productController.list));
router.post('/', validate(createProductSchema), asyncHandler(productController.create));
router.get('/:id', asyncHandler(productController.getById));
router.put('/:id', validate(updateProductSchema), asyncHandler(productController.update));
router.delete('/:id', asyncHandler(productController.remove));
router.post('/:id/image', upload.single('image'), asyncHandler(productController.uploadImage));

module.exports = router;