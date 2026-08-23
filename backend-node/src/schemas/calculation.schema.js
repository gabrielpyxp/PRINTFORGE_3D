const { z, uuid, nonNegativeNumber, mapAliases, paginationSchema } = require('./helpers');

const calculationAliases = {
  produtoId: ['produto_id'],
  pesoG: ['peso_g'],
  custoFilamentoKg: ['custo_filamento_kg', 'custoKg'],
  tempoImpressaoH: ['tempo_impressao_h'],
  potenciaImpressoraW: ['potencia_impressora_w'],
  custoKwh: ['custo_kwh'],
  margemLucro: ['margem_lucro', 'margemAplicada'],
  salvar: ['save']
};

const calculationSchema = z.preprocess(
  (input) => mapAliases(input, calculationAliases),
  z.object({
    produtoId: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      uuid.nullable()
    ).default(null),
    pesoG: nonNegativeNumber,
    custoFilamentoKg: nonNegativeNumber,
    tempoImpressaoH: nonNegativeNumber,
    potenciaImpressoraW: nonNegativeNumber.optional(),
    custoKwh: nonNegativeNumber.optional(),
    margemLucro: nonNegativeNumber.optional(),
    salvar: z.coerce.boolean().default(false)
  })
);

const calculationHistorySchema = paginationSchema({
  produtoId: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    uuid.optional()
  )
});

module.exports = { calculationSchema, calculationHistorySchema };
