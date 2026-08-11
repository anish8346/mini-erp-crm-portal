import { prisma } from '../config/prisma';

export class DashboardService {
  public async getMetrics() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch all products for accurate lowStock calculation
    const allProducts = await prisma.product.findMany({
      orderBy: { currentStock: 'asc' },
    });

    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);

    const [
      totalCustomers,
      totalProducts,
      totalChallans,
      todaysChallans,
      recentChallans,
      recentStockMovements,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.challan.count(),
      prisma.challan.count({
        where: {
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, customerName: true, businessName: true },
          },
        },
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, productName: true, sku: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      kpis: {
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalChallans,
        todaysChallans,
      },
      recentChallans,
      lowStockProducts: lowStockProducts.slice(0, 5),
      recentStockMovements,
    };
  }
}

export const dashboardService = new DashboardService();
