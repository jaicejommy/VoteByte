import { create } from "zustand";
import api from "../services/apiService";

export const useElectionStore = create((set, get) => ({
  elections: { UPCOMING: [], ONGOING: [], COMPLETED: [] },
  userElections: [],
  isLoading: false,
  error: null,
  pendingCandidates: [],

  // Fetch all elections grouped by status
  fetchElections: async () => {
    set({ isLoading: true, error: null });
    try {
      const upcomingRes = await api.get('/elections/status/UPCOMING');
      const ongoingRes = await api.get('/elections/status/ONGOING');
      const completedRes = await api.get('/elections/status/COMPLETED');

      set({
        elections: {
          UPCOMING: upcomingRes.data?.data || [],
          ONGOING: ongoingRes.data?.data || [],
          COMPLETED: completedRes.data?.data || []
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching elections:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch elections',
        isLoading: false
      });
    }
  },

  // Fetch user's own elections (created by the logged-in user)
  fetchUserElections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/elections/user/my-elections');
      set({
        userElections: response.data?.data || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching user elections:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch your elections',
        isLoading: false
      });
    }
  },

  // Fetch elections by specific status
  fetchElectionsByStatus: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/elections/status/${status}`);
      set({
        elections: {
          ...get().elections,
          [status]: response.data?.data || []
        },
        isLoading: false
      });
    } catch (error) {
      console.error(`Error fetching ${status} elections:`, error);
      set({
        error: error.response?.data?.message || `Failed to fetch ${status} elections`,
        isLoading: false
      });
    }
  },

  getElectionById: (status, id) => {
    return get().elections[status]?.find((el) => el.election_id === id);
  },

  submitCandidateApplication: (electionId, payload) => {
    const application = {
      id: `${electionId}-${Date.now()}`,
      electionId,
      status: "pending",
      submittedAt: new Date().toISOString(),
      ...payload,
    };
    set((state) => ({ pendingCandidates: [application, ...state.pendingCandidates] }));
    return application.id;
  },

  getPendingCandidates: () => {
    return get().pendingCandidates;
  },
}));
