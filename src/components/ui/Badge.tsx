import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/95 text-neutral-800 border border-neutral-300/80 shadow-[0_2px_6px_rgba(0,0,0,0.08)] backdrop-blur-md',
  primary: 'bg-emerald-50/95 text-emerald-800 border border-emerald-300/80 shadow-[0_2px_6px_rgba(46,125,50,0.12)] backdrop-blur-md',
  success: 'bg-emerald-50/95 text-emerald-800 border border-emerald-300/80 shadow-[0_2px_6px_rgba(46,125,50,0.12)] backdrop-blur-md',
  warning: 'bg-amber-50/95 text-amber-800 border border-amber-300/80 shadow-[0_2px_6px_rgba(217,119,6,0.12)] backdrop-blur-md',
  danger: 'bg-red-50/95 text-red-800 border border-red-300/80 shadow-[0_2px_6px_rgba(220,38,38,0.12)] backdrop-blur-md',
  info: 'bg-blue-50/95 text-blue-800 border border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.12)] backdrop-blur-md',
};

const dotVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-neutral-500',
  primary: 'bg-emerald-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-3.5 py-1 text-[11px] font-bold leading-tight tracking-wide',
  md: 'px-4 py-1.5 text-xs font-bold leading-tight tracking-wide',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  style,
}: BadgeProps) {
  return (
    <span
      style={{
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        ...style,
      }}
      className={`
        inline-flex items-center justify-center gap-1.5 font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotVariantClasses[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
