import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-button border border-transparent',
  secondary:
    'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200',
  outline:
    'border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 active:bg-neutral-100',
  ghost:
    'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 border border-transparent',
  danger:
    'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-button border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs gap-2 min-w-[4rem]',
  md: 'h-10 px-5 text-sm gap-2.5 min-w-[5rem]',
  lg: 'h-12 px-6 text-sm gap-3 min-w-[6rem]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`
          inline-flex items-center justify-center font-semibold
          rounded-[var(--radius-md)] cursor-pointer whitespace-nowrap
          transition-all duration-[var(--transition-fast)]
          disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
          focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 motion-reduce:animate-pulse" aria-hidden="true" />
        ) : (
          leftIcon && (
            <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        <span className="truncate">
          {isLoading && loadingText ? loadingText : children}
        </span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
