import axios, { AxiosInstance } from "axios";
import { API_CONFIG, ENDPOINTS } from "../config/api.config";
import type { User } from "../store/authStore";

interface LoginResponse {
  jwt: string;
  user: User;
}

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create(API_CONFIG);
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await this.api.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      this.setAuthToken(data.jwt);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message || "Error en el inicio de sesión"
        );
      }
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    try {
      const { data } = await this.api.post<LoginResponse>(
        ENDPOINTS.AUTH.REGISTER,
        credentials
      );
      this.setAuthToken(data.jwt);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message || "Error en el registro"
        );
      }
      throw error;
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      this.setAuthToken(token);
      const { data } = await this.api.get<User>(ENDPOINTS.AUTH.ME);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message || "Error al obtener el usuario"
        );
      }
      throw error;
    }
  }

  async updateUserProfile(
    userId: number,
    profileData: Partial<User>
  ): Promise<User> {
    try {
      const { data } = await this.api.put<User>(
        ENDPOINTS.USERS.PROFILE(userId),
        profileData
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message ||
            "Error al actualizar el perfil"
        );
      }
      throw error;
    }
  }

  async logout() {
    this.setAuthToken(null);
  }
}

export const authService = new AuthService();
