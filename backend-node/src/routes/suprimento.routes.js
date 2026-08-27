const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { createSuprimentoSchema, updateSuprimentoSchema, suprimentoListSchema } = require('../schemas/suprimento.schema');
const ctrl = require('../controllers/suprimento.controller');

const router = express.Router();
router.use(requireAuth);
router.get('/', validate(suprimentoListSchema, 'query'), asyncHandler(ctrl.list));
router.post('/', validate(createSuprimentoSchema), asyncHandler(ctrl.create));
router.get('/:id', asyncHandler(ctrl.getById));
router.put('/:id', validate(updateSuprimentoSchema), asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));
module.exports = router;
