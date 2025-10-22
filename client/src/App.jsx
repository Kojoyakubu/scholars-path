// /client/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Authentication
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout'; // ✅ Import the new Layout component
import LandingPage from './pages/LandingPage'; // ✅ Will create this in next step
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageSchools from './pages/ManageSchools';
import AdminCurriculum from './pages/AdminCurriculum';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import LessonNoteView from './pages/LessonNoteView';

// Student Pages
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} /> {/* ✅ New Landing Page */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Wrapped by Layout */}
          <Route element={<PrivateRoute />}> {/* PrivateRoute ensures user is logged in */}
            <Route element={<Layout />}> {/* ✅ All these routes will use the new Layout */}
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/schools" element={<ManageSchools />} />
              <Route path="/admin/curriculum" element={<AdminCurriculum />} />

              {/* Teacher/School Admin Routes */}
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/notes/:noteId" element={<LessonNoteView />} />
              {/* Add /teacher/quizzes etc. as you create them */}

              {/* Student Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              {/* Add /student/progress etc. as you create them */}
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