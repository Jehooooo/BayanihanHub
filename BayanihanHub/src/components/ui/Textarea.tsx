import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxChars?: number;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCount, maxChars, required = false, className = '', id, value, ...props }, ref) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label htmlFor={textareaId} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
            {label}
            {required && <span style={{ color: 'var(--color-danger)', marginLeft: '0.125rem' }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          required={required}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: '#fff',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-neutral-300)'}`,
            borderRadius: 'var(--radius-md)',
            color: error ? 'var(--color-danger)' : 'var(--color-neutral-900)',
            outline: 'none',
            minHeight: '5.5rem',
            resize: 'vertical',
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
          {...props}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error ? (
            <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-danger)' }}>{error}</p>
          ) : helperText ? (
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>{helperText}</p>
          ) : (
            <span />
          )}
          {showCount && maxChars && (
            <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: currentLength > maxChars ? 'var(--color-danger)' : 'var(--color-neutral-400)' }}>
              {currentLength}/{maxChars}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

