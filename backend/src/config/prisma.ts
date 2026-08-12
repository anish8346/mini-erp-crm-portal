import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDB(retries = 5, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL database connected via Prisma');
      return;
    } catch (error: any) {
      console.error(`⚠️ Database connection attempt ${attempt}/${retries} failed: ${error.message || error}`);
      if (attempt === retries) {
        console.error('❌ Could not connect to PostgreSQL database after multiple attempts. Exiting...');
        process.exit(1);
      }
      console.log(`⏳ Retrying database connection in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
