const { ZodError } = require('zod');
const { ApiError } = require('../utils/api-error');
const { config } = require('../config/env');

function notFound(req, _res, next) {
  next(new ApiError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, req, res, _next) {
  const requestId = req.id;
  let status = error.status || 500;
  let message = error.message || 'Erro interno do servidor.';
  let details = error.details;

  if (error instanceof ZodError) {
    status = 422;
    message = 'Dados de entrada inválidos.';
    details = error.flatten();
  }

  // Códigos PostgreSQL relevantes sem expor SQL ou conexão ao cliente.
  if (error.code === '23505') {
    status = 409;
    message = 'Já existe um registro com estes dados únicos.';
  } else if (error.code === '23503') {
    status = 409;
    message = 'O registro informado é referenciado por outro dado ou não existe.';
  } else if (error.code === '23514') {
    status = 422;
    message = 'Um valor não atende às regras do banco de dados.';
  } else if (error.code === '22P02') {
    status = 422;
    message = 'Um identificador ou valor possui formato inválido.';
  }

  if (status >= 500) {
    console.error(`[${requestId}]`, error);
    message = 'Erro interno do servidor.';
    details = undefined;
  }

  res.status(status).json({
    error: {
      message,
      ...(details ? { details } : {}),
      requestId,
      ...(config.nodeEnv !== 'production' && status >= 500 ? { debug: error.message } : {})
    }
  });
}

module.exports = { notFound, errorHandler };
