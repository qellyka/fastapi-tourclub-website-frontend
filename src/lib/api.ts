import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + '/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any | null, token = null) => {
  failedQueue.forEach((prom) => {
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
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops and bypass refresh for login or initial user fetch
    if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login' || originalRequest.url === '/users/me') {
      return Promise.reject(error);
    }

    // If the error is 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      isRefreshing = true;
      originalRequest._retry = true;

      const retryOriginalRequest = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      try {
        const refreshResponse = await api.get('/auth/refresh');
        isRefreshing = false;
        processQueue(null, refreshResponse.data.access_token);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
