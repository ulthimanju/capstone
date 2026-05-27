import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useAuthStore — Global authentication state using Zustand with localStorage persistence.
 *
 * Shape:
 *   accessToken  : string | null
 *   refreshToken : string | null
 *   user         : { userId, email, role } | null
 *   setAuth      : (accessToken, refreshToken, user) => void
 *   clearAuth    : () => void
 *   isAuthenticated : () => boolean
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'questly-auth',
    },
  ),
);
