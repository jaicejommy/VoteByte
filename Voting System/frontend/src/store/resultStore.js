import { create } from 'zustand';
import {
  fetchCompletedResults,
  fetchElectionResult,
  regenerateElectionResult,
} from '../services/resultService';

export const useResultStore = create((set, get) => ({
  completedResults: [],
  currentResult: null,
  currentElectionId: null,
  isLoading: false,
  isRegenerating: false,
  error: null,

  loadCompletedResults: async () => {
    set({ isLoading: true, error: null });
    try {
      const results = await fetchCompletedResults();
      set({ completedResults: results, isLoading: false });
    } catch (error) {
      console.error('Error loading completed results:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to load completed results',
        isLoading: false,
      });
    }
  },

  loadElectionResult: async (electionId) => {
    const { currentElectionId } = get();
    if (!electionId) {
      set({ error: 'Election ID is required' });
      return;
    }

    set({ isLoading: true, error: null, currentElectionId: electionId });
    try {
      const result = await fetchElectionResult(electionId);
      set({ currentResult: result, isLoading: false });
    } catch (error) {
      console.error('Error fetching election result:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to load election result',
        isLoading: false,
      });
    }
  },

  regenerateResult: async (electionId) => {
    set({ isRegenerating: true, error: null });
    try {
      const result = await regenerateElectionResult(electionId);
      set({ currentResult: result, isRegenerating: false });
    } catch (error) {
      console.error('Error regenerating result:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to regenerate result',
        isRegenerating: false,
      });
    }
  },

  resetCurrentResult: () => {
    set({
      currentResult: null,
      currentElectionId: null,
      error: null,
      isLoading: false,
      isRegenerating: false,
    });
  },
}));

