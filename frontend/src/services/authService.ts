import { api } from './api';
import type { ApiResponse, User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return res.data.data!;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data!.user;
  },
};
