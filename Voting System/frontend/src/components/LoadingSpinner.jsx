// LoadingSpinner.jsx
import { motion } from "framer-motion";

const LoadingSpinner = ({ theme }) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
        theme === "dark"
          ? "bg-linear-to-r from-gray-900 via-green-900 to-emerald-900"
          : "bg-linear-to-r from-[#F8FAFF] via-[#E6ECFF] to-[#D6E0FF]"
      }`}
    >
      <div className="relative">
       
        <motion.div
          className={`absolute inset-0 rounded-full blur-xl ${
            theme === "dark"
              ? "bg-linear-to-r from-green-400 to-emerald-400"
              : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2]"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`relative w-16 h-16 border-4 rounded-full ${
            theme === "dark"
              ? "border-green-200/20 border-t-green-500"
              : "border-[#D6E0FF] border-t-[#3B5BFF]"
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
