// /client/src/components/RoleRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * RoleRoute ensures that only users with allowed roles can access a route.
 * It reads from both Redux and localStorage so it works even after refresh.
 */
const RoleRoute = ({ allowedRoles }) => {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const location = useLocation();

  // ✅ Use Redux if available, otherwise fallback to localStorage
  const user =
    reduxUser ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem('user')) || null;
      } catch {
        return null;
      }
    })();

  // ⏳ If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚫 If logged in but role not allowed, redirect to home
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise, render the protected route content
  return <Outlet />;
};

export default RoleRoute;
