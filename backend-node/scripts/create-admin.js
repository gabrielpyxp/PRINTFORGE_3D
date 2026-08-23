const { config, validateEnvironment } = require('../src/config/env');
const { pool, query } = require('../src/db/pool');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  validateEnvironment();

  const email = process.env.ADMIN_EMAIL || 'admin@printforge.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Administrador';

  const hashed = await bcrypt.hash(password, 12);

  try {
    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Usuário administrador já existe:', email);
      return;
    }

    await query(
      'INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1, $2, $3, $4)',
      [name, email, hashed, 'admin']
    );

    console.log('Administrador criado com sucesso!');
    console.log('Email:', email);
    console.log('Senha:', password);
  } catch (error) {
    console.error('Erro ao criar administrador:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();