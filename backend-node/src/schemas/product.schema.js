const {
  z,
  uuid,
  nonNegativeNumber,
  optionalText,
  mapAliases,
  paginationSchema
} = require('./helpers');

const productAliases = {
  filamentoId: ['filamento_id'],
  pesoG: ['peso_g'],
  tempoImpressaoH: ['tempo_impressao_h'],
  custoProducao: ['custo_producao'],
  precoVenda: ['preco_venda'],
  imagemUrl: ['imagem_url']
};

const skuField = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.string().trim().min(1).max(80).nullable()
);
const imageField = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.string().trim().url('imagemUrl deve ser uma URL válida.').max(2_000).nullable()
);
const filamentIdField = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  uuid.nullable()
);

const createProductSchema = z.preprocess(
  (input) => mapAliases(input, productAliases),
  z.object({
    nome: z.string().trim().min(2).max(160),
    categoria: z.string().trim().min(1).max(100).default('Sem categoria'),
    filamentoId: filamentIdField.default(null),
    pesoG: nonNegativeNumber.default(0),
    tempoImpressaoH: nonNegativeNumber.default(0),
    custoProducao: nonNegativeNumber.optional(),
    precoVenda: nonNegativeNumber.default(0),
    estoque: z.coerce.number().int().min(0).default(0),
    imagemUrl: imageField.default(null),
    ativo: z.coerce.boolean().default(true)
  })
);

const updateProductSchema = z.preprocess(
  (input) => mapAliases(input, productAliases),
  z.object({
    nome: z.string().trim().min(2).max(160).optional(),
    categoria: z.string().trim().min(1).max(100).optional(),
    filamentoId: filamentIdField.optional(),
    pesoG: nonNegativeNumber.optional(),
    tempoImpressaoH: nonNegativeNumber.optional(),
    custoProducao: nonNegativeNumber.optional(),
    precoVenda: nonNegativeNumber.optional(),
    estoque: z.coerce.number().int().min(0).optional(),
    imagemUrl: imageField.optional(),
    ativo: z.coerce.boolean().optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo para atualizar.'
  })
);

const productListSchema = paginationSchema({
  busca: optionalText,
  categoria: optionalText,
  filamentoId: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    uuid.optional()
  ),
  ativo: z.enum(['true', 'false']).transform((value) => value === 'true').optional()
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productListSchema,
  productAliases
};
