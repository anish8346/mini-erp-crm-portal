import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected via Prisma');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error);
    process.exit(1);
  }
}
