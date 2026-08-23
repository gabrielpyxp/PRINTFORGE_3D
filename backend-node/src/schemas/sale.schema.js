const {
  z,
  uuid,
  nonNegativeNumber,
  positiveInteger,
  optionalText,
  mapAliases,
  paginationSchema
} = require('./helpers');

const autoProductSchema = z.preprocess(
  (input) => mapAliases(input, {
    filamentoId: ['filamento_id'],
    pesoG: ['peso_g'],
    tempoImpressaoH: ['tempo_impressao_h'],
    custoProducao: ['custo_producao'],
    precoVenda: ['preco_venda'],
    imagemUrl: ['imagem_url'],
    estoqueInicial: ['estoque_inicial']
  }),
  z.object({
    nome: z.string().trim().min(2).max(160).optional(),
    sku: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      z.string().trim().min(1).max(80).nullable()
    ).default(null),
    categoria: z.string().trim().min(1).max(100).default('Sem categoria'),
    filamentoId: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      uuid.nullable()
    ).default(null),
    pesoG: nonNegativeNumber.default(0),
    tempoImpressaoH: nonNegativeNumber.default(0),
    custoProducao: nonNegativeNumber.default(0),
    precoVenda: nonNegativeNumber.optional(),
    estoqueInicial: z.coerce.number().int().min(0).optional(),
    imagemUrl: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      z.string().trim().url().max(2_000).nullable()
    ).default(null)
  })
);

const createSaleSchema = z.preprocess(
  (input) => mapAliases(input, {
    produtoId: ['produto_id'],
    nomeProduto: ['nome_produto', 'nome'],
    precoUnitario: ['preco_unitario'],
    margemLucroAplicada: ['margem_lucro_aplicada'],
    dataVenda: ['data_venda'],
    novoProduto: ['novo_produto']
  }),
  z.object({
    produtoId: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      uuid.optional()
    ),
    sku: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      z.string().trim().min(1).max(80).optional()
    ),
    nomeProduto: z.preprocess(
      (value) => (value === '' || value === undefined ? undefined : value),
      z.string().trim().min(2).max(160).optional()
    ),
    quantidade: positiveInteger,
    precoUnitario: nonNegativeNumber,
    margemLucroAplicada: nonNegativeNumber.default(0),
    dataVenda: z.coerce.date().optional(),
    novoProduto: autoProductSchema.optional()
  }).superRefine((value, ctx) => {
    if (!value.produtoId && !value.sku && !value.nomeProduto && !value.novoProduto?.nome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe produtoId, sku, nomeProduto ou novoProduto.nome.',
        path: ['produtoId']
      });
    }
  })
);

const salesListSchema = paginationSchema({
  produtoId: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    uuid.optional()
  ),
  produto: optionalText,
  dataInicial: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.date().optional()
  ),
  dataFinal: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.date().optional()
  ),
  valorMin: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    nonNegativeNumber.optional()
  ),
  valorMax: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    nonNegativeNumber.optional()
  )
}).refine((value) => !value.dataInicial || !value.dataFinal || value.dataInicial <= value.dataFinal, {
  message: 'dataInicial deve ser anterior ou igual a dataFinal.',
  path: ['dataInicial']
});

module.exports = { createSaleSchema, salesListSchema };
