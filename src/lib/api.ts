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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
        const { data } = await api.get('/auth/refresh');
        localStorage.setItem('accessToken', data.access_token);
        console.log('Token refreshed successfully.');

        // Повторяем оригинальный запрос с новым токеном
        return api(originalRequest);

      } catch (refreshError: any) {
        console.error('Unable to refresh token. Logging out.', refreshError.response?.data);
        
        // Если обновить токен не удалось, очищаем localStorage и вызываем logout на бэкенде
        localStorage.removeItem('accessToken');
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


export default api;