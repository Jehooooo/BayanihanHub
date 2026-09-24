import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import Button from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  icon?: ReactNode;
  isNetworkError?: boolean;
  className?: string;
}

/**
 * Sanitizes technical error strings to avoid leaking 500, AxiosError, SQLSTATE, or localhost to users.
 */
export function sanitizeErrorMessage(raw?: string | null): string {
  if (!raw) return 'Something went wrong. Please try again.';

  const lower = raw.toLowerCase();

  if (
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('err_connection') ||
    lower.includes('internet')
  ) {
    return 'Please check your internet connection and try again.';
  }

  if (
    lower.includes('500') ||
    lower.includes('axios') ||
    lower.includes('sql') ||
    lower.includes('internal server') ||
    lower.includes('exception') ||
    lower.includes('traceback') ||
    lower.includes('localhost')
  ) {
    return 'Our server encountered an issue while processing your request. Please try again in a moment.';
  }

  return raw;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  icon,
  isNetworkError = false,
  className = '',
}: ErrorStateProps) {
  const displayMessage = sanitizeErrorMessage(message);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in ${className}`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
          isNetworkError ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
        } border border-red-100 shadow-xs`}
      >
        {icon ?? (isNetworkError ? <WifiOff className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />)}
      </div>

      <h3 className="text-base font-bold text-neutral-800 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">
        {displayMessage}
      </p>

      {onRetry && (
        <Button
          variant="primary"
          size="md"
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="shadow-button font-bold"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
