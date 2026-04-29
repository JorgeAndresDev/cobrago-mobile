import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../utils/constants";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de peticiones: agrega el token JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Configura los interceptores de respuesta para manejar errores globales como el 401.
 * Implementa lógica de Refresh Token automática.
 */
export const setupInterceptors = (onLogout: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si es un error 401 y no es un re-intento
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem("refresh_token");
          
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Intentar refrescar el token
          // Nota: El endpoint /auth/refresh espera el token como string o en el cuerpo según lo definimos
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh?refresh_token=${refreshToken}`);
          
          const { access_token, refresh_token: new_refresh_token } = response.data;

          await AsyncStorage.setItem("token", access_token);
          await AsyncStorage.setItem("refresh_token", new_refresh_token);

          processQueue(null, access_token);
          isRefreshing = false;

          originalRequest.headers.Authorization = "Bearer " + access_token;
          return api(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          console.warn("Sesión expirada permanentemente. Cerrando sesión.");
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("refresh_token");
          onLogout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;