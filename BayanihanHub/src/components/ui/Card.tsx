import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

const paddingValues: Record<string, string> = {
  none: '0',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
};

export default function Card({
  children,
  hoverable = false,
  padding = 'md',
  border = true,
  className = '',
  style,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: paddingValues[padding],
        border: border ? '1px solid var(--color-neutral-200)' : 'none',
        transition: hoverable ? 'all 250ms cubic-bezier(0.4,0,0.2,1)' : undefined,
        cursor: hoverable ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hoverable ? (e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      } : undefined}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-components for structured card sections
export function CardHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-100)' }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ padding: '1rem 0' }} className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-100)' }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

