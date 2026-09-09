import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';
import { getStoredToken, setStoredToken, clearStoredToken, onSessionExpired } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  // `loading` covers the initial session-restoration check on app startup,
  // so protected routes don't briefly flash a redirect to /login before
  // we've had a chance to verify an existing token.
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  // Restore the session on startup: if a token is present, verify it
  // against the backend's GET /api/auth/me rather than trusting whatever
  // is cached, since the token could be expired or the user could have
  // been deleted server-side.
  useEffect(() => {
    const restoreSession = async () => {
      const existingToken = getStoredToken();
      if (!existingToken) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setToken(existingToken);
      } catch (error) {
        clearStoredToken();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // If any API call comes back 401 mid-session (expired/invalid token),
  // clear the session so ProtectedRoute redirects to /login.
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      clearStoredToken();
      setUser(null);
      setToken(null);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token: newToken } = await authService.login(credentials);
    setStoredToken(newToken);
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const registerUser = useCallback(async (payload) => {
    // Registration does not log the user in automatically — per the spec,
    // they're redirected to /login after a successful registration.
    return authService.register(payload);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    register: registerUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
