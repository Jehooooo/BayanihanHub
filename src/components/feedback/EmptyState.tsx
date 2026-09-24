import type { ReactNode } from 'react';
import { Package } from 'lucide-react';
import Button from '../ui/Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center py-14 px-6 text-center animate-fade-in ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400 border border-neutral-200/60 shadow-xs">
        {icon ?? <Package className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-neutral-800 mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
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
      )}
    </div>
  );
}
