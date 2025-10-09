const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

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

app.use(cors({
  origin: 'https://scholars-path-frontend.onrender.com' // Allow requests from your live frontend
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Make the 'uploads' folder public and accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount the routers
app.use('/api/users', userRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

//payment route
app.use('/api/payments', paymentRoutes);

//school routes
app.use('/api/school', schoolRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));