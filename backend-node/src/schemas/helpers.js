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

// Converte valores financeiros PT-BR (ex: "1.234,56" ou "12,50" ou "R$ 12,50") e EN (12.50) para número
function parseBRL(value) {
  if (value === '' || value == null) return value;
  if (typeof value === 'number') return value;
  let s = String(value).trim().replace(/\s/g, '').replace(/R\$/gi, '');
  // Se contém vírgula, é BR: remove pontos de milhar e troca vírgula por ponto; senão mantém ponto como decimal (input type=number)
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const cleaned = s.replace(/[^0-9.\-]/g, '');
  const parts = cleaned.split('.');
  const normalized = parts.length > 2 ? parts.slice(0, -1).join('') + '.' + parts.slice(-1)[0] : cleaned;
  const n = Number(normalized);
  return Number.isNaN(n) ? value : n;
}

const brlNonNegativeNumber = z.preprocess(parseBRL, z.coerce.number().finite().min(0, 'Não pode ser negativo.'));
const brlPositiveInteger = z.preprocess(parseBRL, z.coerce.number().int().min(1, 'Deve ser um inteiro maior que zero.'));
const nonNegativeNumber = brlNonNegativeNumber;
const positiveInteger = brlPositiveInteger;
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
  brlNonNegativeNumber,
  brlPositiveInteger,
  positiveInteger,
  optionalText,
  blankToNull,
  mapAliases,
  paginationSchema,
  parseBRL,
};
