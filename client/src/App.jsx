// /client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Pages & Components
import AuthPortal from './pages/AuthPortal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import LessonNoteView from './pages/LessonNoteView';
import NotFound from './pages/NotFound';

// Route guards
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

// Optional layouts (if any)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Optional global navbar */}
      {user && <Navbar />}

      <Routes>
        {/* 🧭 Public routes */}
        <Route path="/" element={<AuthPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================================
            🧱 Protected Routes
        ================================= */}

        {/* Wrap everything in PrivateRoute to check authentication */}
        <Route element={<PrivateRoute />}>
          {/* 🔹 Teacher & School Admin */}
          <Route element={<RoleRoute allowedRoles={['teacher', 'school_admin']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/school/dashboard" element={<SchoolDashboard />} />
            <Route path="/lesson-note/:id" element={<LessonNoteView />} />
          </Route>

          {/* 🔹 Admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 🔹 Student */}
          <Route element={<RoleRoute allowedRoles={['student']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {user && <Footer />}
    </Router>
  );
};

export default App;
