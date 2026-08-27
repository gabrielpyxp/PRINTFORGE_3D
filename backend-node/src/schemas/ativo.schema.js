const { z, nonNegativeNumber, optionalText, paginationSchema } = require('./helpers');

const createAtivoSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  tipo: z.string().trim().min(1).max(100).default('Impressora 3D'),
  valorPago: nonNegativeNumber,
  dataAquisicao: z.preprocess(
    (v) => {
      if (v === '' || v == null) return undefined;
      // aceita YYYY-MM-DD do <input type="date">
      const d = new Date(v);
      return isNaN(d.getTime()) ? undefined : d;
    },
    z.coerce.date().optional()
  ),
});

const updateAtivoSchema = z.object({
  nome: z.string().trim().min(2).max(160).optional(),
  tipo: z.string().trim().min(1).max(100).optional(),
  valorPago: nonNegativeNumber.optional(),
  dataAquisicao: z.preprocess(
    (v) => {
      if (v === '' || v == null) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    },
    z.coerce.date().nullable().optional()
  ),
}).refine((v) => Object.keys(v).length > 0, { message: 'Informe ao menos um campo.' });

const ativoListSchema = paginationSchema({
  busca: optionalText,
  tipo: optionalText,
});

module.exports = { createAtivoSchema, updateAtivoSchema, ativoListSchema };
