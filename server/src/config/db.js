const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri) {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log(`Connected to MongoDB at ${mongoose.connection.host}:${mongoose.connection.port}`);
      return;
    }
  } catch (error) {
    console.warn(`Could not connect to external MongoDB at ${uri}: ${error.message}`);
    console.log('Attempting in-memory MongoDB fallback for local development...');
  }

  // Local development fallback using mongodb-memory-server if available
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`Connected to MongoDB (In-Memory Fallback) at ${memUri}`);
  } catch (memError) {
    console.error(`Failed to connect to MongoDB fallback: ${memError.message}`);
    throw memError;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
