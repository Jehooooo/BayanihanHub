import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';

export interface SuccessStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  autoDismissMs?: number;
  onDismiss?: () => void;
  inline?: boolean;
  className?: string;
}

export default function SuccessState({
  title = 'Success!',
  message,
  actionLabel,
  onAction,
  autoDismissMs,
  onDismiss,
  inline = false,
  className = '',
}: SuccessStateProps) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  if (inline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold animate-scale-in ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-10 px-6 text-center animate-scale-in ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200 shadow-xs">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-neutral-900 mb-1.5">{title}</h3>
      {message && (
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-5 leading-relaxed">
          {message}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="shadow-button font-bold"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
