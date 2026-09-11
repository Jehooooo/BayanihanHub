// ============================================================
// Bayanihan Hub — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthCredentials, RegisterData } from '../types';
import { generateId } from '../utils/id';
import { getUserFriendlyErrorMessage } from '../utils/errorHandler';
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

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            const errorMsg = getUserFriendlyErrorMessage(
              data.detail || data.message,
              'Invalid email or password. Please try again.'
            );
            set({ error: errorMsg, isLoading: false });
            return false;
          }

          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
            return true;
          }

          set({
            error: 'Authentication failed. Please verify your credentials.',
            isLoading: false,
          });
          return false;
        } catch (err: any) {
          console.warn('[Login] Network error:', err);
          set({
            error: getUserFriendlyErrorMessage(
              err,
              'Unable to connect to the server. Please check your connection and try again.'
            ),
            isLoading: false,
          });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              username: data.username,
              fullName: data.fullName,
              phone: data.phone,
              address: data.address,
              barangay: data.barangay,
              municipality: data.municipality,
              province: data.province,
              idType: data.idType,
              idNumber: data.idNumber,
              fullNameOnId: data.fullNameOnId || data.fullName,
              dob: data.dob,
              expirationDate: data.expirationDate,
              extraInfo: data.extraInfo,
              idDocumentUrl: data.idDocumentUrl,
              faceImageUrl: data.faceImageUrl,
              verificationConfidence: data.verificationConfidence || 95,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            const errorMsg = getUserFriendlyErrorMessage(
              result.detail || result.message,
              'Registration failed. Please check your details.'
            );
            set({ error: errorMsg, isLoading: false });
            return false;
          }

          const userId = result.user?.id || `user-${generateId()}`;
          const maskedIdNumber = data.idNumber ? maskIdNumber(data.idNumber) : undefined;

          // Newly registered users are created with status PENDING
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

          // Refresh verifications from backend for admins
          useIdentityVerificationStore.getState().fetchVerifications().catch(() => {});

          // NEVER AUTO-LOGIN: User remains logged out until administrator review and approval
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
          return true;
        } catch (err: any) {
          console.error('[Register] API call error:', err);
          set({
            error: getUserFriendlyErrorMessage(
              err,
              'Unable to connect to the registration server. Please try again.'
            ),
            isLoading: false,
          });
          return false;
        }
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
