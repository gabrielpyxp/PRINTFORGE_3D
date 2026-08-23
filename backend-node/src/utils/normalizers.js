function normalizeSku(value) {
  if (value === undefined || value === null || value === '') return null;
  return String(value).trim().toUpperCase();
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized || null;
}

function toNumber(value) {
  return value === null || value === undefined ? value : Number(value);
}

function serializeProduct(row) {
  if (!row) return row;
  return {
    id: row.id,
    sku: row.sku,
    nome: row.nome,
    categoria: row.categoria,
    filamentoId: row.filamento_id,
    filamentoNome: row.filamento_nome,
    filamentoTipo: row.filamento_tipo,
    filamentoCor: row.filamento_cor,
    pesoG: toNumber(row.peso_g),
    tempoImpressaoH: toNumber(row.tempo_impressao_h),
    custoProducao: toNumber(row.custo_producao),
    precoVenda: toNumber(row.preco_venda),
    estoque: Number(row.estoque),
    imagemUrl: row.imagem_url,
    ativo: row.ativo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function serializeFilament(row) {
  if (!row) return row;
  return {
    id: row.id,
    nome: row.nome,
    cor: row.cor,
    tipo: row.tipo,
    custoKg: toNumber(row.custo_kg),
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function serializeSale(row) {
  if (!row) return row;
  return {
    id: row.id,
    produtoId: row.produto_id,
    produtoNome: row.produto_nome,
    produtoSku: row.produto_sku,
    quantidade: Number(row.quantidade),
    precoUnitario: toNumber(row.preco_unitario),
    total: toNumber(row.total),
    margemLucroAplicada: toNumber(row.margem_lucro_aplicada),
    dataVenda: row.data_venda
  };
}

function serializeCalculation(row) {
  if (!row) return row;
  return {
    id: row.id,
    produtoId: row.produto_id,
    produtoNome: row.produto_nome,
    custoFilamento: toNumber(row.custo_filamento),
    custoEnergia: toNumber(row.custo_energia),
    custoTotal: toNumber(row.custo_total),
    margemAplicada: toNumber(row.margem_aplicada),
    valorLucro: toNumber(row.valor_lucro),
    precoFinal: toNumber(row.preco_final),
    criadoEm: row.criado_em
  };
}

function serializeSettings(row) {
  if (!row) return row;
  return {
    id: row.id,
    custoKwh: toNumber(row.custo_kwh),
    margemLucroPadrao: toNumber(row.margem_lucro_padrao),
    potenciaImpressoraW: toNumber(row.potencia_impressora_w),
    atualizadoEm: row.atualizado_em
  };
}

module.exports = {
  normalizeSku,
  normalizeOptionalString,
  serializeProduct,
  serializeFilament,
  serializeSale,
  serializeCalculation,
  serializeSettings
};
