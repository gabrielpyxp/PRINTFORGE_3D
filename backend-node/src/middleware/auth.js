const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { ApiError } = require('../utils/api-error');

function requireAuth(req, _res, next) {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token de autenticação ausente.'));
  }

  try {
    req.user = jwt.verify(authorization.slice(7), config.jwtSecret);
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Token de autenticação inválido ou expirado.'));
  }
}

function requireAdmin(req, _res, next) {
  if (req.user?.papel !== 'admin') {
    return next(new ApiError(403, 'Apenas administradores podem acessar este recurso.'));
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
