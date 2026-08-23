const { z } = require('zod');

function mapAliases(input, aliases) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const mapped = { ...input };
  for (const [canonical, alternatives] of Object.entries(aliases)) {
    if (mapped[canonical] !== undefined) continue;
    for (const alternative of alternatives) {
      if (mapped[alternative] !== undefined) {
        mapped[canonical] = mapped[alternative];
        break;
      }
    }
  }
  return mapped;
}

function blankToNull(value) {
  return value === '' || value === undefined ? null : value;
}

const uuid = z.string().uuid('Deve ser um UUID válido.');
const nonNegativeNumber = z.coerce.number().finite().min(0, 'Não pode ser negativo.');
const positiveInteger = z.coerce.number().int().min(1, 'Deve ser um inteiro maior que zero.');
const optionalText = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.string().trim().min(1).max(160).optional()
);

function paginationSchema(shape = {}) {
  return z.object({
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(100).default(20),
    ...shape
  });
}

module.exports = {
  z,
  uuid,
  nonNegativeNumber,
  positiveInteger,
  optionalText,
  blankToNull,
  mapAliases,
  paginationSchema
};
