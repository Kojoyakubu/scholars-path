// /server/index.js

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

// ============================================================================
// 🌐 GLOBAL MIDDLEWARE
// ============================================================================

// Trust first proxy (needed for rate limiting and Render)
app.set('trust proxy', 1);

// Apply security headers
app.use(helmet());

// Configure allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000']; // Default fallback for local dev

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS.`));
      }
    },
    credentials: true,
  })
);

// Parse request bodies
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================================
// ⚙️ RATE LIMITING (Anti-DDoS)
// ============================================================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many API requests. Please try again later.',
});
app.use('/api', apiLimiter);

// ============================================================================
// 🧭 API ROUTE MOUNTING
// ============================================================================
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/curriculum', require('./routes/curriculumRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/school', require('./routes/schoolRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));

// ============================================================================
// 🩺 HEALTH CHECK
// ============================================================================
app.get('/', (req, res) => {
  res.status(200).send({
    message: `✅ Scholars Path API is live in ${process.env.NODE_ENV} mode.`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 🧩 CENTRALIZED ERROR HANDLING
// ============================================================================
app.use(notFound);
app.use(errorHandler);

// ============================================================================
// 🚀 SERVER STARTUP
// ============================================================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// ============================================================================
// 🧠 AI SERVICE STATUS LOG (Optional Debug Info)
// ============================================================================
console.log('🤖 AI services active: Gemini, ChatGPT, Claude, Perplexity.'.green.bold);

// ============================================================================
// 💣 GRACEFUL SHUTDOWN HANDLER
// ============================================================================
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red.bold);
  server.close(() => process.exit(1));
});
