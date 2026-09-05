import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, required = false, className = '', id, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label htmlFor={selectId} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
            {label}
            {required && <span style={{ color: 'var(--color-danger)', marginLeft: '0.125rem' }}>*</span>}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            ref={ref}
            id={selectId}
            required={required}
            style={{
              width: '100%',
              height: '2.5rem',
              paddingLeft: '0.875rem',
              paddingRight: '2.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundColor: '#fff',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-neutral-300)'}`,
              borderRadius: 'var(--radius-md)',
              color: error ? 'var(--color-danger)' : 'var(--color-neutral-900)',
              outline: 'none',
              cursor: 'pointer',
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
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            style={{
              position: 'absolute',
              right: '0.75rem',
              width: '1rem',
              height: '1rem',
              color: 'var(--color-neutral-400)',
              pointerEvents: 'none',
            }}
          />
        </div>
        {error && <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-danger)' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

