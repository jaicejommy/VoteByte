// src/pages/HostVerify.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";

const HostVerify = () => {
  const [form, setForm] = useState({ organization: "", idProof: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Verification request submitted!");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 text-white p-6">
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="bg-gray-900/60 backdrop-blur-xl border border-green-400/20 rounded-2xl p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">Host Verification</h2>
        <p className="text-gray-400 mb-6 text-center">
          Please fill in your details to get verified as a host.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Organization / Institute"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
          />

          <input
            type="file"
            onChange={(e) => setForm({ ...form, idProof: e.target.files[0] })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-500/20 border border-green-400/40 py-2 rounded-lg hover:bg-green-500/30 transition-all duration-300"
          >
            Submit Request
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default HostVerify;
