/**
 * Utility to sanitize backend, database, and system errors into clean, friendly user messages.
 * Prevents internal technical details (stack traces, SQL, connection errors, hostnames)
 * from being exposed in user-facing toasts or alert banners.
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!error) return fallback;

  let rawMessage = '';

  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    rawMessage = obj.detail || obj.message || obj.error || JSON.stringify(error);
  }

  if (!rawMessage || typeof rawMessage !== 'string') {
    return fallback;
  }

  const lower = rawMessage.toLowerCase();

  // Network / Connection failure
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('connection refused') ||
    lower.includes('err_connection_refused') ||
    lower.includes('net::') ||
    lower.includes('load failed')
  ) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }

  // Internal Server / Database / Stack traces / System debugging
  if (
    lower.includes('500') ||
    lower.includes('internal server error') ||
    lower.includes('traceback') ||
    lower.includes('sqlalchemy') ||
    lower.includes('mysql') ||
    lower.includes('operationalerror') ||
    lower.includes('database error') ||
    lower.includes('localhost') ||
    lower.includes('127.0.0.1') ||
    lower.includes('pymysql') ||
    lower.includes('integrityerror') ||
    lower.includes('programmingerror') ||
    lower.includes('exception') ||
    lower.includes('debug') ||
    lower.includes('axioserror')
  ) {
    return 'Something went wrong. Please try again.';
  }

  // 404 Not Found
  if (lower.includes('not found') || lower.includes('404')) {
    return 'This item is no longer available.';
  }

  // 401 / 403 Forbidden / Suspended / Pending
  if (
    lower.includes('suspended') ||
    lower.includes('pending administrator') ||
    lower.includes('not approved') ||
    lower.includes('requires administrator review')
  ) {
    return rawMessage; // These are legitimate user policy messages
  }

  if (
    lower.includes('invalid email or password') ||
    lower.includes('incorrect password') ||
    lower.includes('user not found')
  ) {
    return 'Invalid email or password. Please try again.';
  }

  if (lower.includes('unauthorized') || lower.includes('401')) {
    return 'Please log in to continue.';
  }

  // Generic validation message or short message (under 120 chars without technical keywords)
  if (rawMessage.length < 120 && !/[{}\\/<>|]/.test(rawMessage)) {
    return rawMessage;
  }

  return fallback;
}
