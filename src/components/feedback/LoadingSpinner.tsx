import type { HTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'white' | 'neutral' | 'success' | 'danger';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  inline?: boolean;
}

const sizeMap: Record<SpinnerSize, { iconSize: string; textSize: string }> = {
  xs: { iconSize: 'w-3.5 h-3.5', textSize: 'text-xs' },
  sm: { iconSize: 'w-4 h-4', textSize: 'text-xs' },
  md: { iconSize: 'w-6 h-6', textSize: 'text-sm' },
  lg: { iconSize: 'w-8 h-8', textSize: 'text-base' },
  xl: { iconSize: 'w-10 h-10', textSize: 'text-lg' },
};

const colorMap: Record<SpinnerColor, { icon: string; text: string }> = {
  primary: { icon: 'text-[var(--color-primary-600)]', text: 'text-[var(--color-primary-800)]' },
  white: { icon: 'text-white', text: 'text-white' },
  neutral: { icon: 'text-[var(--color-neutral-400)]', text: 'text-[var(--color-neutral-600)]' },
  success: { icon: 'text-[var(--color-success)]', text: 'text-[var(--color-success)]' },
  danger: { icon: 'text-[var(--color-danger)]', text: 'text-[var(--color-danger)]' },
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label,
  inline = false,
  className = '',
  ...props
}: LoadingSpinnerProps) {
  const { iconSize, textSize } = sizeMap[size];
  const { icon: iconColor, text: textColor } = colorMap[color];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        ${inline ? 'inline-flex items-center gap-2' : 'flex flex-col items-center justify-center gap-2.5 p-4'}
        ${className}
      `}
      {...props}
    >
      <Loader2
        className={`${iconSize} ${iconColor} animate-spin shrink-0 motion-reduce:animate-pulse`}
        aria-hidden="true"
      />
      {label ? (
        <span className={`font-medium ${textSize} ${textColor}`}>{label}</span>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
}
