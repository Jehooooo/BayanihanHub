import React from 'react';
import { Ring } from '@/components/ui/ring';

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 - 100. If undefined, runs indeterminate smooth rotation
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  strokeWidth?: number;
  color?: 'primary' | 'white' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  label?: string;
  sublabel?: string;
  children?: React.ReactNode;
  className?: string;
}

const sizeConfig: Record<string, { px: number; stroke: number; fontSize: string }> = {
  sm: { px: 32, stroke: 3, fontSize: '0.625rem' },
  md: { px: 48, stroke: 4, fontSize: '0.75rem' },
  lg: { px: 80, stroke: 6, fontSize: '1rem' },
  xl: { px: 112, stroke: 7, fontSize: '1.25rem' },
};

const colorConfig: Record<string, { stroke: string; track: string; text: string }> = {
  primary: {
    stroke: 'var(--color-primary-600, #2e7d32)',
    track: 'var(--color-primary-100, #c8e6c9)',
    text: 'var(--color-primary-700, #1b5e20)',
  },
  white: {
    stroke: '#ffffff',
    track: 'rgba(255, 255, 255, 0.25)',
    text: '#ffffff',
  },
  success: {
    stroke: 'var(--color-success, #2e7d32)',
    track: '#dcfce7',
    text: '#166534',
  },
  warning: {
    stroke: 'var(--color-warning, #ed6c02)',
    track: '#fef3c7',
    text: '#92400e',
  },
  danger: {
    stroke: 'var(--color-danger, #d32f2f)',
    track: '#fee2e2',
    text: '#991b1b',
  },
};

export default function CircularProgress({
  value,
  size = 'md',
  strokeWidth,
  color = 'primary',
  showValue = false,
  label,
  sublabel,
  children,
  className = '',
  ...props
}: CircularProgressProps) {
  const isIndeterminate = value === undefined;
  const config = typeof size === 'number'
    ? { px: size, stroke: strokeWidth || Math.max(3, Math.round(size / 12)), fontSize: `${Math.round(size / 4.5)}px` }
    : sizeConfig[size] || sizeConfig.md;

  const actualStroke = strokeWidth ?? config.stroke;
  const dimension = config.px;
  const radius = (dimension - actualStroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Clamped target percentage
  const clampedValue = Math.min(Math.max(value ?? 0, 0), 100);
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    if (!isIndeterminate && value !== undefined) {
      const raf = requestAnimationFrame(() => {
        setAnimatedValue(clampedValue);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [clampedValue, isIndeterminate, value]);

  const targetValue = isIndeterminate ? 0 : animatedValue;
  const strokeDashoffset = circumference - (targetValue / 100) * circumference;

  const themeColors = colorConfig[color] || colorConfig.primary;

  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : Math.round(targetValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Operation in progress'}
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ userSelect: 'none' }}
      {...props}
    >
      <div
        style={{
          position: 'relative',
          width: dimension,
          height: dimension,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isIndeterminate ? (
          <Ring
            size={dimension}
            style={{ color: themeColors.stroke }}
          />
        ) : (
          <svg
            width={dimension}
            height={dimension}
            viewBox={`0 0 ${dimension} ${dimension}`}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              overflow: 'visible',
            }}
          >
            {/* Background Track */}
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke={themeColors.track}
              strokeWidth={actualStroke}
            />

            {/* Active Animated Progress Arc */}
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke={themeColors.stroke}
              strokeWidth={actualStroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'stroke-dashoffset',
              }}
            />
          </svg>
        )}

        {/* Center Content / Percentage */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            pointerEvents: 'none',
          }}
        >
          {children ? (
            children
          ) : showValue && !isIndeterminate ? (
            <span
              style={{
                fontSize: config.fontSize,
                fontWeight: 700,
                color: themeColors.text,
                lineHeight: 1,
              }}
            >
              {Math.round(targetValue)}%
            </span>
          ) : null}
        </div>
      </div>

      {/* Label and Sublabel */}
      {(label || sublabel) && (
        <div className="text-center mt-2">
          {label && (
            <p className="text-xs font-semibold text-neutral-800 tracking-tight leading-snug">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[11px] text-neutral-500 font-normal leading-tight mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
