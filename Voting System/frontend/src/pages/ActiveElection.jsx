import { useParams } from "react-router-dom";
import { useElectionStore } from "../store/electionStore";
import { motion } from "framer-motion";

export default function ActiveElection() {
  const { id } = useParams();
  const { getElectionById } = useElectionStore();
  const election = getElectionById("active", id);

  if (!election) return <div>Election not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-white p-10"
    >
      <h1 className="text-3xl font-bold mb-6">{election.title}</h1>
      <p className="text-gray-300 mb-6">{election.description}</p>

      <h2 className="text-2xl mb-4">Candidates</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {election.candidates.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-gray-800 rounded-lg"
          >
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-400">{c.party}</p>
            <button className="mt-3 bg-green-600 px-4 py-1 rounded-md hover:bg-green-700">
              Vote
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
