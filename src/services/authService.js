import api from './api';

// POST /api/auth/register -> { success, data: { user, token } }
export const register = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data.data; // { user, token }
};

// POST /api/auth/login -> { success, data: { user, token } }
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data; // { user, token }
};

// GET /api/auth/me -> { success, data: { user } }
export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};
