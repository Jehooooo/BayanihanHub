import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showLabel = false,
  className = '',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={`
              transition-all duration-[var(--transition-fast)]
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              ${isFilled ? 'text-amber-400' : 'text-neutral-300'}
            `}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`${sizeClasses[size]} ${isFilled ? 'fill-current' : ''}`}
            />
          </button>
        );
      })}
      {showLabel && (
        <span className="ml-1.5 text-sm font-medium text-neutral-600">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
