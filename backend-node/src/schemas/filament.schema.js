const { z, optionalText, paginationSchema } = require('./helpers');

const filamentListSchema = paginationSchema({
  busca: optionalText,
  tipo: optionalText
});

module.exports = { filamentListSchema };
