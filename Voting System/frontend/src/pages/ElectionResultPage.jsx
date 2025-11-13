import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Users, Trophy } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useResultStore } from "../store/resultStore";

const PIE_COLORS = ["#4F62C2", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#a855f7", "#0ea5e9"];

function formatDate(date) {
  if (!date) return "Unknown";
  const dt = new Date(date);
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

function statCard(label, value, highlight) {
  return (
    <div className="rounded-2xl border p-5 shadow-lg backdrop-blur-sm bg-white/70 dark:bg-gray-900/60 border-transparent">
      <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${highlight ? "text-[#4F62C2]" : "text-gray-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}

export default function ElectionResultPage({ theme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentResult = useResultStore((s) => s.currentResult);
  const isLoading = useResultStore((s) => s.isLoading);
  const error = useResultStore((s) => s.error);
  const loadElectionResult = useResultStore((s) => s.loadElectionResult);
  const resetCurrentResult = useResultStore((s) => s.resetCurrentResult);


  useEffect(() => {
    loadElectionResult(id);
    return () => resetCurrentResult();
  }, [id, loadElectionResult, resetCurrentResult]);

  const pieData = useMemo(() => {
    if (!currentResult) return [];
    return (currentResult.candidates || []).map((candidate, index) => ({
      name: candidate.party_name || candidate.name,
      value: candidate.total_votes || 0,
      percentage: candidate.vote_percentage || 0,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [currentResult]);

  const barData = useMemo(() => {
    if (!currentResult?.chart?.bar?.series?.length) {
      return (currentResult?.candidates || []).map((candidate) => ({
        name: candidate.party_name || candidate.name,
        votes: candidate.total_votes || 0,
      }));
    }
    const series = currentResult.chart.bar.series[0];
    return series.data.map((entry, index) => ({
      name: entry.x,
      votes: entry.y,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [currentResult]);

  const winner = currentResult?.winner;
  const totalRegistered = currentResult?.total_registered_voters ?? 0;
  const totalVotes = currentResult?.total_votes ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen w-full px-6 sm:px-10 py-12 overflow-y-auto"
      style={{
        background: theme === "dark"
          ? "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(17,24,39,0.95))"
          : "linear-gradient(135deg, rgba(234,240,255,0.9), rgba(218,233,255,0.95))",
      }}
    >
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4F62C2] hover:text-[#1E3A8A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="h-12 w-12 rounded-full border-4 border-[#4F62C2]/20 border-t-[#4F62C2]"
            />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow">
            <p className="font-semibold">Unable to load election result</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && currentResult && (
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-transparent bg-white/80 p-8 shadow-2xl backdrop-blur-md dark:bg-gray-900/80"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#4F62C2]">Completed Election</p>
                  <h1 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">{currentResult.title}</h1>
                  <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                    Final results generated on {formatDate(currentResult.generated_at)}. Explore turnout, candidate performance, and vote distribution.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 rounded-xl bg-[#4F62C2]/10 px-4 py-2 text-[#1E3A8A] dark:bg-[#312e81]/60 dark:text-white">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatDate(currentResult.timeframe?.start)} – {formatDate(currentResult.timeframe?.end)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-[#22c55e]/10 px-4 py-2 text-[#166534] dark:bg-[#14532d]/60 dark:text-emerald-200">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{totalRegistered.toLocaleString()} Registered</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {statCard("Total Votes Cast", totalVotes.toLocaleString(), true)}
              {statCard("Voter Turnout", `${currentResult.voter_turnout_percentage ?? 0}%`, true)}
              {statCard("Result Generated", formatDate(currentResult.generated_at), false)}
            </div>

              {winner && (
                <div className="rounded-3xl border border-transparent bg-white/80 p-6 shadow-2xl backdrop-blur-md dark:bg-gray-900/80">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4F62C2]/10 text-[#4F62C2]">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Winner</p>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{winner.name || winner.party_name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{winner.party_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {winner.total_votes?.toLocaleString() || 0} votes
                      </p>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                        {winner.vote_percentage ?? 0}% share
                      </span>
                    </div>
                  </div>
                </div>
              )}

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-transparent bg-white/80 p-6 shadow-xl backdrop-blur-md dark:bg-gray-900/80">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vote Distribution</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pie chart of vote share by candidate</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="40%" outerRadius="70%" paddingAngle={2}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _, payload) => [`${value.toLocaleString()} votes`, payload.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3 rounded-xl border border-transparent bg-gray-50/80 p-3 dark:bg-gray-800/60">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.value.toLocaleString()} votes • {item.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-transparent bg-white/80 p-6 shadow-xl backdrop-blur-md dark:bg-gray-900/80">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Votes by Candidate</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bar chart showing total votes received</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()} votes`} />
                      <Legend />
                      <Bar dataKey="votes" name="Votes" radius={[8, 8, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`bar-cell-${entry.name}-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-transparent bg-white/80 p-6 shadow-xl backdrop-blur-md dark:bg-gray-900/80">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate Breakdown</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed performance metrics per candidate, including total votes and percentage share.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50/70 dark:bg-gray-800/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Candidate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Party
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Votes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Vote %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white/60 dark:divide-gray-800 dark:bg-gray-900/60">
                    {(currentResult.candidates || []).map((candidate) => (
                      <tr key={candidate.candidate_id}>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {candidate.name || candidate.party_name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{candidate.party_name}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {candidate.total_votes?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{candidate.vote_percentage ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

