const { z, nonNegativeNumber, mapAliases } = require('./helpers');

const settingsSchema = z.preprocess(
  (input) => mapAliases(input, {
    custoKwh: ['custo_kwh'],
    margemLucroPadrao: ['margem_lucro_padrao'],
    potenciaImpressoraW: ['potencia_impressora_w']
  }),
  z.object({
    custoKwh: nonNegativeNumber.optional(),
    margemLucroPadrao: nonNegativeNumber.optional(),
    potenciaImpressoraW: nonNegativeNumber.optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos uma configuração para atualizar.'
  })
);

module.exports = { settingsSchema };
