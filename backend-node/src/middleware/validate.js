const { ApiError } = require('../utils/api-error');

function validate(schema, property = 'body') {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[property]);
    if (!parsed.success) {
      return next(new ApiError(422, 'Dados de entrada inválidos.', parsed.error.flatten()));
    }
    req[property] = parsed.data;
    return next();
  };
}

module.exports = { validate };
