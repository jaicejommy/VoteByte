import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function RedirectAuthenticatedUser({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const canRedirect = isAuthenticated && user?.isVerified;

  useEffect(() => {
    let timerId;
    if (canRedirect) {
      timerId = setTimeout(() => {
        toast("You are already logged in.");
        setShouldRedirect(true);
      }, 100);
    }
    return () => clearTimeout(timerId);
  }, [canRedirect]);

  if (shouldRedirect) return <Navigate to="/" replace />;
  return children;
}
