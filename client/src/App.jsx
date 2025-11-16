// /client/src/App.jsx - UPDATED WITH SEPARATED QUIZ
// ✅ LandingPage at root "/"
// ✅ Multiple auth options: /login, /register, /auth
// ✅ Layout wrapper for protected routes (sidebars work)
// ✅ QuizSeparated component for separated question types

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
import LessonNoteView from './pages/LessonNoteView';

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
    dispatch({ type: 'auth/logout' }); // Adjust to match your auth slice action
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
        
        {/* Authentication Routes - You have 3 options! */}
        <Route path="/auth" element={<AuthPortal />} />      {/* Combined login/register */}
        <Route path="/login" element={<Login />} />          {/* Dedicated login page */}
        <Route path="/register" element={<Register />} />    {/* Dedicated register page */}

        {/* ==========================================
            PROTECTED ROUTES (With Layout/Sidebar)
            All dashboards show sidebar navigation
        ========================================== */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route element={<PrivateRoute />}>
            
            {/* Teacher & School Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['teacher', 'school_admin']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/notes/:id" element={<LessonNoteView />} />
            </Route>

            {/* Admin Dashboard */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Student Dashboard */}
            <Route element={<RoleRoute allowedRoles={['student']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* ✅ UPDATED: Use QuizSeparated for separated question types */}
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

/* 
==========================================
QUIZ SEPARATION UPDATE:
==========================================

The quiz route now uses QuizSeparated component which:

1. SEPARATES QUESTIONS INTO TWO SECTIONS:
   - Auto-Graded: MCQs and True/False (shown on dashboard)
   - Written: Short Answer and Essay (for exercise books)

2. AUTO-GRADED SECTION:
   - Timer countdown (if applicable)
   - Automatic scoring
   - Immediate feedback
   - Results displayed with percentage
   - Dashboard shows this score only

3. WRITTEN SECTION:
   - Students complete in exercise books
   - Model answers viewable after auto-graded submission
   - No timer
   - Not counted in dashboard score

4. BENEFITS:
   - Saves 60%+ teacher grading time
   - Clear dashboard metrics (objective scores only)
   - Students learn from model answers
   - Better user experience
*/