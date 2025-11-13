import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HostProtectRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.status || user.status !== 'ACTIVE') {
    return <Navigate to="/verify-email" replace />;
  }
  // Check if user is a HOST (role should match)
  if (user.role !== 'HOST' && user.role !== 'host') {
    return <Navigate to="/" replace />;
  }

  return children;
}

