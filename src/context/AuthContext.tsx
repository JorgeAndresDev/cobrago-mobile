import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setupInterceptors } from "../api/axios";

import { User } from "../types";

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Logout memoizado para evitar ciclos infinitos en interceptores
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refresh_token");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  // Configurar interceptores de Axios al montar el Provider
  useEffect(() => {
    setupInterceptors(logout);
  }, [logout]);

  // Validar sesión al iniciar la app
  useEffect(() => {
    const validateSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        
        if (storedToken) {
          // Intentar obtener perfil del usuario para validar token
          // Asumimos el endpoint /auth/me basado en el estándar FastAPI
          const response = await api.get("/auth/me");
          setToken(storedToken);
          setUser(response.data);
        }
      } catch (error: any) {
        console.warn("Sesión inválida al inicio:", error.response?.status);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [logout]);

  // Login con application/x-www-form-urlencoded (requerido por FastAPI OAuth2)
  const login = async (correo: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        correo,
        password
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      if (accessToken) {
        await AsyncStorage.setItem("token", accessToken);
        await AsyncStorage.setItem("refresh_token", refreshToken);
        setToken(accessToken);
        
        // Cargar datos del usuario inmediatamente tras el login
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}