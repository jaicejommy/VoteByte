// store/useAdminStore.js
import { create } from "zustand";

export const useAdminStore = create((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // simulate dummy API call
      await new Promise((res) => setTimeout(res, 1000));
      if (email === "admin@college.com" && password === "admin123") {
        set({ admin: { email }, isAuthenticated: true, isLoading: false });
      } else {
        set({ error: "Invalid credentials", isLoading: false });
      }
    } catch (err) {
      set({ error: "Something went wrong", isLoading: false });
    }
  },

  logout: () => set({ admin: null, isAuthenticated: false }),
}));
