import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CreateElection = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Election created successfully!");
    setForm({ title: "", description: "", startDate: "", endDate: "" });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center p-6">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="bg-gray-900/60 border border-green-400/20 backdrop-blur-xl p-8 rounded-2xl w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Create New Election
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Election Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
            required
          />
          <textarea
            placeholder="Election Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
            rows="4"
            required
          />
          <div className="flex gap-4">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-1/2 bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
              required
            />
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-1/2 bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-500/20 border border-green-400/40 py-2 rounded-lg hover:bg-green-500/30 transition-all duration-300"
          >
            Create Election
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateElection;
