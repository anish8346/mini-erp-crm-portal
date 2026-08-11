import { api } from './api';
import type { ApiResponse, Challan, Pagination } from '../types';

export interface ChallanListResponse {
  challans: Challan[];
  pagination: Pagination;
}

export interface CreateChallanPayload {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export const challanService = {
  getChallans: async (params?: {
    search?: string;
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<ChallanListResponse> => {
    const res = await api.get<ApiResponse<ChallanListResponse>>('/challans', { params });
    return res.data.data!;
  },

  getChallanById: async (id: string): Promise<Challan> => {
    const res = await api.get<ApiResponse<{ challan: Challan }>>(`/challans/${id}`);
    return res.data.data!.challan;
  },

  createChallan: async (payload: CreateChallanPayload): Promise<Challan> => {
    const res = await api.post<ApiResponse<{ challan: Challan }>>('/challans', payload);
    return res.data.data!.challan;
  },

  confirmChallan: async (id: string): Promise<Challan> => {
    const res = await api.post<ApiResponse<{ challan: Challan }>>(`/challans/${id}/confirm`);
    return res.data.data!.challan;
  },

  cancelChallan: async (id: string): Promise<Challan> => {
    const res = await api.post<ApiResponse<{ challan: Challan }>>(`/challans/${id}/cancel`);
    return res.data.data!.challan;
  },
};
