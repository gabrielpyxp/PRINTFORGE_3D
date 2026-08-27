const { z, nonNegativeNumber, optionalText, paginationSchema } = require('./helpers');

const createSuprimentoSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  tipo: z.string().trim().min(1).max(50).default('PLA'),
  cor: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(80).optional()),
  pesoTotalG: nonNegativeNumber,
  valorPago: nonNegativeNumber,
});

const updateSuprimentoSchema = z.object({
  nome: z.string().trim().min(2).max(160).optional(),
  tipo: z.string().trim().min(1).max(50).optional(),
  cor: z.string().trim().max(80).optional().nullable(),
  pesoTotalG: nonNegativeNumber.optional(),
  pesoRestanteG: nonNegativeNumber.optional(),
  valorPago: nonNegativeNumber.optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'Informe ao menos um campo.' });

const suprimentoListSchema = paginationSchema({
  busca: optionalText,
  tipo: optionalText,
});

module.exports = { createSuprimentoSchema, updateSuprimentoSchema, suprimentoListSchema };
