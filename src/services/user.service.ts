import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useStatsStore } from "../store/statsStore";
import { ENDPOINTS } from "../config/api.config";
import api from "../config/axios.config";

// Types
interface User {
  id: number;
  attributes: {
    username: string;
    email: string;
    phone?: string;
    documentId?: string;
    roleClinic: string;
    device?: string;
    blocked: boolean;
    confirmed: boolean;
    clinic?: {
      data: {
        id: number;
        attributes: {
          name: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface GetUsersParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface UserStats {
  totalUsers: number;
  blockedUsers: number;
  adminUsers: number;
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  device?: string;
  blocked: boolean;
  confirmed: boolean;
  roleClinic: string;
  clinic: any; // You might want to type this properly based on your clinic structure
  role: number;
}

class UserService {
  setAuthToken(token: string | null) {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }

  async getUsers({
    search = "",
    page = 1,
    pageSize = 100,
  }: GetUsersParams = {}): Promise<PaginatedResponse<any>> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error("Usuario no autenticado");
      if (!user.clinic?.id) throw new Error("Usuario sin clínica asignada");

      let query = `${ENDPOINTS.USERS.BASE}?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&filters[clinic][id][$eq]=${user.clinic.id}`;

      if (search) {
        query += `&filters[$or][0][username][$containsi]=${search}&filters[$or][1][email][$containsi]=${search}`;
      }

      const { data } = await api.get(query);
      return {
        data,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(data.length / pageSize),
            total: data.length,
          },
        },
      };
    } catch (error) {
      console.log("Error en getUsers:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("No tienes permisos para acceder a esta información");
        }
        throw new Error(
          error.response?.data?.error?.message ||
            "Error al obtener los usuarios"
        );
      }
      throw error;
    }
  }

  async getStats(): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error("Usuario no autenticado");
      if (!user.clinic?.id) throw new Error("Usuario sin clínica asignada");

      const { data } = await api.get(
        `${ENDPOINTS.USERS.BASE}?populate=*&filters[clinic][id][$eq]=${user.clinic.id}`
      );

      console.log("users", data);
      const users = data;
      const { setUserStats } = useStatsStore.getState();

      setUserStats({
        totalUsers: users.length,
        blockedUsers: users.filter((user) => user.blocked === true).length,
        adminUsers: users.filter((user) => user.roleClinic === "adminClinic")
          .length,
      });
    } catch (error) {
      console.log("Error en getStats:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("No tienes permisos para acceder a esta información");
        }
        throw new Error(
          error.response?.data?.error?.message ||
            "Error al obtener las estadísticas"
        );
      }
      throw error;
    }
  }

  async toggleUserBlock(userId: number): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error("Usuario no autenticado");
      if (!user.clinic?.id) throw new Error("Usuario sin clínica asignada");

      // Get current user data
      const { data: currentUser } = await api.get(
        `${ENDPOINTS.USERS.PROFILE(userId)}?populate=*`
      );

      // Toggle the blocked status
      const isCurrentlyBlocked = currentUser.blocked;

      // Update the user's blocked status
      await api.put(ENDPOINTS.USERS.PROFILE(userId), {
        blocked: !isCurrentlyBlocked,
      });
    } catch (error) {
      console.log("Error en toggleUserBlock:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción");
        }
        throw new Error(
          error.response?.data?.error?.message ||
            "Error al actualizar el estado del usuario"
        );
      }
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<any> {
    try {
      const { data } = await api.post(ENDPOINTS.USERS.BASE, userData);
      return data;
    } catch (error) {
      console.log("Error en createUser:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("No tienes permisos para crear usuarios");
        }
        throw new Error(
          error.response?.data?.error?.message || "Error al crear el usuario"
        );
      }
      throw error;
    }
  }
}

// Exportar una única instancia del servicio
export const userService = new UserService();
