import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await api.login(email, password);
          set({ currentUser: user, token, isAuthenticated: true, isLoading: false });
          return { ok: true };
        } catch (err) {
          set({ isLoading: false });
          const message = err instanceof Error ? err.message : "Login failed.";
          return { ok: false, error: message };
        }
      },
      logout: () => set({ currentUser: null, token: null, isAuthenticated: false }),
    }),
    { name: "bms-auth" },
  ),
);
