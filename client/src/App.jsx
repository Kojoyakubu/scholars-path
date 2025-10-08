import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TeacherRoute from './components/TeacherRoute';
import SubscriptionGate from './components/SubscriptionGate';
import SchoolDashboard from './pages/SchoolDashboard';
import SchoolAdminRoute from './components/SchoolAdminRoute';

// Import Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PricingPage from './pages/PricingPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

// Import Private Pages
import Dashboard from './pages/Dashboard';
import TakeQuiz from './pages/TakeQuiz';
import MyBadges from './pages/MyBadges';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminUsers from './pages/AdminUsers';
import AdminSchools from './pages/AdminSchools';


function App() {
  return (
    <>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* ====================================================== */}
              {/* Public Routes - Accessible to everyone                 */}
              {/* ====================================================== */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />

              {/* ====================================================== */}
              {/* Private Routes - Accessible only to logged-in users    */}
              {/* ====================================================== */}
              <Route element={<PrivateRoute />}>
                {/* General User Routes */}
                <Route path="/" element={<SubscriptionGate><Dashboard /></SubscriptionGate>} />
                <Route path="/quiz/:id" element={<TakeQuiz />} />
                <Route path="/my-badges" element={<MyBadges />} />

                {/* Teacher Routes - Protected by both PrivateRoute and TeacherRoute */}
                <Route element={<TeacherRoute />}>
                    <Route path="/teacher/dashboard" element={<SubscriptionGate><TeacherDashboard /></SubscriptionGate>} />
                </Route>

                {/* Admin Routes - Protected by both PrivateRoute and AdminRoute */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="curriculum" element={<AdminCurriculum />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="schools" element={<AdminSchools />} />
                </Route>
              </Route>
              <Route path="/school/dashboard" element={<SchoolAdminRoute />}>
                <Route path="/school/dashboard" element={<SchoolDashboard />} />
              </Route>
              <Route path="/school/dashboard/:schoolId" element={<SchoolAdminRoute />}>
                <Route path="/school/dashboard/:schoolId" element={<SchoolDashboard />} />
              </Route>

              {/* Optional: Add a "Not Found" route for any other path */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;