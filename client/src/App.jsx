// /client/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Authentication
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';         // Corrected from ManageUsers
import AdminSchools from './pages/AdminSchools';       // Corrected from ManageSchools
import AdminCurriculum from './pages/AdminCurriculum';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import LessonNoteView from './pages/LessonNoteView';

// Student Pages
import Dashboard from './pages/Dashboard';
import TakeQuiz from './pages/TakeQuiz';           // Corrected from QuizPage

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Wrapped by Layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/schools" element={<AdminSchools />} />
              <Route path="/admin/curriculum" element={<AdminCurriculum />} />

              {/* Teacher/School Admin Routes */}
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/notes/:noteId" element={<LessonNoteView />} />

              {/* Student Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
            </Route>
          </Route>

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;