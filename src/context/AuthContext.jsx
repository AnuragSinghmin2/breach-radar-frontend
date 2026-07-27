import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi, userApi } from "../services/api";

import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
  isSessionValid,
} from "../utils/auth";
import { logAuthTrace, normalizeAuthUser, saveAuthSession, getTokenExpiryMs } from "../utils/session";

import { setAccessToken, clearAccessToken } from "../services/api/client";



const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000;



const AuthContext = createContext(null);



export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => getStoredUser());

  const [isLoading, setIsLoading] = useState(true);



  const isAuthenticated = Boolean(user && isSessionValid());



  const applySession = useCallback((sessionUser, token, options = {}) => {

    const normalizedUser = normalizeAuthUser(sessionUser, token);



    logAuthTrace("AuthContext applySession user", normalizedUser);

    logAuthTrace("AuthContext detected role", normalizedUser?.role);

    setUser(normalizedUser);

    saveAuthSession(token, normalizedUser, options);

    setAccessToken(token);

  }, []);



  const clearSession = useCallback(() => {

    setUser(null);

    clearAccessToken();

    clearAuthSession();

  }, []);



  const updateAuthenticatedUser = useCallback((nextUser) => {

    const normalizedUser = normalizeAuthUser(nextUser);

    setUser(normalizedUser);

    saveAuthSession(getStoredAccessToken(), normalizedUser);

  }, []);



  const refreshProfile = useCallback(async () => {

    const profileUser = await userApi.getProfile();

    updateAuthenticatedUser(profileUser);

    return profileUser;

  }, [updateAuthenticatedUser]);



  const refreshAccessToken = useCallback(async () => {

    const storedUser = getStoredUser();

    if (!storedUser) {

      clearSession();

      return null;

    }



    const data = await authApi.refreshToken();

    applySession(storedUser, data.accessToken);

    return data.accessToken;

  }, [applySession, clearSession]);



  useEffect(() => {

    let active = true;



    async function bootstrap() {

      try {

        if (isSessionValid()) {

          if (!active) return;

          setUser(getStoredUser());

          setAccessToken(getStoredAccessToken());

          return;

        }



        const storedUser = getStoredUser();

        if (!storedUser) {

          if (active) clearSession();

          return;

        }



        await refreshAccessToken();

      } catch (error) {

        logAuthTrace("AuthContext bootstrap refresh failed", error);

        if (active) clearSession();

      } finally {

        if (active) setIsLoading(false);

      }

    }



    bootstrap();



    return () => {

      active = false;

    };

  }, [clearSession, refreshAccessToken]);



  useEffect(() => {

    if (!user) return undefined;



    let timerId;



    async function refreshAndReschedule() {

      try {

        await refreshAccessToken();

      } catch (error) {

        logAuthTrace("AuthContext scheduled refresh failed", error);

        return;

      }



      const token = getStoredAccessToken();

      const expiresAt = getTokenExpiryMs(token);

      if (!expiresAt) return;



      const refreshIn = Math.max(expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS, 1000);

      timerId = window.setTimeout(refreshAndReschedule, refreshIn);

    }



    const token = getStoredAccessToken();

    const expiresAt = getTokenExpiryMs(token);

    if (!expiresAt) return undefined;



    const refreshIn = Math.max(expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS, 0);

    timerId = window.setTimeout(refreshAndReschedule, refreshIn);



    return () => {

      if (timerId) window.clearTimeout(timerId);

    };

  }, [user, refreshAccessToken]);



  useEffect(() => {

    logAuthTrace("AuthContext user state", user);

  }, [user]);



  useEffect(() => {

    function handleLogout() {

      clearSession();

    }



    window.addEventListener("auth:logout", handleLogout);

    return () => window.removeEventListener("auth:logout", handleLogout);

  }, [clearSession]);



  const login = useCallback(async (email, password, rememberMe = false) => {

    const data = await authApi.login({ email, password, rememberMe });



    logAuthTrace("login response", data);

    applySession(data.user, data.accessToken, { rememberMe });

    return data;

  }, [applySession]);



  // Google OAuth — called from GoogleAuthSuccessPage after redirect

  const loginWithToken = useCallback(async (accessToken) => {

    // Fetch user profile using the token from Google OAuth callback

    const res = await fetch('/api/v1/users/profile', {

      headers: { Authorization: `Bearer ${accessToken}` },

    });

    if (!res.ok) throw new Error('Failed to fetch user profile');

    const data = await res.json();

    applySession(data.user || data, accessToken, { rememberMe: true });

    return data;

  }, [applySession]);



  const register = useCallback(async (email, password, name) => {

    const data = await authApi.register({ email, password, name });

    applySession(data.user, data.accessToken, { rememberMe: true });

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

      loginWithToken,

      register,

      logout,

      refreshProfile,

      updateAuthenticatedUser,

    }),

    [user, isAuthenticated, isLoading, login, loginWithToken, register, logout, refreshProfile, updateAuthenticatedUser]

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


