// /client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import LessonNoteView from './pages/LessonNoteView';
import AdminDashboard from './pages/AdminDashboard';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminSchools from './pages/AdminSchools';
import AdminUsers from './pages/AdminUsers';
import MyBadges from './pages/MyBadges';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PricingPage from './pages/PricingPage';
import TakeQuiz from './pages/TakeQuiz';
import AuthPortal from './pages/AuthPortal';

// ✅ IMPORT the RoleRoute component
import RoleRoute from './components/RoleRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPortal />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Redirect old login/register links to AuthPortal */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        
        {/* ======================================================= */}
        {/* ✅ PROTECTED ROUTES - Grouped by Role (Using RoleRoute) */}
        {/* ======================================================= */}
        
        {/* Student Routes */}
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-badges" element={<MyBadges />} />
          <Route path="/take-quiz" element={<TakeQuiz />} />
        </Route>

        {/* Teacher & School Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['teacher', 'school_admin']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/school/dashboard" element={<SchoolDashboard />} />
          <Route path="/lesson-note/:id" element={<LessonNoteView />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/curriculum" element={<AdminCurriculum />} />
          <Route path="/admin/schools" element={<AdminSchools />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
        
        {/* Payment feedback */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;