import { HeartHandshake } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function PageLoader({
  message = 'Loading BayanihanHub...',
  subMessage = 'Connecting with your community neighbors',
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        ${fullScreen ? 'fixed inset-0 z-50 bg-white' : 'w-full py-20'}
        flex flex-col items-center justify-center p-6 text-center
        animate-fade-in
      `}
    >
      <div className="flex flex-col items-center max-w-sm gap-4">
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 shadow-sm border border-primary-100">
          <HeartHandshake className="w-8 h-8 motion-safe:animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl border-2 border-primary-500/20 motion-safe:animate-ping opacity-30" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-neutral-800 tracking-tight">
            {message}
          </h2>
          {subMessage && (
            <p className="text-xs text-neutral-500 font-medium">
              {subMessage}
            </p>
          )}
        </div>

        <LoadingSpinner size="sm" color="primary" />
      </div>
    </div>
  );
}
