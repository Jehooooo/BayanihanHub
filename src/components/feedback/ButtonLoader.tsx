import { Loader2 } from 'lucide-react';

export interface ButtonLoaderProps {
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ButtonLoader({
  loadingText,
  size = 'md',
  className = '',
}: ButtonLoaderProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 pointer-events-none select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={`${iconSize} animate-spin shrink-0 motion-reduce:animate-pulse`}
        aria-hidden="true"
      />
      {loadingText && (
        <span className={`font-semibold ${textSize} tracking-tight`}>
          {loadingText}
        </span>
      )}
    </span>
  );
}
