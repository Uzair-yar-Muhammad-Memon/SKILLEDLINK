require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const socket = require('./socket');

// Import routes
const userAuthRoutes = require('./routes/userAuth');
const workerAuthRoutes = require('./routes/workerAuth');
const serviceRoutes = require('./routes/services');
const workerRoutes = require('./routes/workers');
const reviewRoutes = require('./routes/reviews');
const mapRoutes = require('./routes/map');
const notificationRoutes = require('./routes/notifications');
const requestRoutes = require('./routes/requests');
const messageRoutes = require('./routes/messages');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socket.init(server);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL // Add your Vercel URL here
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel deployments (skilledlink.vercel.app and preview URLs)
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/auth/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - all under /api prefix
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/auth/worker', workerAuthRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SkillLink Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.io initialized for real-time communication`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
