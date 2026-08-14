import { Search as SearchIcon, X as XIcon } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingSizes = {
  sm: { py: '0.375rem', pl: '2.25rem', pr: '2rem', fontSize: '0.75rem', height: '2.125rem' },
  md: { py: '0.5rem', pl: '2.5rem', pr: '2.25rem', fontSize: '0.875rem', height: '2.5rem' },
  lg: { py: '0.75rem', pl: '3rem', pr: '2.5rem', fontSize: '1rem', height: '3rem' },
};

const iconLeftPos = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1rem',
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search items, requests, or categories...',
  size = 'md',
  className = '',
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const config = paddingSizes[size];

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }} className={className}>
      <SearchIcon
        style={{
          position: 'absolute',
          left: iconLeftPos[size],
          width: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem',
          height: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem',
          color: 'var(--color-neutral-400)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: config.height,
          paddingLeft: config.pl,
          paddingRight: value ? config.pr : '1rem',
          fontSize: config.fontSize,
          backgroundColor: '#f1f5f3',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '9999px',
          color: 'var(--color-neutral-900)',
          outline: 'none',
          transition: 'all 150ms ease-in-out',
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.borderColor = 'var(--color-primary-500)';
          e.target.style.boxShadow = '0 0 0 2px rgba(46,125,50,0.15)';
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = '#f1f5f3';
          e.target.style.borderColor = 'var(--color-neutral-200)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '0.75rem',
            padding: '0.25rem',
            color: 'var(--color-neutral-400)',
            background: 'none',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Clear search"
        >
          <XIcon style={{ width: '0.875rem', height: '0.875rem' }} />
        </button>
      )}
    </div>
  );
}

