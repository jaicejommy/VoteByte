import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Mail, ArrowLeft, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";

const ForgotPasswordPage = ({ theme }) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
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
          className={`text-5xl font-bold mb-6 text-center ${
            theme === "dark"
              ? "bg-linear-to-r from-green-200 to-emerald-700"
              : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2]"
          } text-transparent bg-clip-text`}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Forgot Password
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p
              className={`mb-6 text-center ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Enter your email address and we’ll send you a link to reset your
              password.
            </p>

            <Input
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              theme={theme}
              required
            />

            <motion.button
              className={`mt-5 w-full py-3 px-4 font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 transition duration-200 ${
                theme === "dark"
                  ? "bg-linear-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 focus:ring-offset-gray-900"
                  : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2] text-white hover:from-[#3546A7] hover:to-[#3B5BFF] focus:ring-[#3B5BFF] focus:ring-offset-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Send Reset Link"
              )}
            </motion.button>
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`w-16 h-16 ${
                theme === "dark" ? "bg-green-500" : "bg-[#3B5BFF]"
              } rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <p
              className={`mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              If an account exists for{" "}
              <span className="font-semibold">{email}</span>, you’ll receive a
              password reset link shortly.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-8 py-4 flex justify-center ${
          theme === "dark"
            ? "bg-gray-900/50 text-gray-400"
            : "bg-[#F0F4FF]/70 text-gray-600"
        }`}
      >
        <Link
          to="/login"
          className={`text-sm flex items-center hover:underline ${
            theme === "dark" ? "text-green-400" : "text-[#3B5BFF]"
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
