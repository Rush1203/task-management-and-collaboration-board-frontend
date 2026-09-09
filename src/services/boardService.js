import api from './api';

// POST /api/boards (admin only) -> { success, data: { board } }
export const createBoard = async ({ title, description, members }) => {
  const { data } = await api.post('/boards', { title, description, members });
  return data.data.board;
};

// GET /api/boards -> { success, data: { boards } }
// Backend already scopes this: admins get all boards, users get only
// boards where they are a member.
export const getBoards = async () => {
  const { data } = await api.get('/boards');
  return data.data.boards;
};

// GET /api/boards/:id -> { success, data: { board } }
export const getBoard = async (id) => {
  const { data } = await api.get(`/boards/${id}`);
  return data.data.board;
};

// PUT /api/boards/:id (admin only) -> { success, data: { board } }
export const updateBoard = async (id, updates) => {
  const { data } = await api.put(`/boards/${id}`, updates);
  return data.data.board;
};

// DELETE /api/boards/:id (admin only) -> { success, data: { message } }
export const deleteBoard = async (id) => {
  const { data } = await api.delete(`/boards/${id}`);
  return data.data;
};

// POST /api/boards/:id/members (admin only) -> { success, data: { board } }
export const addMember = async (boardId, userId) => {
  const { data } = await api.post(`/boards/${boardId}/members`, { userId });
  return data.data.board;
};

// DELETE /api/boards/:id/members/:userId (admin only) -> { success, data: { board } }
export const removeMember = async (boardId, userId) => {
  const { data } = await api.delete(`/boards/${boardId}/members/${userId}`);
  return data.data.board;
};
