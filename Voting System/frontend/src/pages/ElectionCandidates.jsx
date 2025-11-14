import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useElectionStore } from "../store/electionStore";
import api from "../services/apiService";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import FaceVerification from "../components/FaceVerification";

// Optional fallback manifesto generator when data lacks manifesto
const fallbackManifesto = (name, role) => `My vision as ${role} is to improve transparency, accessibility, and student life. I will prioritize better communication, modern tools, and inclusive events that represent every voice on campus. — ${name}`;

export default function ElectionCandidates({ theme }) {
  const { status, id } = useParams();
  const { getElectionById } = useElectionStore();
  const [openId, setOpenId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ party_name: "", symbol: "", manifesto: "", age: "", qualification: "" });
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [voterStatus, setVoterStatus] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [pendingVoteCandidate, setPendingVoteCandidate] = useState(null);

  const { isAuthenticated } = useAuthStore();

  const election = useMemo(() => getElectionById(status, id), [getElectionById, status, id]);

  useEffect(() => {
    const fetchApproved = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/candidates/election/${id}/approved`);
        // Use candidate_id as identifier coming from backend
        setCandidates(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch candidates', err);
        toast.error(err.response?.data?.message || 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchApproved();
  }, [id]);

  // Register voter and fetch voter status on page load
  useEffect(() => {
    const registerAndFetchStatus = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setRegistering(true);
        // Try to register voter with default auth type (can be customized)
        try {
          const registerRes = await api.post('/voters/register', {
            electionId: id,
            authType: 'STUDENT_ID' // Default auth type; can be user-selected
          });
          console.log('Voter registered:', registerRes.data?.data);
        } catch (regErr) {
          // If already registered, that's fine — continue to fetch status
          if (!regErr.response?.data?.message?.includes('already registered')) {
            throw regErr;
          }
        }

        // Fetch voter status
        const resp = await api.get(`/voters/status/${id}`);
        setVoterStatus(resp.data?.data || null);
      } catch (err) {
        console.error('Failed to register/fetch voter status', err);
        // Not fatal — show error toast but continue
        toast.error(err.response?.data?.message || 'Failed to initialize voter status');
        setVoterStatus(null);
      } finally {
        setRegistering(false);
      }
    };

    registerAndFetchStatus();
  }, [id, isAuthenticated]);

  const loadProfile = async (candidateId) => {
    setProfileLoading(true);
    try {
      const res = await api.get(`/candidates/${candidateId}/profile`);
      setProfile(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load profile', err);
      toast.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-10 text-[var(--text)]" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>
          {election?.title || "Election"}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Candidate Manifestos
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="md:col-span-2 text-center py-16">Loading candidates...</div>
          ) : (
            candidates.map((c, idx) => (
            <motion.div
              key={c.candidate_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl p-5 border shadow-[var(--shadow-soft)]"
              style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>{c.user?.fullname || c.party_name || 'Candidate'}</h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{c.party_name || c.role || "Candidate"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium"
                    style={{ backgroundImage: "var(--linear-primary)", boxShadow: "var(--shadow-accent)" }}
                    onClick={() => setOpenId(c.candidate_id)}
                  >
                    View Manifesto
                  </button>
                </div>
              </div>
            </motion.div>
            ))
          )}

          {(!loading && candidates.length === 0) && (
            <div className="md:col-span-2 text-center py-16" style={{ color: "var(--text-muted)" }}>
              No candidates available.
            </div>
          )}
        </div>

        {/* Apply button for authenticated users */}
        {isAuthenticated && (
          <div className="mt-8 text-center">
            <button
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundImage: "var(--linear-primary)" }}
              onClick={() => setShowApply(true)}
            >
              Apply as Candidate
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "var(--overlay)" }}
            onClick={() => {
              setOpenId(null);
              setProfile(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="w-full max-w-xl rounded-2xl p-6 border shadow-[var(--shadow-elevation)]"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
                {(() => {
                  const cand = candidates.find((x) => x.candidate_id === openId);
                  if (!cand) return null;
                  const manifesto = cand.manifesto || fallbackManifesto(cand.user?.fullname || cand.party_name || 'Candidate', cand.role || cand.party || "Candidate");

                  return (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>{cand.user?.fullname || cand.party_name || 'Candidate'}</h2>
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{cand.party || cand.role || "Candidate"}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium"
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}
                            onClick={() => loadProfile(cand.candidate_id)}
                          >
                            View Profile
                          </button>

                          {/* Vote button (visible when election ongoing and voter is verified and hasn't voted) */}
                          {election?.status === 'ONGOING' && (
                            <button
                              className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium ml-2"
                              style={{ backgroundImage: "var(--linear-primary)" }}
                              onClick={async () => {
                                if (!isAuthenticated) {
                                  window.location.href = '/login';
                                  return;
                                }

                                if (!voterStatus) {
                                  toast.error('You are not registered or verified to vote in this election');
                                  return;
                                }

                                if (!voterStatus.verified) {
                                  toast.error('Your voter account is not verified');
                                  return;
                                }

                                if (voterStatus.has_voted) {
                                  toast('You have already voted');
                                  return;
                                }

                                // Show face verification modal for voting
                                setPendingVoteCandidate(cand);
                                setShowFaceVerification(true);
                                if (!confirmVote) return;

                                try {
                                  setVoteLoading(true);
                                  const payload = { electionId: id, candidateId: cand.candidate_id };
                                  const r = await api.post('/votes/cast', payload);
                                  toast.success('Vote cast successfully');
                                  // mark as voted and refresh candidates to update totals
                                  setVoterStatus((s) => ({ ...(s || {}), has_voted: true, voted_at: r.data?.data?.voted_at || new Date().toISOString() }));
                                  const refreshed = await api.get(`/candidates/election/${id}/approved`);
                                  setCandidates(refreshed.data?.data || []);
                                } catch (err) {
                                  console.error('Vote failed', err);
                                  toast.error(err.response?.data?.message || 'Failed to cast vote');
                                } finally {
                                  setVoteLoading(false);
                                }
                              }}
                              disabled={voteLoading}
                            >
                              {voteLoading ? 'Voting...' : 'Vote'}
                            </button>
                          )}

                          <button
                            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium"
                            style={{ backgroundImage: "var(--linear-primary)" }}
                            onClick={() => {
                              setOpenId(null);
                              setProfile(null);
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl p-4 border" style={{ borderColor: "var(--border)", background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))" }}>
                        <p className="leading-relaxed" style={{ color: "var(--text)" }}>{manifesto}</p>

                        {/* Candidate profile area (loaded when user clicks "View Profile") */}
                        <div className="mt-4">
                          {profileLoading && (
                            <div className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>Loading profile...</div>
                          )}

                          {profile && (
                            <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-3)' }}>
                              <div className="flex items-center gap-3">
                                {profile.user?.profile_photo ? (
                                  <img src={profile.user.profile_photo} alt="profile" className="w-16 h-16 rounded-full object-cover" />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">{(profile.user?.fullname || 'U').slice(0,1)}</div>
                                )}

                                <div>
                                  <div className="font-semibold" style={{ color: 'var(--text)' }}>{profile.user?.fullname || profile.fullname || cand.user?.fullname || 'Candidate'}</div>
                                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{profile.party_name || cand.party_name || ''}</div>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-3 text-sm" style={{ color: 'var(--text)' }}>
                                <div><strong>Age:</strong> {profile.age || cand.age || '—'}</div>
                                <div><strong>Qualification:</strong> {profile.qualification || cand.qualification || '—'}</div>
                                <div className="col-span-2"><strong>Total Votes:</strong> {profile.total_votes ?? '—'}</div>
                                <div className="col-span-2 mt-2"><strong>Manifesto:</strong>
                                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{profile.manifesto || manifesto}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-level Apply Modal (opens from Apply button) */}
      <AnimatePresence>
        {showApply && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "var(--overlay)" }}
            onClick={() => setShowApply(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="w-full max-w-xl rounded-2xl p-6 border shadow-[var(--shadow-elevation)]"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>Apply as Candidate</h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Election: {election?.title || id}</p>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium"
                    style={{ backgroundImage: "var(--linear-primary)" }}
                    onClick={() => setShowApply(false)}
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    value={form.party_name}
                    onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                    placeholder="Party / Role"
                    className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg outline-none"
                  />
                  <input
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    placeholder="Symbol (text or URL)"
                    className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg outline-none"
                  />
                  <input
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Age"
                    type="number"
                    className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg outline-none"
                  />
                  <input
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="Qualification"
                    className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg outline-none"
                  />
                  <textarea
                    value={form.manifesto}
                    onChange={(e) => setForm({ ...form, manifesto: e.target.value })}
                    placeholder="Manifesto (optional)"
                    className="w-full bg-gray-800/40 border border-green-400/20 p-3 rounded-lg outline-none"
                    rows={4}
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        // Basic validation
                        if (!form.party_name || !form.symbol || !form.age || !form.qualification) {
                          toast.error('Please fill required fields');
                          return;
                        }

                        try {
                          const payload = {
                            election_id: id,
                            party_name: form.party_name,
                            symbol: form.symbol,
                            manifesto: form.manifesto,
                            age: form.age,
                            qualification: form.qualification
                          };
                          const res = await api.post('/candidates/register', payload);
                          toast.success('Application submitted');
                          setShowApply(false);
                          // Refresh candidates list
                          const refreshed = await api.get(`/candidates/election/${id}/approved`);
                          setCandidates(refreshed.data?.data || []);
                        } catch (err) {
                          console.error('Apply failed', err);
                          toast.error(err.response?.data?.message || 'Failed to apply');
                        }
                      }}
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundImage: "var(--linear-primary)" }}
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face Verification Modal for Voting */}
      <AnimatePresence>
        {showFaceVerification && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "var(--overlay)" }}
            onClick={() => setShowFaceVerification(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="w-full max-w-lg rounded-2xl p-6 border shadow-[var(--shadow-elevation)]"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
                      Face Verification Required
                    </h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Please verify your face before voting
                    </p>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium"
                    style={{ backgroundImage: "var(--linear-primary)" }}
                    onClick={() => setShowFaceVerification(false)}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius)" }} className="p-4">
                  <FaceVerification
                    electionId={id}
                    candidateId={pendingVoteCandidate?.candidate_id}
                    candidateName={pendingVoteCandidate?.user?.fullname || pendingVoteCandidate?.party_name}
                    onVerified={async () => {
                      // Cast vote after face verification
                      try {
                        setVoteLoading(true);
                        const payload = { electionId: id, candidateId: pendingVoteCandidate.candidate_id };
                        await api.post('/votes/cast', payload);
                        toast.success('Vote cast successfully');
                        setShowFaceVerification(false);
                        setPendingVoteCandidate(null);
                        // Refresh voter status
                        const voterStatusRes = await api.get(`/voters/status/${id}`);
                        setVoterStatus(voterStatusRes.data?.data);
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed to cast vote');
                      } finally {
                        setVoteLoading(false);
                      }
                    }}
                    onCancel={() => {
                      setShowFaceVerification(false);
                      setPendingVoteCandidate(null);
                    }}
                    theme={theme}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
