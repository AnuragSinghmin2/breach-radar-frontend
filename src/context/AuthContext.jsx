import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
  isSessionValid,
} from "../utils/auth";
import { saveAuthSession } from "../utils/session";
import { setAccessToken, clearAccessToken } from "../services/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user && isSessionValid());

  const applySession = useCallback((sessionUser, token) => {
    setUser(sessionUser);
    saveAuthSession(token, sessionUser);
    setAccessToken(token);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    clearAccessToken();
    clearAuthSession();
  }, []);

  useEffect(() => {
    function bootstrap() {
      if (isSessionValid()) {
        setUser(getStoredUser());
        setAccessToken(getStoredAccessToken());
      } else {
        clearSession();
      }

      setIsLoading(false);
    }

    bootstrap();
  }, [clearSession]);

  useEffect(() => {
    function handleLogout() {
      clearSession();
    }

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    applySession(data.user, data.accessToken);
    return data;
  }, [applySession]);

  const register = useCallback(async (email, password, name) => {
    const data = await authApi.register({ email, password, name });
    applySession(data.user, data.accessToken);
    return data;
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
