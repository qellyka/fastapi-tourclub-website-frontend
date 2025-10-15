import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  SchoolApplication,
  SchoolApplicationAdminItem,
  SchoolApplicationCreate,
  SchoolApplicationUpdateAdmin
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + '/api',
  withCredentials: true,
});

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig;

    // Условия для попытки обновления токена:
    // 1. Ошибка 401 (Unauthorized).
    // 2. Это не повторная попытка (чтобы избежать бесконечных циклов от других ошибок).
    // 3. Запрос, который провалился, - это НЕ сам запрос на обновление токена.
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/logout') {
      originalRequest._retry = true;

      try {
        console.log('Access token expired or missing. Attempting to refresh...');
        await api.get('/auth/refresh', { withCredentials: true });
        console.log('Token refreshed successfully.');

        // Повторяем оригинальный запрос с новым токеном
        return api(originalRequest);

      } catch (refreshError: any) {
        console.error('Unable to refresh token. Logging out.', refreshError.response?.data);
        
        // Если обновить токен не удалось, вызываем logout на бэкенде
        api.post('/auth/logout').catch(err => console.error('Logout call after refresh failure also failed:', err));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- School Applications API ---

export const createSchoolApplication = async (data: SchoolApplicationCreate): Promise<ApiResponse<SchoolApplication>> => {
  const response = await api.post('/school/applications', data);
  return response.data;
};

export const getMySchoolApplication = async (): Promise<ApiResponse<SchoolApplication | null>> => {
  const response = await api.get('/school/applications/me');
  return response.data;
};

export const getAllSchoolApplications = async (status?: string): Promise<ApiResponse<SchoolApplicationAdminItem[]>> => {
  const response = await api.get('/admin/school/applications', { params: { status } });
  return response.data;
};

export const updateSchoolApplicationStatus = async (id: number, data: SchoolApplicationUpdateAdmin): Promise<ApiResponse<SchoolApplication>> => {
  const response = await api.patch(`/admin/school/applications/${id}`, data);
  return response.data;
};

export const getSchoolApplicationById = async (id: number): Promise<ApiResponse<SchoolApplication>> => {
    const response = await api.get(`/admin/school/applications/${id}`, { params: { application_id: id } });
    return response.data;
};

// --- User API ---
interface UserUpdatePayload {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    phone_number?: string;
    description?: string;
}

export const updateMe = async (data: UserUpdatePayload) => {
    const response = await api.patch('/users/me/update', data);
    return response.data;
}

// --- Hike API ---
interface Hike {
  id: number;
  name: string;
  complexity: string;
  route: string;
  start_date: string;
  end_date: string;
  region: string;
  description: string;
  photos_archive?: string;
  report_file?: string;
  gpx_file?: string;
  // Add other fields as they become available from the backend
}

interface HikeUpdatePayload {
  name?: string;
  complexity?: string;
  route?: string;
  start_date?: string;
  end_date?: string;
  region?: string;
  description?: string;
  photos_archive?: string;
}

export const getHikeById = async (id: number): Promise<ApiResponse<Hike>> => {
  const response = await api.get(`/archive/hikes/${id}`);
  return response.data;
};

export const updateHike = async (id: number, data: HikeUpdatePayload, gpxFile?: File, reportFile?: File): Promise<ApiResponse<Hike>> => {
  const formData = new FormData();
  formData.append('update_data', JSON.stringify(data));

  if (gpxFile) {
    formData.append('gpx_file', gpxFile);
  }
  if (reportFile) {
    formData.append('report_file', reportFile);
  }

  const response = await api.patch(`/archive/hikes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export default api;