// src/pages/HostDashboard.jsx
import { motion } from "framer-motion";
import { BarChart3, CalendarPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";

const HostDashboard = () => {
  const stats = [
    { icon: <BarChart3 size={26} />, title: "Total Elections", value: 5 },
    { icon: <CalendarPlus size={26} />, title: "Upcoming Elections", value: 2 },
    { icon: <Users size={26} />, title: "Total Voters", value: 1500 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-8">Host Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/60 border border-green-400/20 p-6 rounded-2xl flex flex-col items-center text-center hover:border-green-400/40 transition-all duration-300"
          >
            <div className="text-green-400 mb-2">{s.icon}</div>
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="text-gray-400 text-lg mt-2">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link
          to="/host/election/new"
          className="bg-green-500/20 border border-green-400/30 px-5 py-2 rounded-lg hover:bg-green-500/30 transition-all"
        >
          Create Election
        </Link>
        <Link
          to="/host/elections"
          className="bg-gray-800/50 border border-green-400/20 px-5 py-2 rounded-lg hover:bg-gray-700/50 transition-all"
        >
          View Elections
        </Link>
      </div>
    </div>
  );
};

export default HostDashboard;
