/**
 * Centralized API / runtime error sanitizer.
 *
 * RULE: Raw backend error text, stack traces, and HTTP status strings
 * must NEVER reach the user-facing UI. This utility is the single
 * place that converts any thrown value into a safe, friendly message.
 *
 * Dev details are always preserved in console.error() for debugging.
 */

/** Map HTTP status codes → friendly user-facing strings. */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'The request couldn\'t be completed. Please check your input and try again.',
  401: 'You need to be logged in to do that.',
  403: 'You don\'t have permission to do that.',
  404: 'We couldn\'t find what you were looking for.',
  408: 'The request timed out. Please check your connection and try again.',
  409: 'There was a conflict with your request. Please refresh and try again.',
  413: 'The file you\'re trying to upload is too large.',
  422: 'Some of the information you submitted wasn\'t valid. Please review and try again.',
  429: 'You\'re doing that too quickly. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again in a moment.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily down for maintenance. Please try again soon.',
  504: 'The server took too long to respond. Please try again.',
};

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Unable to reach the server. Please check your connection.';

/**
 * Extract a safe, user-friendly error message from any thrown value.
 *
 * @param err       - The caught error (unknown type — never assume structure).
 * @param fallback  - Optional custom fallback message for this specific call site.
 * @returns         - A clean, human-readable string safe to show in UI.
 */
export function getErrorMessage(err: unknown, fallback?: string): string {
  // Always log full error details for developers
  console.error('[API Error]', err);

  // Network failures (fetch throws TypeError for network errors)
  if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
    return NETWORK_MESSAGE;
  }

  // Response objects with a status code (e.g. from a custom ApiError class)
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;

    // Check for HTTP status code first
    const status = typeof e.status === 'number' ? e.status : typeof e.statusCode === 'number' ? e.statusCode : null;
    if (status !== null && HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status];
    }

    // If there's an explicit userMessage / friendlyMessage field (from our own error classes)
    if (typeof e.userMessage === 'string' && e.userMessage.trim()) {
      return e.userMessage.trim();
    }
    if (typeof e.friendlyMessage === 'string' && e.friendlyMessage.trim()) {
      return e.friendlyMessage.trim();
    }
  }

  // Return the call-site fallback or the generic default — NEVER a raw .message
  return fallback ?? DEFAULT_MESSAGE;
}

/**
 * Convenience: returns true if the error looks like a network connectivity issue.
 */
export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError && err.message.toLowerCase().includes('fetch');
}

/**
 * Convenience: extract HTTP status from a fetch Response or an error object.
 */
export function getStatusCode(err: unknown): number | null {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.status === 'number') return e.status;
    if (typeof e.statusCode === 'number') return e.statusCode;
  }
  return null;
}
