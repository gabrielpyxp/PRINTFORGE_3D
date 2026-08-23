-- 001_initial_schema.sql
-- Schema inicial para Loja de Impressão 3D

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(160) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(50) NOT NULL DEFAULT 'admin',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de filamentos
CREATE TABLE filamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(160) NOT NULL,
    cor VARCHAR(80),
    tipo VARCHAR(50) NOT NULL,
    custo_kg NUMERIC(12,2) NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(80) UNIQUE,
    nome VARCHAR(160) NOT NULL,
    categoria VARCHAR(100) NOT NULL DEFAULT 'Sem categoria',
    filamento_id UUID REFERENCES filamentos(id) ON DELETE SET NULL,
    filamento_nome VARCHAR(160),
    filamento_tipo VARCHAR(50),
    peso_g NUMERIC(12,3) NOT NULL DEFAULT 0,
    tempo_impressao_h NUMERIC(12,3) NOT NULL DEFAULT 0,
    custo_producao NUMERIC(12,2) NOT NULL DEFAULT 0,
    preco_venda NUMERIC(12,2) NOT NULL DEFAULT 0,
    estoque INTEGER NOT NULL DEFAULT 0,
    imagem_url VARCHAR(2000),
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(12,2) NOT NULL CHECK (preco_unitario >= 0),
    margem_lucro_aplicada NUMERIC(12,2) NOT NULL DEFAULT 0,
    data_venda TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    produto_nome VARCHAR(160)
);

-- Tabela de cálculos de precificação
CREATE TABLE calculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    custo_filamento NUMERIC(12,2) NOT NULL DEFAULT 0,
    custo_energia NUMERIC(12,2) NOT NULL DEFAULT 0,
    custo_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    margem_aplicada NUMERIC(12,2) NOT NULL DEFAULT 0,
    valor_lucro NUMERIC(12,2) NOT NULL DEFAULT 0,
    preco_final NUMERIC(12,2) NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de configurações (singleton)
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custo_kwh NUMERIC(6,4) NOT NULL DEFAULT 0.98,
    margem_lucro_padrao NUMERIC(6,2) NOT NULL DEFAULT 180,
    potencia_impressora_w INTEGER NOT NULL DEFAULT 220,
    estoque_baixo_limite INTEGER NOT NULL DEFAULT 5,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_filamento_id ON produtos(filamento_id);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_vendas_produto_id ON vendas(produto_id);
CREATE INDEX idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX idx_calculos_produto_id ON calculos(produto_id);

-- Inserir configuração padrão
INSERT INTO configuracoes (custo_kwh, margem_lucro_padrao, potencia_impressora_w, estoque_baixo_limite)
VALUES (0.98, 180, 220, 5)
ON CONFLICT DO NOTHING;