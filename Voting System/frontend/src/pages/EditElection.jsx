import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DateInput from "../components/DateInput";

const mockElection = {
  id: 1,
  title: "Student Council Election 2025",
  description: "Choose the representatives for your department.",
  startDate: "2025-10-28",
  endDate: "2025-11-01",
};

const EditElection = () => {
  const { id } = useParams();
  const [form, setForm] = useState(mockElection);

  useEffect(() => {
    // In real app -> fetch(`/api/host/election/${id}`)
    setForm(mockElection);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Election updated successfully!");
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
          Edit Election
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Election Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
          />
          <textarea
            placeholder="Election Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
            rows="4"
          />
          <div className="flex gap-4">
            <div className="w-1/2">
              <DateInput
                label="Start Date"
                value={form.startDate}
                onChange={(value) => setForm({ ...form, startDate: value })}
              />
            </div>
            <div className="w-1/2">
              <DateInput
                label="End Date"
                value={form.endDate}
                onChange={(value) => setForm({ ...form, endDate: value })}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-green-500/20 border border-green-400/40 py-2 rounded-lg hover:bg-green-500/30 transition-all duration-300"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default EditElection;
