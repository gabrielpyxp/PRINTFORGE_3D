const express = require('express');
const { body } = require('zod');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/async-handler');
const { ApiError } = require('../utils/api-error');
const { query, withTransaction } = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { loginSchema } = require('../schemas/auth.schema');

const router = express.Router();

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const result = await query(
    'SELECT id, nome, email, senha_hash, papel FROM usuarios WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Credenciais inválidas');
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(senha, user.senha_hash);

  if (!valid) {
    throw new ApiError(401, 'Credenciais inválidas');
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, papel: user.papel },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.json({
    token,
    user: { id: user.id, nome: user.nome, email: user.email, papel: user.papel }
  });
}));

module.exports = router;