// ============================================================
// Bayanihan Hub — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthCredentials, RegisterData } from '../types';
import { mockUsers, generateId } from '../data/mockData';
import { useSavedItemsStore } from './savedItemsStore';
import { useIdentityVerificationStore } from './identityVerificationStore';
import { maskIdNumber } from '../services/verification.service';
import { safeSetLocalStorageItem } from '../utils/imageCompression';

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

        // Simulate API verification call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const cleanEmail = credentials.email.trim().toLowerCase();
        const user = mockUsers.find(
          (u) =>
            u.email.toLowerCase() === cleanEmail ||
            u.username.toLowerCase() === cleanEmail
        );

        if (!user) {
          set({
            error: 'Invalid email or password. Please try again.',
            isLoading: false,
          });
          return false;
        }

        if (user.isSuspended) {
          set({
            error: 'Your account has been suspended. Please contact support.',
            isLoading: false,
          });
          return false;
        }

        // Enforce account status check before creating session
        const status = user.account_status || (user.isVerified ? 'APPROVED' : 'PENDING');

        if (status === 'PENDING') {
          set({
            error: 'Your account is still pending administrator verification. Please wait until your registration has been reviewed.',
            isLoading: false,
          });
          return false;
        }

        if (status === 'REJECTED') {
          set({
            error: 'Your registration was not approved. Please review the provided information or contact an administrator.',
            isLoading: false,
          });
          return false;
        }

        if (status === 'APPROVED') {
          // Administrator has approved this account
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          return true;
        }

        set({
          error: 'Your account requires administrator review before sign in.',
          isLoading: false,
        });
        return false;
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if email already exists
        const existingUser = mockUsers.find(
          (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
        );
        if (existingUser) {
          set({
            error: 'An account with this email already exists.',
            isLoading: false,
          });
          return false;
        }

        // Check if username already exists
        const existingUsername = mockUsers.find(
          (u) => u.username.toLowerCase() === data.username.trim().toLowerCase()
        );
        if (existingUsername) {
          set({
            error: 'This username is already taken.',
            isLoading: false,
          });
          return false;
        }

        const userId = generateId();
        const maskedIdNumber = data.idNumber ? maskIdNumber(data.idNumber) : undefined;

        // CRITICAL RULE: Newly registered users are created with status PENDING.
        // Facial verification success does NOT mean administrator approval.
        const newUser: User = {
          id: userId,
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          barangay: data.barangay,
          municipality: data.municipality,
          province: data.province,
          avatar: data.avatar || data.faceImageUrl || '',
          role: 'user',
          isVerified: false,
          account_status: 'PENDING',
          facial_verification_status: 'PASSED',
          id_verification_status: 'SUBMITTED',
          verificationStatus: 'PENDING',
          verificationCompletedAt: undefined,
          idType: data.idType,
          maskedIdNumber,
          isTrusted: false,
          isSuspended: false,
          rating: 5.0,
          totalRatings: 0,
          totalExchanges: 0,
          totalDonations: 0,
          badges: [],
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        // Create the identity verification application record for administrator review
        if (data.idType && data.idNumber) {
          useIdentityVerificationStore.getState().submitVerification({
            userId,
            user: newUser,
            idType: data.idType,
            idNumber: data.idNumber,
            fullNameOnId: data.fullNameOnId || data.fullName,
            dob: data.dob || '',
            expirationDate: data.expirationDate,
            extraInfo: data.extraInfo,
            idDocumentUrl: data.idDocumentUrl || '',
            faceImageUrl: data.faceImageUrl || '',
            status: 'PENDING',
            provider: 'BayanihanHub-Python-FastAPI-Engine',
            confidenceScore: data.verificationConfidence || 95,
            matchDetails: {
              faceMatch: true,
              nameMatch: true,
              livenessVerified: true,
            },
            verifiedAt: undefined,
            reviewedBy: 'Pending Administrator Review',
          });
        }

        // Add user to registry
        mockUsers.push(newUser);

        // NEVER AUTO-LOGIN: User remains logged out until administrator review and approval
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        return true;
      },

      logout: () => {
        useSavedItemsStore.getState().clearAll();
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
      storage: {
        getItem: (name) => {
          try {
            const val = localStorage.getItem(name);
            return val ? JSON.parse(val) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          safeSetLocalStorageItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        },
      },
    }
  )
);
