import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("nova_token") || null,
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("nova_user")) || null;
    } catch {
      return null;
    }
  })(),

  login: (token, user) => {
    localStorage.setItem("nova_token", token);
    localStorage.setItem("nova_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("nova_token");
    localStorage.removeItem("nova_user");
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
