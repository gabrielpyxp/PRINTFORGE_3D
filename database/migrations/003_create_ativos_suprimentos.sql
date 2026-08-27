-- 003: controle de ativos (impressoras) e suprimentos (filamentos) para ROI e estoque em gramas

CREATE TABLE ativos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(160) NOT NULL,
  tipo VARCHAR(100) NOT NULL DEFAULT 'Impressora 3D',
  valor_pago NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
  data_aquisicao DATE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suprimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(160) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- PLA / ABS / PETG etc
  cor VARCHAR(80),
  peso_total_g NUMERIC(12,2) NOT NULL CHECK (peso_total_g >= 0),
  peso_restante_g NUMERIC(12,2) NOT NULL CHECK (peso_restante_g >= 0),
  valor_pago NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ativos_tipo ON ativos(tipo);
CREATE INDEX idx_suprimentos_tipo ON suprimentos(tipo);
CREATE INDEX idx_suprimentos_restante ON suprimentos(peso_restante_g);
