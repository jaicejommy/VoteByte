import { useEffect } from "react";
import { useElectionStore } from "../store/electionStore";
import ElectionCard from "../components/ElectionCard";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

export default function ElectionPage({ theme }) {
  const { elections, isLoading, fetchElections } = useElectionStore();

  useEffect(() => {
    fetchElections();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`min-h-screen px-6 sm:px-10 py-12 ${
        theme === "dark"
          ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-linear-to-br from-[#F8FAFF] via-[#EEF2FF] to-[#F8FAFF] text-[#1E3A8A]"
      }`}
    >
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-5xl font-extrabold mb-12 text-center drop-shadow-md ${
          theme === "dark"
            ? "text-white"
            : "bg-linear-to-r from-[#2A3A68] to-[#4F62C2] bg-clip-text text-transparent"
        }`}
      >
        Election Dashboard
      </motion.h1>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-green-400" />
        </div>
      )}

      {/* Section Container */}
      {!isLoading && (
        <div className="space-y-16">
          {["UPCOMING", "ONGOING", "COMPLETED"].map((type, idx) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.2 }}
            >
              <h2
                className={`text-3xl font-semibold capitalize mb-6 tracking-wide border-l-4 pl-4 ${
                  theme === "dark"
                    ? "text-gray-300 border-green-400"
                    : "text-[#2A3A68] border-[#4F62C2]"
                }`}
              >
                {type.toLowerCase()} Elections
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {elections[type]?.length > 0 ? (
                  elections[type].map((el) => (
                    <motion.div
                      key={el.election_id}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    >
                      <ElectionCard election={el} theme={theme} />
                    </motion.div>
                  ))
                ) : (
                  <p
                    className={`italic text-center col-span-full ${
                      theme === "dark" ? "text-gray-500" : "text-[#8A96B8]"
                    }`}
                  >
                    No {type.toLowerCase()} elections available
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}