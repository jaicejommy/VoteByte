import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HostProtectRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" replace />;
  if (user.userType !== 'host') return <Navigate to="/" replace />;

  return children;
}
