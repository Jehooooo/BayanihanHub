import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const roundedMap = {
  none: 'rounded-none',
  xs: 'rounded-[var(--radius-xs)]',
  sm: 'rounded-[var(--radius-sm)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  xl: 'rounded-[var(--radius-xl)]',
  full: 'rounded-full',
};

export default function Skeleton({
  width,
  height = '1rem',
  rounded = 'md',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton ${roundedMap[rounded]} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

/** Multiple lines of text with the last line narrower */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 && lines > 1 ? '65%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
}

/** Matches ItemCard layout: 4:3 image, category tag, title, author info, location */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-[var(--radius-lg)] border border-neutral-200 overflow-hidden flex flex-col h-full shadow-[var(--shadow-card)] ${className}`}
    >
      {/* 4:3 Image placeholder */}
      <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden w-full">
        <Skeleton height="100%" width="100%" rounded="none" />
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
        <div className="flex flex-col gap-2">
          {/* Tag + Distance row */}
          <div className="flex items-center justify-between">
            <Skeleton width="4.5rem" height="1.25rem" rounded="full" />
            <Skeleton width="3rem" height="0.875rem" rounded="sm" />
          </div>

          {/* Title */}
          <Skeleton width="85%" height="1.15rem" rounded="sm" className="mt-1" />
          <Skeleton width="60%" height="0.875rem" rounded="sm" />
        </div>

        {/* Location & Author Row */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Skeleton width="1.75rem" height="1.75rem" rounded="full" />
            <Skeleton width="5rem" height="0.75rem" rounded="sm" />
          </div>
          <Skeleton width="3.5rem" height="0.75rem" rounded="sm" />
        </div>
      </div>
    </div>
  );
}

/** Request card skeleton for RequestsPage */
export function SkeletonRequestCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-[var(--radius-lg)] border border-neutral-200 p-5 flex flex-col justify-between gap-4 shadow-sm ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton width="5rem" height="1.25rem" rounded="full" />
          <Skeleton width="4rem" height="0.875rem" rounded="sm" />
        </div>
        <Skeleton width="80%" height="1.25rem" rounded="sm" />
        <SkeletonText lines={2} />
      </div>

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton width="1.75rem" height="1.75rem" rounded="full" />
          <Skeleton width="5.5rem" height="0.75rem" rounded="sm" />
        </div>
        <Skeleton width="6rem" height="2rem" rounded="md" />
      </div>
    </div>
  );
}

/** Row-based list skeleton (e.g. notifications, messages) */
export function SkeletonList({
  count = 3,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 p-4 bg-white rounded-[var(--radius-lg)] border border-neutral-200 shadow-sm"
        >
          <Skeleton width="2.5rem" height="2.5rem" rounded="full" className="shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton width="45%" height="0.95rem" rounded="sm" />
              <Skeleton width="3rem" height="0.75rem" rounded="sm" />
            </div>
            <Skeleton width="75%" height="0.75rem" rounded="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Table rows skeleton for Admin tables (Users, Posts, Reports, Requests) */
export function SkeletonTable({
  rows = 5,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-neutral-100">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="p-4">
              {c === 0 ? (
                <div className="flex items-center gap-3">
                  <Skeleton width="2rem" height="2rem" rounded="full" className="shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton width="60%" height="0.875rem" rounded="sm" />
                    <Skeleton width="40%" height="0.6875rem" rounded="sm" />
                  </div>
                </div>
              ) : c === cols - 1 ? (
                <div className="flex justify-end gap-2">
                  <Skeleton width="4rem" height="1.75rem" rounded="md" />
                </div>
              ) : (
                <Skeleton width={`${50 + (c * 12) % 40}%`} height="0.875rem" rounded="sm" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/** Metrics / statistics cards skeleton (for Admin & Dashboard) */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-4 sm:p-5 rounded-[var(--radius-lg)] border border-neutral-200 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <Skeleton width="50%" height="0.75rem" rounded="sm" />
            <Skeleton width="1.5rem" height="1.5rem" rounded="md" />
          </div>
          <Skeleton width="40%" height="1.75rem" rounded="md" className="mt-1" />
          <Skeleton width="70%" height="0.6875rem" rounded="sm" />
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton for ItemDetailsPage */
export function SkeletonDetail() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Skeleton width="7rem" height="2.25rem" rounded="md" />

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton height="360px" rounded="lg" className="w-full" />
          <div className="flex gap-2">
            <Skeleton width="5rem" height="4rem" rounded="md" />
            <Skeleton width="5rem" height="4rem" rounded="md" />
            <Skeleton width="5rem" height="4rem" rounded="md" />
          </div>
        </div>

        {/* Right: Info Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[var(--radius-xl)] border border-neutral-200 shadow-sm space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton width="5rem" height="1.25rem" rounded="full" />
              <Skeleton width="4rem" height="0.875rem" rounded="sm" />
            </div>
            <Skeleton width="90%" height="1.75rem" rounded="sm" />
            <Skeleton width="40%" height="1rem" rounded="sm" />
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg flex items-center gap-3">
            <Skeleton width="2.5rem" height="2.5rem" rounded="full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton width="60%" height="0.875rem" rounded="sm" />
              <Skeleton width="35%" height="0.75rem" rounded="sm" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton width="100%" height="3rem" rounded="md" />
            <Skeleton width="100%" height="2.5rem" rounded="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Profile page skeleton */
export function SkeletonProfile() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton width="5rem" height="2rem" rounded="md" />

      {/* Banner + Avatar card */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-neutral-200 overflow-hidden shadow-sm">
        <Skeleton height="7rem" rounded="none" className="w-full" />
        <div className="p-6 -mt-12 space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <Skeleton width="6rem" height="6rem" rounded="full" className="border-4 border-white shadow-md" />
              <div className="space-y-2 pb-1">
                <Skeleton width="12rem" height="1.5rem" rounded="sm" />
                <Skeleton width="7rem" height="0.875rem" rounded="sm" />
              </div>
            </div>
            <Skeleton width="8rem" height="2.25rem" rounded="md" />
          </div>

          <SkeletonText lines={2} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-neutral-200 pb-2">
        <Skeleton width="6rem" height="2rem" rounded="md" />
        <Skeleton width="6rem" height="2rem" rounded="md" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
