import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  longRunningMessage?: string;
  subMessage?: string;
  delayNoticeMs?: number;
  blur?: boolean;
  fixed?: boolean;
  className?: string;
}

export default function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  longRunningMessage = "We're processing your request... This may take a few moments. Please don't close this page.",
  subMessage,
  delayNoticeMs = 2500,
  blur = true,
  fixed = false,
  className = '',
}: LoadingOverlayProps) {
  const [isLongRunning, setIsLongRunning] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsLongRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLongRunning(true);
    }, delayNoticeMs);

    return () => clearTimeout(timer);
  }, [isLoading, delayNoticeMs]);

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`
        ${fixed ? 'fixed inset-0 z-50' : 'absolute inset-0 z-20'}
        flex flex-col items-center justify-center p-6 text-center
        bg-white/80 dark:bg-neutral-900/80
        ${blur ? 'backdrop-blur-sm' : ''}
        transition-all duration-200 animate-fade-in
        ${className}
      `}
    >
      <div className="flex flex-col items-center max-w-sm gap-3 p-5 rounded-2xl bg-white/90 shadow-lg border border-neutral-100">
        <LoadingSpinner size="lg" color="primary" />
        <div className="space-y-1">
          <p className="font-bold text-neutral-800 text-sm">
            {isLongRunning ? longRunningMessage : message}
          </p>
          {subMessage && (
            <p className="text-xs text-neutral-500 font-medium">
              {subMessage}
            </p>
          )}
          {isLongRunning && !subMessage && (
            <p className="text-xs text-neutral-400">
              Please keep this page open.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
