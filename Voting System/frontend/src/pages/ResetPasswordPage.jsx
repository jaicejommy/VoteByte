import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Loader } from "lucide-react";
import Input from "../components/Input";
import { toast } from "react-hot-toast";

const ResetPasswordPage = ({ theme }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchError, setMatchError] = useState("");

  const { resetPassword, isLoading, error, message } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (confirmPassword && password && confirmPassword !== password) {
      setMatchError("Passwords do not match");
    } else {
      setMatchError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) return;

    try {
      await resetPassword(password, token);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Error in resetting password...");
    }
  };

  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-md w-full rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-500 ${
        isDark
          ? "bg-gray-800 border border-green-500/20"
          : "bg-white/70 border border-[#3B5BFF]/20"
      }`}
    >
      <div className="p-8">
        <h2
          className={`text-5xl font-bold mb-6 text-center ${
            isDark
              ? "bg-linear-to-r from-green-200 to-emerald-700"
              : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2]"
          } text-transparent bg-clip-text`}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Reset Password
        </h2>

        {matchError && <p className="text-red-500 text-sm mb-4">{matchError}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit}>
          <Input
            icon={Lock}
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            theme={theme}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            theme={theme}
          />

          <motion.button
            className={`mt-5 w-full py-3 px-4 font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 transition duration-200 ${
              isDark
                ? "bg-linear-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 focus:ring-offset-gray-900"
                : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2] text-white hover:from-[#3546A7] hover:to-[#3B5BFF] focus:ring-[#3B5BFF] focus:ring-offset-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Update Password"
            )}
          </motion.button>
        </form>
      </div>

      {/* Footer */}
      <div
        className={`px-8 py-4 flex justify-center ${
          isDark
            ? "bg-gray-900/50 text-gray-400"
            : "bg-[#F0F4FF]/70 text-gray-600"
        }`}
      >
        <p className="text-sm">
          Remembered your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className={`font-medium cursor-pointer hover:underline ${
              isDark ? "text-green-400" : "text-[#3B5BFF]"
            }`}
          >
            Login
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
