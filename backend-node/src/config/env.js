const dotenv = require('dotenv');

dotenv.config();

function asBoolean(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: asNumber(process.env.PORT, 3001),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: asBoolean(process.env.DATABASE_SSL, process.env.NODE_ENV === 'production'),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  calculatorServiceUrl: process.env.CALCULATOR_SERVICE_URL || '',
  calculatorTimeoutMs: asNumber(process.env.CALCULATOR_TIMEOUT_MS, 3000),
  calculatorStrict: asBoolean(process.env.CALCULATOR_STRICT, false)
});

function validateEnvironment() {
  const missing = [];
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.jwtSecret || config.jwtSecret.length < 32) missing.push('JWT_SECRET (mínimo de 32 caracteres)');

  if (missing.length) {
    throw new Error(`Variáveis de ambiente ausentes ou inválidas: ${missing.join(', ')}`);
  }
}

module.exports = { config, validateEnvironment };
