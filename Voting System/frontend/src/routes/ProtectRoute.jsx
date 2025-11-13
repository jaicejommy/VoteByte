import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.status || user.status !== 'ACTIVE') {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

