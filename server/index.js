const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const cors = require('cors');
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

// Middleware to parse JSON bodies
app.use(express.json());

// Make the 'uploads' folder public and accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ADD THIS DEBUGGING ROUTE ---
app.get('/api/debug-env', (req, res) => {
  res.json({
    CORS_ORIGIN_VARIABLE: process.env.CORS_ORIGIN || "NOT SET",
    ALLOWED_ORIGINS_ARRAY: allowedOrigins,
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
  });
});


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
  '0.0.0.0', // Important for deployment platforms
  () => console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections for a graceful shutdown
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red);
  server.close(() => process.exit(1));
});