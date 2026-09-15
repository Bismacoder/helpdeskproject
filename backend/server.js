const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { autoSeedIfEmpty } = require('./utils/seeder');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Core Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Helpdesk & Support Ticket Management System API is running smoothly.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/tickets/:ticketId/history', require('./routes/statusHistoryRoutes'));
app.use('/api/tickets/:ticketId/comments', require('./routes/commentRoutes'));

// Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server after database connection is established
const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Helpdesk Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Helpdesk Server] API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Critical Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
