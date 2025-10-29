import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { Sun, Moon } from "lucide-react";

const Navbar = ({ onToggleTheme, theme }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();

  const hiddenRoutes = ["/login", "/signup"];

  useEffect(() => {
    setIsOpen(false);
    toast(`Mapsd to ${location.pathname}`);
  }, [location]);

  if (hiddenRoutes.includes(location.pathname)) return null;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/elections", label: "Elections" },
    { path: "/profile", label: "Profile" },
    // { path: "/dashboard", label: "Dashboard" },
  ];

  const hostLinks = [
    { path: "/host/dashboard", label: "Host Dashboard" },
    { path: "/host/elections", label: "My Elections" },
    { path: "/host/election/new", label: "Create Election" },
  ];

  const allNavLinks =
    isAuthenticated && user?.userType === "host"
      ? [...navLinks, ...hostLinks]
      : navLinks;

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`fixed top-0 left-0 w-full z-50 ${
        theme === "dark"
          ? "bg-gray-800/80 border-white/10"
          : "bg-[#F8FAFF]/80 border-[#D6E0FF]"
      } backdrop-blur-md border-b`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 select-none">
          <Link
            to="/"
            className={`text-2xl font-semibold bg-linear-to-r ${
              theme === "dark"
                ? "from-green-400 to-emerald-500"
                : "from-[#2A3A68] to-[#4F62C2]"
            } bg-clip-text text-transparent`}
          >
            VoteByte
          </Link>
          {isAuthenticated && user?.userType === "host" && (
            <span className="bg-emerald-500/70 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              HOST
            </span>
          )}
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {allNavLinks.map((link) => (
            <motion.div
              key={link.path}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                to={link.path}
                className={`text-sm font-medium transition-colors duration-300 ${
                  location.pathname === link.path
                    ? theme === "dark"
                      ? "text-green-400"
                      : "text-[#2643B3] font-medium"
                    : theme === "dark"
                    ? "text-gray-100 hover:text-green-300"
                    : "text-[#5A678A] hover:text-[#2643B3]"
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}

          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-md ${
              theme === "dark"
                ? "bg-gray-700 text-white"
                : "bg-[#E6ECFF] text-[#1E3A8A]"
            }`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={logout}
              className={`px-4 py-1.5 rounded-md font-medium text-white hover:opacity-90 transition-all ${
                theme === "dark"
                  ? "bg-linear-to-r from-green-400 to-emerald-500"
                  : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1]"
              }`}
            >
              Logout
            </motion.button>
          ) : (
            <Link
              to="/login"
              className={`px-4 py-1.5 rounded-md font-medium text-white hover:opacity-90 transition-all ${
                theme === "dark"
                  ? "bg-linear-to-r from-green-400 to-emerald-500"
                  : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1]"
              }`}
            >
              Login
            </Link>
          )}
        </div>

        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 relative w-7 h-7"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-6 h-0.5 rounded-full ${
              theme === "dark" ? "bg-white" : "bg-[#1E3A8A]"
            }`}
          />
          <motion.span
            initial={false}
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className={`w-6 h-0.5 rounded-full ${
              theme === "dark" ? "bg-white" : "bg-[#1E3A8A]"
            }`}
          />
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-6 h-0.5 rounded-full ${
              theme === "dark" ? "bg-white" : "bg-[#1E3A8A]"
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden backdrop-blur-xl border-t px-6 py-4 flex flex-col gap-4 ${
              theme === "dark"
                ? "bg-gray-800/95 border-white/10 text-white"
                : "bg-[#F8FAFF]/95 border-[#D6E0FF] text-[#1E3A8A]"
            }`}
          >
            {allNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium ${
                  location.pathname === link.path
                    ? theme === "dark"
                      ? "text-green-400"
                      : "text-[#2643B3]"
                    : theme === "dark"
                    ? "text-gray-100 hover:text-green-300"
                    : "text-[#5A678A] hover:text-[#2643B3]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <motion.button
              onClick={onToggleTheme}
              className={`p-2 rounded-md w-full flex items-center gap-2 text-sm font-medium ${
                theme === "dark"
                  ? "text-gray-100 hover:text-green-300"
                  : "text-[#5A678A] hover:text-[#2643B3]"
              }`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>Toggle Theme</span>
            </motion.button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className={`mt-2 text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition-all ${
                  theme === "dark"
                    ? "bg-linear-to-r from-green-400 to-emerald-500"
                    : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1]"
                }`}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className={`mt-2 text-white px-4 py-2 rounded-md font-medium text-center hover:opacity-90 transition-all ${
                  theme === "dark"
                    ? "bg-linear-to-r from-green-400 to-emerald-500"
                    : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1]"
                }`}
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
