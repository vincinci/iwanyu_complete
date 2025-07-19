const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

// Trust proxy for production deployment (Render, Vercel, etc.)
app.set('trust proxy', true);

const server = createServer(app);

// Configure allowed origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  process.env.FRONTEND_URL,
  // Add your Vercel domain here
  'https://iwanyu-complete.vercel.app',
  'https://*.vercel.app'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting with proper proxy trust configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true, // Trust proxy headers for accurate IP detection
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const prisma = require('./utils/prisma');
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Iwanyu API',
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      service: 'Iwanyu API',
      version: '1.0.0',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Socket.IO for real-time chat
const { setupSocketHandlers } = require('./services/socketService');
setupSocketHandlers(io);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
