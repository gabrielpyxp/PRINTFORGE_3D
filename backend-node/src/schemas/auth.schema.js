const { z } = require('./helpers');

const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.').max(255),
  senha: z.string().min(1, 'Informe a senha.').max(256)
});

module.exports = { loginSchema };
