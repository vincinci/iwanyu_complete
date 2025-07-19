const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Connection test and graceful handling
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Don't exit in production, let the app handle connection retries
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

// Initialize connection
connectToDatabase();

module.exports = prisma;
