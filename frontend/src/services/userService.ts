import { api } from './api';
import type { ApiResponse, User, Role } from '../types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/users');
    return res.data.data!.users;
  },

  updateUser: async (
    id: string,
    data: { role?: Role; isActive?: boolean }
  ): Promise<User> => {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}`, data);
    return res.data.data!.user;
  },
};
