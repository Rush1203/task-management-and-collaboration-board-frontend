import api from './api';

// Builds a query string from only the filters/pagination params that are
// actually set, matching the exact query params the backend supports:
// status, priority, assignedTo, board (admin list only), page, limit,
// sortBy/order (admin list only).
const buildParams = (filters = {}) => {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters.board) params.board = filters.board;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.order) params.order = filters.order;
  return params;
};

// GET /api/boards/:id/tasks -> { success, data: { tasks, page, limit, totalPages, totalCount } }
export const getBoardTasks = async (boardId, filters = {}) => {
  const { data } = await api.get(`/boards/${boardId}/tasks`, { params: buildParams(filters) });
  return data.data; // { tasks, page, limit, totalPages, totalCount }
};

// POST /api/boards/:id/tasks -> { success, data: { task } }
export const createTask = async (boardId, payload) => {
  const { data } = await api.post(`/boards/${boardId}/tasks`, payload);
  return data.data.task;
};

// GET /api/tasks/:id -> { success, data: { task } }
export const getTask = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data.data.task;
};

// PUT /api/tasks/:id -> { success, data: { task } }
// Callers must only send fields the current role is allowed to change;
// the backend enforces this too, but we keep the UI aligned with it.
export const updateTask = async (id, updates) => {
  const { data } = await api.put(`/tasks/${id}`, updates);
  return data.data.task;
};

// DELETE /api/tasks/:id (admin only) -> { success, data: { message } }
export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data.data;
};

// GET /api/admin/tasks (admin only) -> { success, data: { tasks, page, limit, totalPages, totalCount } }
export const getAllTasks = async (filters = {}) => {
  const { data } = await api.get('/admin/tasks', { params: buildParams(filters) });
  return data.data;
};
