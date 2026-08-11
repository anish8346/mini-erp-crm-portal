import { api } from './api';
import type { ApiResponse } from '../types';

export interface DashboardMetrics {
  totalCustomers: number;
  activeLeads: number;
  totalProducts: number;
  lowStockCount: number;
  totalChallans: number;
  pendingDraftChallans: number;
  recentActivities: any[];
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    // For Phase 9/10 dashboard metrics endpoint
    const res = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics').catch(() => ({
      data: {
        data: {
          totalCustomers: 0,
          activeLeads: 0,
          totalProducts: 0,
          lowStockCount: 0,
          totalChallans: 0,
          pendingDraftChallans: 0,
          recentActivities: [],
        },
      },
    }));
    return res.data.data!;
  },
};
