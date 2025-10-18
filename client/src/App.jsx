import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Core Component Imports ---
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import SubscriptionGate from './components/SubscriptionGate'; // Import the subscription gate

// --- Page Imports ---
// General Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PricingPage from './pages/PricingPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import MyBadges from './pages/MyBadges';
import TakeQuiz from './pages/TakeQuiz';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminSchools from './pages/AdminSchools';
import SchoolDashboard from './pages/SchoolDashboard';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import LessonNoteView from './pages/LessonNoteView';

function App() {
  return (
    <>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
            <Routes>
              {/* --- Public Routes --- */}
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/pricing' element={<PricingPage />} />
              <Route path='/payment-success' element={<PaymentSuccess />} />
              <Route path='/payment-failed' element={<PaymentFailed />} />

              {/* --- Private Routes (All Logged-in Users) --- */}
              <Route element={<PrivateRoute />}>
                <Route path='/' element={<Dashboard />} />
                <Route path='/my-badges' element={<MyBadges />} />
                <Route path='/quiz/:id' element={<TakeQuiz />} />
                <Route path='/school/dashboard/:schoolId' element={<SchoolDashboard />} />
              </Route>

              {/* --- Role-Protected Routes (Wrapped in PrivateRoute) --- */}
              <Route element={<PrivateRoute />}>
                {/* Admin Routes */}
                <Route path='/admin' element={<RoleRoute allowedRoles={['admin']} />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path='users' element={<AdminUsers />} />
                  <Route path='curriculum' element={<AdminCurriculum />} />
                  <Route path='schools' element={<AdminSchools />} />
                </Route>

                {/* Teacher Routes */}
                // ... inside App.jsx

                {/* Teacher Routes */}
                <Route path='/teacher' element={<RoleRoute allowedRoles={['teacher', 'school_admin', 'admin']} />}>
                  {/* The SubscriptionGate component has been removed */}
                  <Route path='dashboard' element={<TeacherDashboard />} />
                  <Route path='notes/:noteId' element={<LessonNoteView />} />
                </Route>
              </Route>
              
              {/* Fallback Route */}
              <Route path='*' element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
      <ToastContainer position="bottom-center" theme="colored" />
    </>
  );
}

export default App;