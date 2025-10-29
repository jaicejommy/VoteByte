import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import {toast} from "react-hot-toast"

import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/formatDate";

const DashBoardPage = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  const handleUpdate = async () => {
    // TODO: call your API /update-profile here
    console.log("Updating name to:", newName);
    await updateProfile(newName);
    setIsModalOpen(false);
    toast.success("Profle Updated Successfully..")
  };

  return (
    <>
      {/* MAIN DASHBOARD CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
          Dashboard
        </h2>

        <div className="space-y-6">
          <motion.div
            className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold bg-linear-to-r from-green-700 to-emerald-400 text-transparent bg-clip-text">
                Profile Information
              </h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-emerald-400 hover:text-emerald-300 underline"
              >
                Update
              </button>
            </div>
            <p className="text-gray-300 mt-2">Name: {user.name}</p>
            <p className="text-gray-300">Email: {user.email}</p>
          </motion.div>

          <motion.div
            className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-green-400 mb-3">
              Account Activity
            </h3>
            <p className="text-gray-300">
              <span className="font-bold">Joined: </span>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-300">
              <span className="font-bold">Last Login: </span>
              {formatDate(user.lastlogin)}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-800 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Logout
          </motion.button>
        </motion.div>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Background overlay */}
            {/*inset-0 Expands it to cover the entire screen (top:0; bottom:0; left:0; right:0;)*/}
            <motion.div
              className="fixed inset-0 bg-emerald-900/30 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal box */}
            <motion.div
              className="fixed z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 relative shadow-xl">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                >
                  <X size={20} />
                </button>

                <h2 className="text-xl font-semibold text-emerald-400 mb-4 text-center">
                  Update Name
                </h2>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-yellow-300/40"
                />

                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashBoardPage;
