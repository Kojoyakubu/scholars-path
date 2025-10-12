import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Core Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PricingPage from './pages/PricingPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import MyBadges from './pages/MyBadges';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminSchools from './pages/AdminSchools';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import LessonNoteView from './pages/LessonNoteView';

function App() {
  return (
    <>
      <Router>
        <Header />
        <main style={{ flexGrow: 1, padding: '20px 0' }}>
          <Routes>
            {/* Public Routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/pricing' element={<PricingPage />} />
            <Route path='/payment-success' element={<PaymentSuccess />} />
            <Route path='/payment-failed' element={<PaymentFailed />} />

            {/* General Private Routes */}
            <Route path='/' element={<PrivateRoute />}>
              <Route path='/' element={<Dashboard />} />
              <Route path='/my-badges' element={<MyBadges />} />
            </Route>

            {/* Admin Routes */}
            <Route path='/admin' element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path='' element={<AdminDashboard />} />
              <Route path='users' element={<AdminUsers />} />
              <Route path='curriculum' element={<AdminCurriculum />} />
              <Route path='schools' element={<AdminSchools />} />
            </Route>

            {/* Teacher Routes */}
            <Route path='/teacher' element={<RoleRoute allowedRoles={['teacher', 'school_admin', 'admin']} />}>
              <Route path='dashboard' element={<TeacherDashboard />} />
              <Route path='notes/:noteId' element={<LessonNoteView />} />
            </Route>

            {/* Fallback Route */}
            <Route path='*' element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;