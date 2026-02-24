import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth
export const authApi = {
  login: (data: { nome_usuario: string; senha: string }) =>
    api.post('/auth/login', data),
  register: (data: { nome: string; nome_usuario: string; email: string; senha: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Users
export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

// Origens
export const origensApi = {
  list: () => api.get('/origens'),
  get: (id: string) => api.get(`/origens/${id}`),
  create: (data: any) => api.post('/origens', data),
  update: (id: string, data: any) => api.patch(`/origens/${id}`, data),
  remove: (id: string) => api.delete(`/origens/${id}`),
  setPadrao: (id: string) => api.patch(`/origens/${id}/set-padrao`),
};

// Destinos
export const destinosApi = {
  list: () => api.get('/destinos'),
  get: (id: string) => api.get(`/destinos/${id}`),
  create: (data: any) => api.post('/destinos', data),
  update: (id: string, data: any) => api.patch(`/destinos/${id}`, data),
  remove: (id: string) => api.delete(`/destinos/${id}`),
  setPadrao: (id: string) => api.patch(`/destinos/${id}/set-padrao`),
};

// Etiquetas
export const etiquetasApi = {
  list: () => api.get('/etiquetas'),
  get: (id: string) => api.get(`/etiquetas/${id}`),
  create: (data: any) => api.post('/etiquetas', data),
  update: (id: string, data: any) => api.patch(`/etiquetas/${id}`, data),
  remove: (id: string) => api.delete(`/etiquetas/${id}`),
  setPadrao: (id: string) => api.patch(`/etiquetas/${id}/set-padrao`),
};

// Tipos Pagamento
export const tiposPagamentoApi = {
  list: () => api.get('/tipos-pagamento'),
  get: (id: string) => api.get(`/tipos-pagamento/${id}`),
  create: (data: any) => api.post('/tipos-pagamento', data),
  update: (id: string, data: any) => api.patch(`/tipos-pagamento/${id}`, data),
  remove: (id: string) => api.delete(`/tipos-pagamento/${id}`),
  setPadrao: (id: string, tipo: 'receita' | 'despesa') => api.patch(`/tipos-pagamento/${id}/set-padrao?tipo=${tipo}`),
};

// Lancamentos
export const lancamentosApi = {
  list: (params?: Record<string, string>) =>
    api.get('/lancamentos', { params }),
  get: (id: string) => api.get(`/lancamentos/${id}`),
  create: (data: any) => api.post('/lancamentos', data),
  update: (id: string, data: any) => api.patch(`/lancamentos/${id}`, data),
  remove: (id: string) => api.delete(`/lancamentos/${id}`),
};

// Dashboard
export const dashboardApi = {
  resumo: (params?: Record<string, string>) =>
    api.get('/dashboard/resumo', { params }),
  receitaDespesa: (params?: Record<string, string>) =>
    api.get('/dashboard/receita-despesa', { params }),
  porEtiqueta: (params?: Record<string, string>) =>
    api.get('/dashboard/por-etiqueta', { params }),
  porOrigem: (params?: Record<string, string>) =>
    api.get('/dashboard/por-origem', { params }),
  porDestino: (params?: Record<string, string>) =>
    api.get('/dashboard/por-destino', { params }),
  porTipoPagamento: (params?: Record<string, string>) =>
    api.get('/dashboard/por-tipo-pagamento', { params }),
  saldo: (params?: Record<string, string>) =>
    api.get('/dashboard/saldo', { params }),
  projecao: (params?: Record<string, string>) =>
    api.get('/dashboard/projecao', { params }),
};

// Extrato
export const extratoApi = {
  list: (params?: Record<string, string>) =>
    api.get('/extrato', { params }),
};
