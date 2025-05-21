/**
 * Configuración de API y variables de entorno
 */

// URL base de la API
export const API_URL =
  "https://47e4-2800-810-57f-8903-745e-5476-bab5-1a65.ngrok-free.app/api";

// Endpoints de la API
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/local",
    REGISTER: "/auth/local/register",
    ME: "/users/me?populate=*",
  },
  USERS: {
    BASE: "/users",
    PROFILE: (id: number) => `/users/${id}`,
  },
  CLINICS: {
    BASE: "/clinics",
    BY_ID: (id: number) => `/clinics/${id}`,
  },
} as const;

// Variables de entorno
export const ENV = {
  development: true,
  production: false,
  apiUrl: API_URL,
} as const;

// Configuración de la API
export const API_CONFIG = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 segundos
} as const;
