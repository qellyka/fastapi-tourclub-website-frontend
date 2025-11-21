import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  Article,
  ArticleUpdate,
  ContentStatus,
  HikeUpdate,
  News,
  NewsUpdate,
  Pass,
  PassUpdate,
  SchoolApplication,
  SchoolApplicationAdminItem,
  SchoolApplicationCreate,
  SchoolApplicationUpdateAdmin,
  User,
  UserAdminUpdate
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

let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; originalRequest: AxiosRequestConfig }[] = [];

const processQueue = (error: AxiosError | null, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig;

    // Условия для попытки обновления токена:
    // 1. Ошибка 401 (Unauthorized).
    // 2. Это не повторная попытка (чтобы избежать бесконечных циклов от других ошибок).
    // 3. Запрос, который провалился, - это НЕ сам запрос на обновление токена или выход из системы.
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/logout') {
      
      // Если запрос на обновление уже идет, ставим текущий запрос в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        })
        .then(() => api(originalRequest)) // Повторяем запрос после успешного обновления
        .catch(err => Promise.reject(err)); // Если обновление провалилось, отклоняем текущий запрос
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        api.get('/auth/refresh', { withCredentials: true })
          .then(res => {
            console.log('Token refreshed successfully.');
            isRefreshing = false;
            // Повторяем все запросы из очереди
            processQueue(null, res.data); // Assuming res.data contains the new token or relevant info
            resolve(api(originalRequest));
          })
          .catch((refreshError: AxiosError) => {
            console.error('Unable to refresh token. Logging out.', refreshError.response?.data);
            isRefreshing = false;
            // Если обновить токен не удалось, вызываем logout на бэкенде
            api.post('/auth/logout').catch(err => console.error('Logout call after refresh failure also failed:', err));
            // Отклоняем все запросы в очереди
            processQueue(refreshError);
            reject(refreshError);
          });
      });
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
  const updatedData = { ...data, status: data.status };
  const response = await api.patch(`/admin/school/applications/${id}`, updatedData);
  return response.data;
};

export const getSchoolApplicationById = async (id: number): Promise<ApiResponse<SchoolApplication>> => {
    const response = await api.get(`/admin/school/applications/${id}`, { params: { application_id: id } });
    return response.data;
};

// --- User API ---

export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const updateUser = async (id: number, data: UserAdminUpdate): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/users/${id}/update`, data);
    return response.data;
};

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

// --- Content API ---

export const getAllArticles = async (status?: ContentStatus): Promise<ApiResponse<Article[]>> => {
    const response = await api.get('/articles', { params: { status } });
    return response.data;
};

export const getAllNews = async (status?: ContentStatus): Promise<ApiResponse<News[]>> => {
    const response = await api.get('/news', { params: { status } });
    return response.data;
};

export const getAllHikes = async (status?: ContentStatus): Promise<ApiResponse<Hike[]>> => {
    const response = await api.get('/archive/hikes', { params: { status } });
    return response.data;
};

export const getAllPasses = async (status?: ContentStatus): Promise<ApiResponse<Pass[]>> => {
    const response = await api.get('/archive/passes', { params: { status } });
    return response.data;
};

export const getArticleById = async (id: number): Promise<ApiResponse<Article>> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
};

export const updateArticle = async (id: number, data: ArticleUpdate): Promise<ApiResponse<Article>> => {
    const updatedData: any = { ...data };
    if (data.status) {
        updatedData.status = data.status.toUpperCase();
    }
    const response = await api.patch(`/articles/${id}`, updatedData);
    return response.data;
};

export const getNewsById = async (id: number): Promise<ApiResponse<News>> => {
    const response = await api.get(`/news/${id}`);
    return response.data;
};

export const updateNews = async (id: number, data: NewsUpdate): Promise<ApiResponse<News>> => {
    const updatedData: any = { ...data };
    if (data.status) {
        updatedData.status = data.status.toUpperCase();
    }
    const response = await api.patch(`/news/${id}`, updatedData);
    return response.data;
};

export const getPassById = async (id: number): Promise<ApiResponse<Pass>> => {
    const response = await api.get(`/archive/passes/${id}`);
    return response.data;
};

export const updatePass = async (id: number, data: PassUpdate): Promise<ApiResponse<Pass>> => {
    const updatedData: any = { ...data };
    if (data.status) {
        updatedData.status = data.status.toUpperCase();
    }
    const response = await api.patch(`/archive/passes/${id}`, updatedData);
    return response.data;
};

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

// --- FAQ API ---

export const getAdminFaqs = async (is_active?: boolean, lang?: string): Promise<ApiResponse<FAQItem[]>> => {
  const params: { [key: string]: any } = {};
  if (is_active !== undefined) params.is_active = is_active;
  if (lang) params.lang = lang;
  const response = await api.get('/admin/faqs', { params });
  return response.data;
};

export const getPublicFaqs = async (lang?: string): Promise<ApiResponse<FAQItem[]>> => {
  const params: { [key: string]: any } = {};
  if (lang) params.lang = lang;
  const response = await api.get('/faqs', { params });
  return response.data;
};

export const getFaqById = async (id: number): Promise<ApiResponse<FAQItem>> => {
  const response = await api.get(`/admin/faqs/${id}`);
  return response.data;
};

export const createFaq = async (data: FAQCreateUpdate): Promise<ApiResponse<FAQItem>> => {
  const response = await api.post('/admin/faqs', data);
  return response.data;
};

export const updateFaq = async (id: number, data: FAQCreateUpdate): Promise<ApiResponse<FAQItem>> => {
  const response = await api.put(`/admin/faqs/${id}`, data);
  return response.data;
};

export const patchFaq = async (id: number, data: Partial<FAQCreateUpdate>): Promise<ApiResponse<FAQItem>> => {
  const response = await api.patch(`/admin/faqs/${id}`, data);
  return response.data;
};

export const deleteFaq = async (id: number): Promise<ApiResponse<string>> => {
  const response = await api.delete(`/admin/faqs/${id}`);
  return response.data;
};

// --- Statistics API ---

export const getStatistics = async (): Promise<ApiResponse<StatisticsData>> => {
  const response = await api.get('/statistics');
  return response.data;
};


export default api;