import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** When true, renders as a solid filled badge (strong bg, white text).
   *  Use for severity/status indicators (urgency, priority).
   *  Default false = soft tinted style for informational tags. */
  solid?: boolean;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ── Soft / tinted style (default) — informational tags ──────────────────────
const softVariantClasses: Record<BadgeVariant, string> = {
  default:  'bg-white/95 text-neutral-700 border border-neutral-300/80 shadow-[0_2px_6px_rgba(0,0,0,0.08)] backdrop-blur-md',
  primary:  'bg-emerald-50/95 text-emerald-800 border border-emerald-300/80 shadow-[0_2px_6px_rgba(46,125,50,0.12)] backdrop-blur-md',
  success:  'bg-emerald-50/95 text-emerald-800 border border-emerald-300/80 shadow-[0_2px_6px_rgba(46,125,50,0.12)] backdrop-blur-md',
  warning:  'bg-amber-50/95 text-amber-800 border border-amber-300/80 shadow-[0_2px_6px_rgba(217,119,6,0.12)] backdrop-blur-md',
  danger:   'bg-red-50/95 text-red-800 border border-red-300/80 shadow-[0_2px_6px_rgba(220,38,38,0.12)] backdrop-blur-md',
  info:     'bg-blue-50/95 text-blue-800 border border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.12)] backdrop-blur-md',
};

// ── Solid / filled style — severity / priority indicators ────────────────────
const solidVariantClasses: Record<BadgeVariant, string> = {
  default:  'bg-neutral-600 text-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]',
  primary:  'bg-emerald-600 text-white shadow-[0_2px_6px_rgba(46,125,50,0.28)]',
  success:  'bg-emerald-600 text-white shadow-[0_2px_6px_rgba(46,125,50,0.28)]',
  warning:  'bg-amber-500 text-white shadow-[0_2px_6px_rgba(217,119,6,0.28)]',
  danger:   'bg-red-600 text-white shadow-[0_2px_6px_rgba(220,38,38,0.28)]',
  info:     'bg-blue-600 text-white shadow-[0_2px_6px_rgba(37,99,235,0.28)]',
};

// ── Dot colours (same for both modes) ───────────────────────────────────────
const dotVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-neutral-500',
  primary: 'bg-emerald-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger:  'bg-red-600',
  info:    'bg-blue-600',
};

// For solid mode, dot is white
const solidDotClass = 'bg-white/70';

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-4 py-1 text-[11px] font-bold leading-tight tracking-wide',
  md: 'px-4.5 py-1.5 text-xs font-bold leading-tight tracking-wide',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  solid = false,
  dot = false,
  className = '',
  style,
}: BadgeProps) {
  const variantClass = solid ? solidVariantClasses[variant] : softVariantClasses[variant];
  const dotClass = solid ? solidDotClass : dotVariantClasses[variant];

  return (
    <span
      style={{
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        paddingLeft: size === 'md' ? '1rem' : '0.875rem',
        paddingRight: size === 'md' ? '1rem' : '0.875rem',
        paddingTop: size === 'md' ? '0.35rem' : '0.25rem',
        paddingBottom: size === 'md' ? '0.35rem' : '0.25rem',
        ...style,
      }}
      className={`
        inline-flex items-center justify-center gap-1.5 font-medium
        ${variantClass}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      )}
      {children}
    </span>
  );
}
