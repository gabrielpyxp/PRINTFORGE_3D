const express = require('express');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth');
const { settingsSchema } = require('../schemas/settings.schema');
const settingsController = require('../controllers/settings.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(settingsController.get));
router.put('/', validate(settingsSchema), asyncHandler(settingsController.update));

module.exports = router;