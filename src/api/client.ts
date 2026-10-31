import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bl_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses & handle session timeouts
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // If unauthorized on a protected route, clear stale credentials
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        console.warn('Session expired or unauthorized. Please re-authenticate.');
      }
    }
    return Promise.reject(error);
  }
);

// Helper for extracting clean error message from backend
export const extractErrorMessage = (error: unknown, fallbackMessage = 'An unexpected error occurred'): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (error.response?.data?.details) {
      const details = error.response.data.details;
      if (Array.isArray(details) && details.length > 0) {
        return details.map((d: any) => d.message || JSON.stringify(d)).join(', ');
      }
      if (typeof details === 'string') return details;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to backend server. Please verify the API is running at ' + API_BASE_URL;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

// Helper for triggering PDF downloads from blob responses
export const downloadBlobFile = (blobData: Blob, defaultFilename: string) => {
  const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
