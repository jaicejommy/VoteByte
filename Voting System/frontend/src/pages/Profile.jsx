import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Calendar, X, Award, TrendingUp, CheckCircle, Clock, Shield, Edit2, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  
  // Get authenticated user from auth store
  const { user: authUser } = useAuthStore();

  // Local copy to allow editing in the UI without forcing an auth update
  const [localUser, setLocalUser] = useState({
    name: authUser?.fullname || "Guest User",
    email: authUser?.email || "—",
    joined: authUser?.joined_at ? new Date(authUser.joined_at).toLocaleDateString() : "—",
    role: authUser?.role || "Student Voter",
    department: authUser?.department || "—",
    year: authUser?.year || "—",
    studentId: authUser?.student_id || authUser?.user_id || "—"
  });

  const [newName, setNewName] = useState(localUser.name);

  // Keep localUser in sync when authUser changes
  useEffect(() => {
    const updated = {
      name: authUser?.fullname || "Guest User",
      email: authUser?.email || "—",
      joined: authUser?.joined_at ? new Date(authUser.joined_at).toLocaleDateString() : "—",
      role: authUser?.role || "Student Voter",
      department: authUser?.department || "—",
      year: authUser?.year || "—",
      studentId: authUser?.student_id || authUser?.user_id || "—"
    };
    setLocalUser(updated);
    setNewName(updated.name);
  }, [authUser]);

  // Avatar options
  const avatarlinears = [
    "from-green-500 to-emerald-600",
    "from-blue-500 to-cyan-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-yellow-500 to-orange-600",
    "from-teal-500 to-green-600",
  ];

  // Dummy participation data
  const participationStats = [
    { icon: Award, label: "Elections Voted", value: "12", color: "text-green-400" },
    { icon: TrendingUp, label: "Participation Rate", value: "95%", color: "text-blue-400" },
    { icon: CheckCircle, label: "Verified Votes", value: "12/12", color: "text-emerald-400" },
    { icon: Clock, label: "Avg. Vote Time", value: "45s", color: "text-purple-400" },
  ];

  const recentElections = [
    { name: "Student Council President 2024", date: "Oct 15, 2024", status: "Completed", voted: true },
    { name: "Sports Committee Election", date: "Sep 28, 2024", status: "Completed", voted: true },
    { name: "Cultural Fest Organizer", date: "Sep 10, 2024", status: "Completed", voted: true },
    { name: "Department Representative", date: "Aug 22, 2024", status: "Completed", voted: false },
  ];

  const achievements = [
    { title: "Early Voter", description: "Voted within first hour in 5 elections", icon: "🚀" },
    { title: "Civic Champion", description: "100% participation in semester", icon: "🏆" },
    { title: "Democracy Advocate", description: "Shared 10+ election reminders", icon: "📢" },
  ];

  const handleUpdate = async () => {
    setLocalUser({ ...localUser, name: newName });
    setIsModalOpen(false);
  };

  const handleAvatarChange = () => {
    setIsPhotoModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-linear-to-r from-green-900/20 to-emerald-900/20 rounded-3xl p-8 mb-8 border border-green-400/20 backdrop-blur-xl overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-linear(circle, #10b981 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-32 h-32 bg-linear-to-br ${avatarlinears[selectedAvatar]} rounded-full flex items-center justify-center text-5xl font-bold shadow-2xl cursor-pointer`}
                onClick={() => setIsPhotoModalOpen(true)}
              >
                {(localUser.name || 'U').charAt(0)}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
              >
                <Camera size={18} />
              </motion.button>
              <div className="absolute -inset-2 bg-linear-to-r from-green-400 to-emerald-400 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-4xl font-bold text-green-400">{localUser.name}</h1>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Edit2 size={20} />
                </motion.button>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-300 mb-3">
                  <span className="flex items-center gap-2">
                  <Mail size={16} className="text-green-400" /> {localUser.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-green-400" /> Joined {localUser.joined}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-sm">
                  {localUser.role}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-sm">
                  {localUser.department}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm">
                  {localUser.year}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-sm flex items-center gap-1">
                  <Shield size={14} /> ID: {localUser.studentId}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {participationStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gray-900/70 border border-green-400/20 rounded-2xl p-6 backdrop-blur-xl">
                <stat.icon className={`${stat.color} mb-3`} size={32} />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Elections */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-gray-900/70 border border-green-400/20 rounded-2xl p-6 backdrop-blur-xl"
          >
            <h3 className="text-2xl font-semibold mb-6 text-green-400 flex items-center gap-2">
              <TrendingUp size={24} />
              Recent Elections
            </h3>
            <div className="space-y-4">
              {recentElections.map((election, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="bg-gray-800/40 border border-green-400/10 rounded-xl p-4 hover:border-green-400/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{election.name}</h4>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar size={14} /> {election.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        election.status === "Completed" 
                          ? "bg-green-500/20 text-green-400 border border-green-500/40" 
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                      }`}>
                        {election.status}
                      </span>
                      {election.voted ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle size={14} /> Voted
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Not Voted</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900/70 border border-green-400/20 rounded-2xl p-6 backdrop-blur-xl"
          >
            <h3 className="text-2xl font-semibold mb-6 text-green-400 flex items-center gap-2">
              <Award size={24} />
              Achievements
            </h3>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-linear-to-br from-gray-800/60 to-gray-800/40 border border-green-400/20 rounded-xl p-4 hover:border-green-400/40 transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-white mb-1">{achievement.title}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Name Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 border border-green-400/30 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-semibold text-green-400 mb-6">
                  Update Name
                </h2>

                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdate}
                    className="px-6 py-2 rounded-lg bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all shadow-lg"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhotoModalOpen(false)}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900 border border-green-400/30 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
              >
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-semibold text-green-400 mb-6">
                  Choose Avatar Color
                </h2>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {avatarlinears.map((linear, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(index)}
                      className={`w-20 h-20 bg-linear-to-br ${linear} rounded-full flex items-center justify-center text-2xl font-bold cursor-pointer ${
                        selectedAvatar === index ? 'ring-4 ring-green-400' : ''
                      }`}
                    >
                      {(localUser.name || 'U').charAt(0)}
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarChange}
                    className="px-6 py-2 rounded-lg bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all shadow-lg"
                  >
                    Save Avatar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;