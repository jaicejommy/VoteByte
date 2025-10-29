import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message:null,

  signup: async (email, password, name, userType) => {
    console.log("REACHED SIGNUP HERE");
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, { email, password, name, userType });
      console.log(response);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error signing up";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email,password) => {
    set({isLoading : true, error:null});
    try {
      const response = await axios.post(`${API_URL}/login`,{email,password});
      set({
        isAuthenticated: true,
        user : response.data.user,
        isLoading : false
      })
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Error in login"
      set({error:message, isLoading:false})
      throw error
    }
  },

  logout: async() => {
    set({isLoading:true,error:null});
    try {
      await axios.post(`${API_URL}/logout`)
      set({user:null, isAuthenticated:false, error:null, isLoading:false});
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error in logout";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (verificationCode) => {
    set({isLoading: true, error:null});
    try {
      const response = await axios.post(`${API_URL}/verify-email`,{code : verificationCode})
      console.log(response);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Verify email";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
 //to make loaderSpinner to rotate
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({isCheckingAuth:true, error:null})
    try {
      const res = await axios.get(`${API_URL}/check-auth`);
      set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch(error){
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      throw error
    }
  },

  forgotPassword: async(email) => {
    set({isLoading:true,error:null,message:null})
    try {
      const response = await axios.post(`${API_URL}/forgot-password`,{email})
      set({message:response.data.message, isLoading:false});

    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error in sending reset password email";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (password,token) => {
    console.log(password,token)
    set({isLoading:true,error:null,message:null})
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`,{password})
      set({message:response.data.message,isLoading:true})
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error in reset password";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (name) => {
    set({isLoading:true,error:null,message:null})
    try {
      const response = await axios.put(`${API_URL}/update-profile`,{name})
      set({message:response.data.message,user : response.data.user,isLoading:true})
    } catch (error) {
       const message =
        error.response?.data?.message || error.message || "Some error in uodating ";
      set({ error: message, isLoading: false });
      throw error;
    }
  }
}));
