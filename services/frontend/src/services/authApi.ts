import axios from 'axios';
import type { User, LoginCredentials, RegisterData } from '../types/auth';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post<User>('/auth/login', credentials);
    return response.data;
  },
};
