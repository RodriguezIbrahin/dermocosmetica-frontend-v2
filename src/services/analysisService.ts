import { useAuthStore } from "../store/authStore";
import { ENDPOINTS } from "../config/api.config";
import api from "../config/axios.config";

// Types
interface Analysis {
  id: number;
  documentId: string;
  type: "skin";
  data: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  state: "pending" | "processing" | "completed" | "error";
  analysisInternalId: string | null;
  patient: {
    id: number;
    documentId: string;
    username: string;
    email: string;
    phone: string;
    location: string | null;
    birthDate: string;
    gender: "male" | "female" | "other";
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    DocumentType: string;
    documentValue: string;
  };
}

interface StrapiResponse<T> {
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

interface GetAnalysesParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

interface Stats {
  totalAnalyses: number;
  totalPatients: number;
  completedPercentage: number;
}

interface AudioAnalysisRequest {
  audioFile: File;
  analysisId?: string;
  analysisInternalId: string;
  metadata?: {
    recordingNumber: number;
    timestamp: string;
    [key: string]: any;
  };
}

interface AudioAnalysisResponse {
  success: boolean;
  transcription: {
    text: string;
    confidence: number;
  };
  error?: string;
}

class AnalysisService {
  /**
   * Get analyses list with pagination and search
   */
  async getAnalyses({
    search,
    page = 1,
    pageSize = 10,
  }: GetAnalysesParams = {}): Promise<StrapiResponse<Analysis>> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error("Usuario no autenticado");

      const searchFilter = search
        ? `&filters[$or][0][patient][username][$containsi]=${search}&filters[$or][1][patient][email][$containsi]=${search}`
        : "";

      const paginationParams = `&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      const baseUrl = ENDPOINTS.ANALYSIS.BY_USER(user.id);

      const { data } = await api.get<StrapiResponse<Analysis>>(
        `${baseUrl}&populate=patient${searchFilter}${paginationParams}`
      );
      return data;
    } catch (error) {
      console.error("Error en getAnalyses:", error);
      throw error;
    }
  }

  /**
   * Get analysis statistics
   */
  async getStats(): Promise<Stats> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error("Usuario no autenticado");

      const baseUrl = ENDPOINTS.ANALYSIS.BY_USER(user.id);
      const { data } = await api.get<StrapiResponse<Analysis>>(
        `${baseUrl}&fields[0]=id&fields[1]=state&populate[patient][fields][0]=id&pagination[pageSize]=10000`
      );

      const totalAnalyses = data.data.length;
      const uniquePatients = new Set(
        data.data.map((analysis) => analysis.patient.id)
      );
      const totalPatients = uniquePatients.size;
      const completedAnalyses = data.data.filter(
        (analysis) => analysis.state === "completed"
      ).length;
      const completedPercentage =
        totalAnalyses > 0 ? (completedAnalyses / totalAnalyses) * 100 : 0;

      return {
        totalAnalyses,
        totalPatients,
        completedPercentage,
      };
    } catch (error) {
      console.error("Error en getStats:", error);
      throw error;
    }
  }

  /**
   * Process audio file using Whisper
   */
  async processAudioRecording(
    params: AudioAnalysisRequest
  ): Promise<AudioAnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append("audio", params.audioFile);
      formData.append("analysisId", params.analysisId || "");
      formData.append("analysisInternalId", params.analysisInternalId);

      if (params.metadata) {
        formData.append("metadata", JSON.stringify(params.metadata));
      }

      const { data } = await api.post(
        ENDPOINTS.ANALYSIS.PROCESS_AUDIO,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data;
    } catch (error) {
      console.error("Error en processAudioRecording:", error);
      return {
        success: false,
        transcription: { text: "", confidence: 0 },
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Get specific analysis status
   */
  async getAnalysisStatus(analysisId: string): Promise<{
    status: "pending" | "processing" | "completed" | "error";
    transcription?: AudioAnalysisResponse;
  }> {
    try {
      const { data } = await api.get(ENDPOINTS.ANALYSIS.STATUS(analysisId));
      return data;
    } catch (error) {
      console.error("Error en getAnalysisStatus:", error);
      throw error;
    }
  }
}

// Export a single instance of the service
export const analysisService = new AnalysisService();
