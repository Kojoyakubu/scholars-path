// /client/src/App.jsx - FIXED VERSION WITH SIDEBAR
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Layout Component (ADDED - this provides the sidebar!)
import Layout from './components/Layout';

// Pages
import AuthPortal from './pages/AuthPortal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LessonNoteView from './pages/LessonNoteView';

// Routes
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

const App = () => {
  const dispatch = useDispatch();

  // Logout handler for Layout component
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'auth/logout' }); // Adjust to match your auth slice
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        {/* ==========================================
            PUBLIC ROUTES (No Sidebar)
        ========================================== */}
        <Route path="/" element={<AuthPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==========================================
            PROTECTED ROUTES (With Sidebar)
            🔑 Key Change: Wrap PrivateRoute in Layout!
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