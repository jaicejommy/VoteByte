import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useElectionStore } from "../store/electionStore";
import { Loader, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const HostElections = () => {
  const { userElections, isLoading, fetchUserElections } = useElectionStore();

  useEffect(() => {
    fetchUserElections();
  }, []);

  const handleDelete = (electionId) => {
    toast.error("Delete feature coming soon!");
    // TODO: Implement delete election API call
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-8">Your Elections</h1>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-green-400" />
        </div>
      ) : userElections.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {userElections.map((e, i) => (
            <motion.div
              key={e.election_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900/60 border border-green-400/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-green-400 mb-2">{e.title}</h3>
              <p className="text-gray-400 text-sm mb-2">
                {e.description && e.description.substring(0, 50)}...
              </p>
              <p className="text-gray-400 capitalize mb-1">
                Status: <span className="text-green-300">{e.status}</span>
              </p>
              <p className="text-gray-400">Total Candidates: {e.total_candidates || 0}</p>
              <p className="text-gray-400 mb-4">Total Voters: {e.total_voters || 0}</p>

              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/host/election/${e.election_id}/edit`}
                  className="bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all text-sm"
                >
                  Edit
                </Link>
                <Link
                  to={`/host/election/${e.election_id}/candidates`}
                  className="px-4 py-2 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundImage: "var(--linear-primary)" }}
                >
                  Details
                </Link>
                <button
                  onClick={() => handleDelete(e.election_id)}
                  className="bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <p className="text-lg mb-4">No elections created yet</p>
          <Link to="/host/election/new" className="text-green-400 hover:underline">
            Create your first election
          </Link>
        </div>
      )}
    </div>
  );
};

export default HostElections;
