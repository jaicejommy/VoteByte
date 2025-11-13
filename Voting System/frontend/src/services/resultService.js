import api from './apiService';

export const fetchCompletedResults = async () => {
  const response = await api.get('/results');
  return response.data?.data || [];
};

export const fetchElectionResult = async (electionId) => {
  if (!electionId) {
    throw new Error('Election ID is required');
  }

  const response = await api.get(`/results/${electionId}`);
  return response.data?.data || null;
};

export const regenerateElectionResult = async (electionId) => {
  if (!electionId) {
    throw new Error('Election ID is required');
  }

  const response = await api.post(`/results/${electionId}/generate`);
  return response.data?.data || null;
};

