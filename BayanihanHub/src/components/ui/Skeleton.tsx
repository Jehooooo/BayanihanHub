interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const roundedClasses = {
  sm: 'rounded-[var(--radius-sm)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  full: 'rounded-full',
};

export default function Skeleton({
  width,
  height = '1rem',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 overflow-hidden">
      <Skeleton height="200px" rounded="sm" className="w-full" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton width="70%" height="1.25rem" />
        <Skeleton width="50%" height="0.875rem" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton width="1.5rem" height="1.5rem" rounded="full" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Skeleton width="30%" height="0.75rem" />
          <Skeleton width="1.5rem" height="1.5rem" rounded="full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-[var(--radius-md)] border border-neutral-200">
          <Skeleton width="3rem" height="3rem" rounded="full" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="80%" height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
