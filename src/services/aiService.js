import api from './api';

// POST /api/ai/task-assistant -> { success, data: { suggestedDescription, suggestedPriority, subtasks } }
// The response fields are returned flat under `data` by the backend
// (not nested under a further "suggestions" key).
export const getTaskSuggestions = async ({ title, description }) => {
  const { data } = await api.post('/ai/task-assistant', { title, description });
  return data.data; // { suggestedDescription, suggestedPriority, subtasks }
};
