const crypto = require('crypto');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { config } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error-handler');

const app = express();

const configuredOrigins = config.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(helmet());
app.use(cors({
  origin: configuredOrigins.includes('*') ? true : configuredOrigins,
  credentials: !configuredOrigins.includes('*')
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'loja-impressao-3d-api' });
});
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
