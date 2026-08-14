// ============================================================
// Bayanihan Hub — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthCredentials, RegisterData } from '../types';
import { mockUsers, generateId } from '../data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: AuthCredentials) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const user = mockUsers.find(
          (u) => u.email === credentials.email
        );

        if (user && !user.isSuspended) {
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }

        if (user?.isSuspended) {
          set({
            error: 'Your account has been suspended. Please contact support.',
            isLoading: false,
          });
          return false;
        }

        // For demo: accept any email/password combo and create a session
        // with a default user if not found in mock data
        if (credentials.email && credentials.password) {
          const demoUser = mockUsers[0];
          set({ user: demoUser, isAuthenticated: true, isLoading: false });
          return true;
        }

        set({
          error: 'Invalid email or password. Please try again.',
          isLoading: false,
        });
        return false;
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if email already exists
        const existingUser = mockUsers.find((u) => u.email === data.email);
        if (existingUser) {
          set({
            error: 'An account with this email already exists.',
            isLoading: false,
          });
          return false;
        }

        // Check if username already exists
        const existingUsername = mockUsers.find((u) => u.username === data.username);
        if (existingUsername) {
          set({
            error: 'This username is already taken.',
            isLoading: false,
          });
          return false;
        }

        const newUser: User = {
          id: generateId(),
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          barangay: data.barangay,
          municipality: data.municipality,
          province: data.province,
          avatar: data.avatar ?? '',
          role: 'user',
          isVerified: false,
          isTrusted: false,
          isSuspended: false,
          rating: 0,
          totalRatings: 0,
          totalExchanges: 0,
          totalDonations: 0,
          badges: [],
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        mockUsers.push(newUser);
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
          
          // Update in mock data
          const idx = mockUsers.findIndex((u) => u.id === user.id);
          if (idx !== -1) {
            mockUsers[idx] = updatedUser;
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bayanihan-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
