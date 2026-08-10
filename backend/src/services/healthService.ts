import { prisma } from '../config/prisma';

export class HealthService {
  public async getHealthStatus() {
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = 'unhealthy';
    }

    return {
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}

export const healthService = new HealthService();
