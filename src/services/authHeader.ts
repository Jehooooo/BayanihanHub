/**
 * Centralized authorization header helper for Bayanihan Hub API requests.
 * Extracts the JWT bearer token from the persisted bayanihan-auth Zustand store.
 */

export const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem('bayanihan-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.user?.token || null;
    }
  } catch {
    // Local storage unavailable or malformed
  }
  return null;
};

export const getAuthHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { ...extra };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
