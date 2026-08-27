const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { createAtivoSchema, updateAtivoSchema, ativoListSchema } = require('../schemas/ativo.schema');
const ctrl = require('../controllers/ativo.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/', validate(ativoListSchema, 'query'), asyncHandler(ctrl.list));
router.post('/', validate(createAtivoSchema), asyncHandler(ctrl.create));
router.get('/:id', asyncHandler(ctrl.getById));
router.put('/:id', validate(updateAtivoSchema), asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));
module.exports = router;
