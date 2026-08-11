import { api } from './api';
import type { ApiResponse, Product, Pagination } from '../types';

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

export const productService = {
  getProducts: async (params?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ProductListResponse> => {
    const res = await api.get<ApiResponse<ProductListResponse>>('/products', { params });
    return res.data.data!;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    return res.data.data!.product;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post<ApiResponse<{ product: Product }>>('/products', data);
    return res.data.data!.product;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, data);
    return res.data.data!.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
