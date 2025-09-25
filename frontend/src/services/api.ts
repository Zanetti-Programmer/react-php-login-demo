import axios from 'axios';

const API_BASE_URL = 'http://localhost/react-php-login-demo/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id?: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  token: string;
  name: string;
  email: string;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth.php?action=register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth.php?action=login', data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth.php?action=google', data);
    return response.data;
  },

  verify: async (): Promise<{ message: string; user: User }> => {
    const response = await api.get('/auth.php?action=verify');
    return response.data;
  },
};

export default api;