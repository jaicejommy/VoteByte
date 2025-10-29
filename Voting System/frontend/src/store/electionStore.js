import { create } from "zustand";
import data from "../data/elections.json";

export const useElectionStore = create((set) => ({
  elections: { active: [], upcoming: [], past: [] },

  fetchElections: () => {
    set({ elections: data });
  },

  getElectionById: (type, id) => {
    return data[type]?.find((el) => el.id === id);
  },
}));
