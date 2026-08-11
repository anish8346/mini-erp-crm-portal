import { api } from './api';
import type { ApiResponse, Product, Challan, StockMovement } from '../types';

export interface DashboardMetrics {
  kpis: {
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
    totalChallans: number;
    todaysChallans: number;
  };
  recentChallans: Challan[];
  lowStockProducts: Product[];
  recentStockMovements: StockMovement[];
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics');
    return res.data.data!;
  },
};
