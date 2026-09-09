import api from './api';

// GET /api/users (admin only) -> { success, data: { users } }
export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data.data.users;
};

// GET /api/users/:id (admin only) -> { success, data: { user } }
export const getUser = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data.user;
};

// DELETE /api/users/:id (admin only) -> { success, data: { message } }
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data.data;
};
