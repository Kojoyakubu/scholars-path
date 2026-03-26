// /client/src/App.jsx - UPDATED WITH ADMIN ROUTES
// ✅ LandingPage at root "/"
// ✅ Multiple auth options: /login, /register, /auth
// ✅ Layout wrapper for protected routes (sidebars work)
// ✅ QuizSeparated component for separated question types
// ✅ SelectClass route for student class selection
// ✅ NEW: All admin routes (Users, Schools, Curriculum, Analytics)

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';

// Layout Component (provides sidebar for protected routes)
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';     // Marketing homepage
import AuthPortal from './pages/AuthPortal';        // Combined login/register
import Login from './pages/Login';                  // Separate login
import Register from './pages/Register';            // Separate register
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSchools = lazy(() => import('./pages/AdminSchools'));
const AdminCurriculum = lazy(() => import('./pages/AdminCurriculum'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const LessonNoteView = lazy(() => import('./pages/LessonNoteView'));
const SelectClass = lazy(() => import('./pages/SelectClass'));
const AccountProfile = lazy(() => import('./pages/AccountProfile'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const MyBadges = lazy(() => import('./pages/MyBadges'));
const SchoolDashboard = lazy(() => import('./pages/SchoolDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const QuizSeparated = lazy(() => import('./components/QuizSeparated'));

// Routes
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout()).finally(() => {
        navigate('/login', {
          replace: true,
          state: { sessionExpired: true },
        });
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [dispatch, navigate]);

  // Logout handler for Layout component
  const handleLogout = () => {
    dispatch(logout()).finally(() => {
      navigate('/', { replace: true });
    });
  };

  return (
    <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>}>
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
        <Route path="/pricing" element={<PricingPage />} />

        {/* ==========================================
            PROTECTED ROUTES (With Layout/Sidebar)
        ========================================== */}
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route element={<PrivateRoute />}>
            <Route path="/account/profile" element={<AccountProfile />} />
            <Route path="/account/settings" element={<AccountSettings />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
            {/* Teacher Routes */}
            <Route element={<RoleRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/notes/:id" element={<LessonNoteView />} />
            </Route>

            {/* School Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['school_admin']} />}>
              <Route path="/school/dashboard" element={<SchoolDashboard />} />
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
              <Route path="/student/badges" element={<MyBadges />} />
            </Route>

          </Route>
        </Route>

        {/* 404 - catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;