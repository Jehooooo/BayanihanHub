import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      required = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-neutral-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {label}
              {required && <span style={{ color: 'var(--color-danger)', marginLeft: '0.125rem' }}>*</span>}
            </span>
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: '0.875rem',
                color: 'var(--color-neutral-400)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1,
              }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            required={required}
            style={{
              width: '100%',
              height: '2.5rem',
              paddingLeft: leftIcon ? '2.5rem' : '0.875rem',
              paddingRight: isPassword || rightIcon ? '2.5rem' : '0.875rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: '#fff',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-neutral-300)'}`,
              borderRadius: 'var(--radius-md)',
              color: error ? 'var(--color-danger)' : 'var(--color-neutral-900)',
              outline: 'none',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary-500)';
              e.target.style.boxShadow = error
                ? '0 0 0 2px rgba(211,47,47,0.15)'
                : '0 0 0 2px rgba(46,125,50,0.15)';
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-neutral-300)';
              e.target.style.boxShadow = 'none';
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.875rem',
                color: 'var(--color-neutral-400)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div
              style={{
                position: 'absolute',
                right: '0.875rem',
                color: 'var(--color-neutral-400)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

