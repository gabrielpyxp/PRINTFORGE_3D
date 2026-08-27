const { app } = require('./app');
const { config, validateEnvironment } = require('./config/env');
const { pool } = require('./db/pool');

async function ensureMigrations() {
  try {
    // cria extensão e tabelas se não existirem (evita 500 em produção quando migration 003 não rodou)
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await pool.query(`ALTER TABLE produtos ALTER COLUMN imagem_url TYPE TEXT`);
  } catch (e) { /* ignora se tabela ainda não existe */ }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ativos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(160) NOT NULL,
        tipo VARCHAR(100) NOT NULL DEFAULT 'Impressora 3D',
        valor_pago NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
        data_aquisicao DATE,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS suprimentos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome VARCHAR(160) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        cor VARCHAR(80),
        peso_total_g NUMERIC(12,2) NOT NULL CHECK (peso_total_g >= 0),
        peso_restante_g NUMERIC(12,2) NOT NULL CHECK (peso_restante_g >= 0),
        valor_pago NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ativos_tipo ON ativos(tipo);
      CREATE INDEX IF NOT EXISTS idx_suprimentos_tipo ON suprimentos(tipo);
    `);
    console.log('Migrations garantidas: ativos/suprimentos e imagem_url TEXT');
  } catch (e) {
    console.error('Falha ao garantir migrations:', e.message);
  }
}

async function start() {
  validateEnvironment();
  await ensureMigrations();

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`API rodando na porta ${config.port} (liberada para nuvem!)`);
  });

  async function shutdown(signal) {
    console.log(`${signal} recebido: encerrando API.`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Não foi possível iniciar a API:', error.message);
  process.exit(1);
});
