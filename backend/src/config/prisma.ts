import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDB(retries = 3, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL database connected via Prisma');
      return;
    } catch (error: any) {
      console.error(`⚠️ Database connection attempt ${attempt}/${retries} failed: ${error.message || error}`);
      if (attempt === retries) {
        console.warn('⚠️ Could not connect to PostgreSQL database during initial startup. Server will continue and retry lazily on incoming requests.');
        return;
      }
      console.log(`⏳ Retrying database connection in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
