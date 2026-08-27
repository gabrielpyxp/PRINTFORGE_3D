const { z, nonNegativeNumber, optionalText, paginationSchema } = require('./helpers');

const createAtivoSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  tipo: z.string().trim().min(1).max(100).default('Impressora 3D'),
  valorPago: nonNegativeNumber,
  dataAquisicao: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce.date().optional()
  ),
});

const updateAtivoSchema = z.object({
  nome: z.string().trim().min(2).max(160).optional(),
  tipo: z.string().trim().min(1).max(100).optional(),
  valorPago: nonNegativeNumber.optional(),
  dataAquisicao: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce.date().nullable().optional()
  ),
}).refine((v) => Object.keys(v).length > 0, { message: 'Informe ao menos um campo.' });

const ativoListSchema = paginationSchema({
  busca: optionalText,
  tipo: optionalText,
});

module.exports = { createAtivoSchema, updateAtivoSchema, ativoListSchema };
