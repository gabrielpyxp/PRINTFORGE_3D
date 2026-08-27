const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}, token) {
  const response = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.message || 'Não foi possível concluir esta ação.', response.status);
  }
  return payload.data ?? payload;
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  dashboard: (token) => request('/dashboard', {}, token),
  products: (params, token) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value !== '' && value !== undefined));
    return request('/produtos' + (query.size ? '?' + query.toString() : ''), {}, token);
  },
  createProduct: (body, token) => request('/produtos', { method: 'POST', body: JSON.stringify(body) }, token),
  updateProduct: (id, body, token) => request('/produtos/' + id, { method: 'PUT', body: JSON.stringify(body) }, token),
  deleteProduct: (id, token) => request('/produtos/' + id, { method: 'DELETE' }, token),
  sales: (params, token) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value !== '' && value !== undefined));
    return request('/vendas' + (query.size ? '?' + query.toString() : ''), {}, token);
  },
  createSale: (body, token) => request('/vendas', { method: 'POST', body: JSON.stringify(body) }, token),
  deleteSale: (id, token) => request('/vendas/' + id, { method: 'DELETE' }, token),
  catalog: (params, token) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value !== '' && value !== undefined));
    return request('/catalogo' + (query.size ? '?' + query.toString() : ''), {}, token);
  },
  settings: (token) => request('/configuracoes', {}, token),
  saveSettings: (body, token) => request('/configuracoes', { method: 'PUT', body: JSON.stringify(body) }, token),
  price: (body, token) => request('/calculos/precificacao', { method: 'POST', body: JSON.stringify(body) }, token),
  saveCalculation: (body, token) => request('/calculos', { method: 'POST', body: JSON.stringify(body) }, token)
};
