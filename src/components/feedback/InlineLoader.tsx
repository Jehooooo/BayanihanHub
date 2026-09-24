import { Loader2 } from 'lucide-react';

export interface InlineLoaderProps {
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export default function InlineLoader({
  label = 'Updating...',
  size = 'sm',
  className = '',
}: InlineLoaderProps) {
  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  const textSize = size === 'xs' ? 'text-[11px]' : size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 text-neutral-500 font-medium ${textSize} ${className}`}
    >
      <Loader2
        className={`${iconSize} text-primary-600 animate-spin shrink-0 motion-reduce:animate-pulse`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
