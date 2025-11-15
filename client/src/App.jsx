// /client/src/App.jsx - FINAL COMPLETE VERSION
// ✅ LandingPage at root "/"
// ✅ Multiple auth options: /login, /register, /auth
// ✅ Layout wrapper for protected routes (sidebars work)

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
import TakeQuiz from './pages/TakeQuiz';

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
              <Route path="/quiz/:id" element={<TakeQuiz />} />
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
ROUTING STRUCTURE EXPLANATION:
==========================================

PUBLIC PAGES (No sidebar):
- /                  → LandingPage (marketing homepage)
- /auth              → AuthPortal (combined login/register with sliding panels)
- /login             → Login (dedicated login page)
- /register          → Register (dedicated register page)

PROTECTED PAGES (With sidebar):
- /dashboard         → Student Dashboard
- /teacher/dashboard → Teacher Dashboard
- /admin             → Admin Dashboard

==========================================
WHICH AUTH PAGES TO USE:
==========================================

Option 1: Use AuthPortal (/auth)
- Modern sliding panel design
- Login and register in one page
- Users can toggle between forms
- Update LandingPage buttons to point to /auth

Option 2: Use separate Login and Register
- Traditional approach
- Dedicated page for each action
- Current LandingPage buttons already point to these
- More common pattern

Option 3: Keep both (current setup)
- Users can access either /auth OR /login + /register
- More flexibility
- LandingPage uses /login and /register
- You can offer /auth as alternative

==========================================
RECOMMENDATION: Use Option 2 (Separate Pages)
==========================================

Your LandingPage already has buttons linking to:
- /register (Get Started button)
- /login (Sign In button)

So the separate Login.jsx and Register.jsx pages 
work perfectly with your current setup!

You can keep AuthPortal at /auth as an alternative,
or remove it if you don't need it.
*/