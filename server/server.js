require('dotenv').config();
const http = require('node:http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./src/config/db');
const { seedDatabase } = require('./src/utils/seed');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Arbor House MERN Backend running at http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('\nGracefully shutting down...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
