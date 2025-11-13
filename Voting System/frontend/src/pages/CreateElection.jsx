import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import api from "../services/apiService";
import DateInput from "../components/DateInput";

const CreateElection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "18:00",
    authType: "STUDENT_ID",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.title || !form.description || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.startDate >= form.endDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setIsLoading(true);

      // Combine date and time
      const start_time = new Date(`${form.startDate}T${form.startTime}`);
      const end_time = new Date(`${form.endDate}T${form.endTime}`);

      const response = await api.post('/elections/create', {
        title: form.title,
        description: form.description,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        authType: form.authType,
      });

      toast.success("Election created successfully!");
      setForm({
        title: "",
        description: "",
        startDate: "",
        startTime: "10:00",
        endDate: "",
        endTime: "18:00",
        authType: "STUDENT_ID",
      });
      
      // Redirect to elections page
      navigate("/host/elections");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create election";
      toast.error(errorMessage);
      console.error("Error creating election:", error);
    } finally {
      setIsLoading(false);
    }
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
          
          <select
            value={form.authType}
            onChange={(e) => setForm({ ...form, authType: e.target.value })}
            className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
          >
            <option value="STUDENT_ID">Student ID</option>
            <option value="OTP">OTP</option>
            <option value="AADHAR">Aadhar</option>
          </select>

          <div className="flex gap-4">
            <div className="w-1/2">
              <DateInput
                label="Start Date"
                value={form.startDate}
                onChange={(value) => setForm({ ...form, startDate: value })}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="text-sm text-gray-400">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <DateInput
                label="End Date"
                value={form.endDate}
                onChange={(value) => setForm({ ...form, endDate: value })}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="text-sm text-gray-400">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg focus:border-green-400 outline-none"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500/20 border border-green-400/40 py-3 rounded-lg hover:bg-green-500/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Election"
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateElection;
