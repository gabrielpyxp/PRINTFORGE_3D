const { app } = require('./app');
const { config, validateEnvironment } = require('./config/env');
const { pool } = require('./db/pool');

async function start() {
  validateEnvironment();
  await pool.query('SELECT 1');

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
