const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const catalogController = require('../controllers/catalog.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(catalogController.list));

module.exports = router;