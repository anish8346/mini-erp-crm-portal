import app from './app';
import { env } from './config/env';
import { connectDB, prisma } from './config/prisma';

async function startServer() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 [Server] Mini ERP + CRM Backend running on http://localhost:${env.PORT}`);
    console.log(`📌 [Environment] ${env.NODE_ENV}`);
  });

  // Graceful shutdown handling
  const shutdown = async () => {
    console.log('\n⏳ Shutting down backend server gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Disconnected Prisma client & HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
