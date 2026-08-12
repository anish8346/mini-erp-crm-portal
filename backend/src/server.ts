import app from './app';
import { env } from './config/env';
import { connectDB, prisma } from './config/prisma';

async function startServer() {
  await connectDB();

  const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 [Server] Mini ERP + CRM Backend running on port ${env.PORT}`);
    console.log(`📌 [Environment] ${env.NODE_ENV}`);
  });

  // Automated Keep-Alive self-ping for Render Free Tier (every 5 minutes)
  const renderUrl = process.env.RENDER_EXTERNAL_URL || 'https://fundsroom-erp-backend-5n1v.onrender.com';
  const PING_INTERVAL = 5 * 60 * 1000; // 5 mins

  setInterval(async () => {
    try {
      const response = await fetch(`${renderUrl}/health`);
      if (response.ok) {
        console.log(`📡 [KeepAlive] Ping successful to ${renderUrl}/health`);
      }
    } catch (error) {
      console.warn('⚠️ [KeepAlive] Self-ping failed:', error instanceof Error ? error.message : error);
    }
  }, PING_INTERVAL);

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
