// /client/src/App.jsx - UPDATED WITH ADMIN ROUTES
// ✅ LandingPage at root "/"
// ✅ Multiple auth options: /login, /register, /auth
// ✅ Layout wrapper for protected routes (sidebars work)
// ✅ QuizSeparated component for separated question types
// ✅ SelectClass route for student class selection
// ✅ NEW: All admin routes (Users, Schools, Curriculum, Analytics)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Layout Component (provides sidebar for protected routes)
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';     // Marketing homepage
import AuthPortal from './pages/AuthPortal';        // Combined login/register
import Login from './pages/Login';                  // Separate login
import Register from './pages/Register';            // Separate register
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';        // ✅ NEW: User management
import AdminSchools from './pages/AdminSchools';    // ✅ NEW: School management
import AdminCurriculum from './pages/AdminCurriculum'; // ✅ NEW: Curriculum management
import AdminAnalytics from './pages/AdminAnalytics'; // ✅ NEW: Analytics
import LessonNoteView from './pages/LessonNoteView';
import SelectClass from './pages/SelectClass';      // Class selection page

// ✅ UPDATED: Import QuizSeparated instead of TakeQuiz
import QuizSeparated from './components/QuizSeparated';

// Routes
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

const App = () => {
  const dispatch = useDispatch();

  // Logout handler for Layout component
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('studentClassSelection');
    dispatch({ type: 'auth/logout' });
    window.location.href = '/';
  };

  return (
    <Router>
      <Routes>
        {/* ==========================================
            PUBLIC ROUTES (No Layout/Sidebar)
        ========================================== */}
        
        {/* Landing Page - Beautiful marketing homepage */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication Routes */}
        <Route path="/auth" element={<AuthPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==========================================
            PROTECTED ROUTES (With Layout/Sidebar)
        ========================================== */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route element={<PrivateRoute />}>
            
            {/* Teacher & School Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['teacher', 'school_admin']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/notes/:id" element={<LessonNoteView />} />
            </Route>

            {/* ==========================================
                ADMIN ROUTES - ✅ ALL WORKING NOW!
            ========================================== */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/schools" element={<AdminSchools />} />
              <Route path="/admin/curriculum" element={<AdminCurriculum />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>

            {/* Student Routes */}
            <Route element={<RoleRoute allowedRoles={['student']} />}>
              <Route path="/student/select-class" element={<SelectClass />} />
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quiz/:id" element={<QuizSeparated />} />
            </Route>

          </Route>
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;