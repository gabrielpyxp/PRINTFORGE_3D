const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { calculationSchema } = require('../schemas/calculation.schema');
const calculationController = require('../controllers/calculation.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/precificacao', validate(calculationSchema), asyncHandler(calculationController.calculate));
router.post('/', validate(calculationSchema), asyncHandler(calculationController.save));

module.exports = router;