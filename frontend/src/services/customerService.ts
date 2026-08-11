import { api } from './api';
import type { ApiResponse, Customer, FollowUp, Pagination } from '../types';

export interface CustomerListResponse {
  customers: Customer[];
  pagination: Pagination;
}

export const customerService = {
  getCustomers: async (params?: {
    search?: string;
    status?: string;
    customerType?: string;
    page?: number;
    limit?: number;
  }): Promise<CustomerListResponse> => {
    const res = await api.get<ApiResponse<CustomerListResponse>>('/customers', { params });
    return res.data.data!;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<{ customer: Customer }>>(`/customers/${id}`);
    return res.data.data!.customer;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<ApiResponse<{ customer: Customer }>>('/customers', data);
    return res.data.data!.customer;
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<ApiResponse<{ customer: Customer }>>(`/customers/${id}`, data);
    return res.data.data!.customer;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  addFollowUp: async (customerId: string, data: { note: string; followUpDate: string }): Promise<FollowUp> => {
    const res = await api.post<ApiResponse<{ followUp: FollowUp }>>(`/customers/${customerId}/follow-ups`, data);
    return res.data.data!.followUp;
  },

  getFollowUps: async (customerId: string): Promise<FollowUp[]> => {
    const res = await api.get<ApiResponse<{ followUps: FollowUp[] }>>(`/customers/${customerId}/follow-ups`);
    return res.data.data!.followUps;
  },
};
