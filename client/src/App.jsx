import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute'; // Import the new component
import SubscriptionGate from './components/SubscriptionGate';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PricingPage from './pages/PricingPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Dashboard from './pages/Dashboard';
import TakeQuiz from './pages/TakeQuiz';
import MyBadges from './pages/MyBadges';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminUsers from './pages/AdminUsers';
import AdminSchools from './pages/AdminSchools';
import SchoolDashboard from './pages/SchoolDashboard';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1, padding: '20px 0' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />

            {/* Private Routes (All logged-in users) */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<SubscriptionGate><Dashboard /></SubscriptionGate>} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
              <Route path="/my-badges" element={<MyBadges />} />
              
              {/* Teacher Routes */}
              <Route element={<RoleRoute allowedRoles={['teacher', 'school_admin', 'admin']} />}>
                <Route path="/teacher/dashboard" element={<SubscriptionGate><TeacherDashboard /></SubscriptionGate>} />
              </Route>
              
              {/* School Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['school_admin', 'admin']} />}>
                <Route path="/school/dashboard/:schoolId" element={<SchoolDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/curriculum" element={<AdminCurriculum />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/schools" element={<AdminSchools />} />
              </Route>
            </Route>
            
            {/* Optional: Add a "Not Found" route */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;