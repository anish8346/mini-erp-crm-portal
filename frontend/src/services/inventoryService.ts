import { api } from './api';
import type { ApiResponse, StockMovement, Product, Pagination } from '../types';

export interface StockMovementListResponse {
  movements: StockMovement[];
  pagination: Pagination;
}

export interface StockInResponse {
  product: Product;
  movement: StockMovement;
}

export interface StockOutResponse {
  product: Product;
  movement: StockMovement;
}

export const inventoryService = {
  getMovements: async (params?: {
    productId?: string;
    type?: 'IN' | 'OUT';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<StockMovementListResponse> => {
    const res = await api.get<ApiResponse<StockMovementListResponse>>('/inventory/movements', { params });
    return res.data.data!;
  },

  getLowStockProducts: async (params?: { page?: number; limit?: number }): Promise<{ products: Product[]; pagination: Pagination }> => {
    const res = await api.get<ApiResponse<{ products: Product[]; pagination: Pagination }>>('/inventory/low-stock', { params });
    return res.data.data!;
  },

  stockIn: async (productId: string, data: { quantity: number; reason?: string }): Promise<StockInResponse> => {
    const res = await api.post<ApiResponse<StockInResponse>>(`/inventory/${productId}/stock-in`, data);
    return res.data.data!;
  },

  stockOut: async (productId: string, data: { quantity: number; reason?: string }): Promise<StockOutResponse> => {
    const res = await api.post<ApiResponse<StockOutResponse>>(`/inventory/${productId}/stock-out`, data);
    return res.data.data!;
  },
};
