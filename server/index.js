// server/index.js

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// --- Load Environment Variables ---
dotenv.config();

// --- Establish Database Connection ---
connectDB();

// --- Initialize Express App ---
const app = express();

// --- Core Middleware ---

// Set 'trust proxy' to 1 to trust the first proxy in front of the app (e.g., Render's load balancer).
// This is crucial for rate limiting and getting the correct client IP address.
app.set('trust proxy', 1);

// Apply a baseline of security headers to prevent common attacks.
app.use(helmet());

// Configure Cross-Origin Resource Sharing (CORS) to allow requests only from approved frontend URLs.
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or REST clients)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`The origin '${origin}' is not allowed by CORS.`));
    }
  }
}));

// --- Request Body Parsers & Static File Serving ---

// Parse incoming JSON payloads. Added a limit to prevent large, malicious payloads.
app.use(express.json({ limit: '500kb' }));
// Parse URL-encoded payloads.
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically from the 'uploads' directory.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rate Limiting Middleware ---

// Protect API routes from brute-force or denial-of-service attacks.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many API requests from this IP. Please try again after 15 minutes.',
});
app.use('/api', apiLimiter);


// --- API Route Mounting ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/curriculum', require('./routes/curriculumRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/school', require('./routes/schoolRoutes'));


// --- Health Check Route ---
// A simple route to verify that the server is alive and running.
app.get('/', (req, res) => {
  res.send(`Scholars-Path API is running in ${process.env.NODE_ENV} mode.`);
});

// --- Centralized Error Handling Middleware (MUST be last) ---
app.use(notFound);
app.use(errorHandler);


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  '0.0.0.0', // Listen on all network interfaces, important for containerized environments
  () => console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// --- Graceful Shutdown for Unhandled Promise Rejections ---
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red.bold);
  // Close server & exit process
  server.close(() => process.exit(1));
});