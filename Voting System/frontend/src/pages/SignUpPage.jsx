import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Mail, Lock, Loader, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const SignUpPage = ({ theme }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState("user");
  const selectRef = useRef(null);
  const navigate = useNavigate();

  const { signup, error, isLoading } = useAuthStore();

  // Submit signup form and redirect
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      return;
    }

    // Convert userType to match backend expectations
    const role = userType.toUpperCase() === 'USER' ? 'USER' : 'HOST';
    
    const success = await signup(name, email, password, role);
    if (success) {
      navigate("/verify-email");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelectClick = () => setIsOpen((prev) => !prev);
  const handleChange = (e) => {
    setUserType(e.target.value);
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
     className={`max-w-md w-full rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-500 ${
        theme === "dark"
          ? "bg-gray-800 border border-green-500/20"
          : "bg-white/70 border border-[#3B5BFF]/20"
      }`}
    >


      <div className="p-8">
        <h2
          className={`text-5xl font-bold mb-6 text-center ${theme === "dark"
              ? "bg-linear-to-r from-green-300 to-emerald-600 text-transparent bg-clip-text"
              : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1] text-transparent bg-clip-text"
            }`}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Create Account
        </h2>

        <form onSubmit={handleSignUp}>
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            theme={theme}
          />
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            theme={theme}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            theme={theme}
          />

          <div className="relative mb-4" ref={selectRef}>
            <User
              className={`absolute left-3 top-3 ${theme === "dark" ? "text-gray-400" : "text-[#3B5BFF]"
                }`}
              size={20}
            />

            <select
              className={`w-full pl-10 pr-10 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 transition duration-200 appearance-none cursor-pointer ${theme === "dark"
                  ? "bg-transparent text-white border border-gray-600 focus:ring-green-500"
                  : "bg-[#F8FAFF] text-[#1E3A8A] border border-[#D6E0FF] focus:ring-[#3B5BFF]"
                }`}
              value={userType}
              onChange={handleChange}
              onClick={handleSelectClick}
            >
              <option
                value="user"
                className={theme === "dark" ? "bg-gray-800 text-white" : ""}
              >
                User
              </option>
              <option
                value="host"
                className={theme === "dark" ? "bg-gray-800 text-white" : ""}
              >
                Host
              </option>
            </select>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.1 : 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`absolute right-3 top-3.5 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-[#3B5BFF]"
                }`}
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>

          {error && (
            <p className="text-red-500 font-semibold mt-2 text-center">
              {error}
            </p>
          )}

          {password.length > 0 && <PasswordStrengthMeter password={password} />}

          <motion.button
            className={`mt-5 w-full py-3 px-4 font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${theme === "dark"
                ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-600 text-white focus:ring-green-500 focus:ring-offset-gray-900"
                : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1] hover:from-[#2F49D1] hover:to-[#3B5BFF] text-white focus:ring-[#3B5BFF] focus:ring-offset-white"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="animate-spin mx-auto" size={24} />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>
      </div>

      <div
        className={`px-8 py-4 flex justify-center rounded-b-2xl transition-colors duration-300 ${theme === "dark" ? "bg-gray-900/60" : "bg-[#F8FAFF]"
          }`}
      >
        <p
          className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-[#4B5563]"
            }`}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-semibold hover:underline ${theme === "dark"
                ? "text-green-400"
                : "text-[#3B5BFF] hover:text-[#2F49D1]"
              }`}
          >
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpPage;
