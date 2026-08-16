const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');
// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Cook Management Routine Server API (v1.2)
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Cook Routine & Attendance Tracker API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/dishes', require('./routes/dishRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/cylinders', require('./routes/cylinderRoutes'));
app.use('/api/groceries', require('./routes/groceryRoutes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Cook Tracker Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
