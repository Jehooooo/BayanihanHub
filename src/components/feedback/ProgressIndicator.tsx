import { useState, useEffect } from 'react';

export interface ProgressIndicatorProps {
  value?: number; // 0 - 100, undefined for indeterminate
  steps?: { label: string; completed: boolean }[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressIndicator({
  value,
  steps,
  label,
  size = 'md',
  className = '',
}: ProgressIndicatorProps) {
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const isIndeterminate = value === undefined;

  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    if (!isIndeterminate && value !== undefined) {
      const raf = requestAnimationFrame(() => {
        setAnimatedWidth(Math.min(Math.max(value, 0), 100));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [value, isIndeterminate]);

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-neutral-600">
          <span>{label}</span>
          {!isIndeterminate && <span>{Math.round(animatedWidth)}%</span>}
        </div>
      )}

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : Math.round(animatedWidth)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full ${heightClass} bg-neutral-200 rounded-full overflow-hidden relative`}
      >
        {isIndeterminate ? (
          <div className="h-full bg-primary-600 rounded-full animate-progress-indeterminate" />
        ) : (
          <div
            className="h-full bg-primary-600 rounded-full"
            style={{
              width: `${animatedWidth}%`,
              transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'width',
            }}
          />
        )}
      </div>

      {/* Step Indicators */}
      {steps && steps.length > 0 && (
        <div className="flex justify-between items-center pt-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.completed
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-[10px] font-medium text-neutral-600">{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
