// The backend's User model uses role: enum ['user', 'admin']. Centralizing
// the literal here means if that ever changes, only this file needs updating.
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const isAdmin = (user) => user?.role === ROLES.ADMIN;
