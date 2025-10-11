// index.js (Revised)

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files
const userRoutes = require('./routes/userRoutes');
const curriculumRoutes = require('./routes/curriculumRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- Core Security Middleware ---
// Set security HTTP headers
app.use(helmet());

// Set up CORS with flexible origin from .env
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// --- Body Parsers & Static Files ---
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api', limiter); // Apply to all API calls

// --- Debugging Route (Development Only) ---
if (process.env.NODE_ENV === 'development') {
  app.get('/api/debug-env', (req, res) => {
    res.json({
      CORS_ORIGIN_VARIABLE: process.env.CORS_ORIGIN || "NOT SET",
      ALLOWED_ORIGINS_ARRAY: allowedOrigins,
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
    });
  });
}

// --- Mount Routers ---
app.use('/api/users', userRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/school', schoolRoutes);

// --- Centralized Error Handling ---
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  '0.0.0.0',
  () => console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections for a graceful shutdown
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red);
  server.close(() => process.exit(1));
});