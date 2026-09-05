import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { categories } from '@/data/categories';
import Select from '@/components/ui/Select';
import SearchBar from '@/components/ui/SearchBar';
import type { SearchFilters, ItemCondition } from '@/types';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, onFilterChange, onReset }: FilterBarProps) {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const conditionOptions = [
    { value: '', label: 'All Conditions' },
    { value: 'Brand New', label: 'Brand New' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Good Condition', label: 'Good Condition' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
  ];

  const distanceOptions = [
    { value: '', label: 'Any Distance' },
    { value: '5', label: 'Within 5 km' },
    { value: '10', label: 'Within 10 km' },
    { value: '25', label: 'Within 25 km' },
    { value: '50', label: 'Within 50 km' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'nearest', label: 'Nearest (Distance)' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const hasActiveFilters = Boolean(
    filters.query ||
    filters.category ||
    filters.condition ||
    filters.distance ||
    (filters.sortBy && filters.sortBy !== 'newest')
  );

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Top Search Bar */}
      <div>
        <SearchBar
          value={filters.query ?? ''}
          onChange={(q) => onFilterChange({ ...filters, query: q })}
          placeholder="Search items by title, category, or location..."
        />
      </div>

      {/* Filter Dropdowns & Reset Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-neutral-100)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', alignItems: 'center' }}>
          <Select
            options={categoryOptions}
            value={filters.category ?? ''}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          />

          <Select
            options={conditionOptions}
            value={filters.condition ?? ''}
            onChange={(e) => onFilterChange({ ...filters, condition: e.target.value as ItemCondition })}
          />

          <Select
            options={distanceOptions}
            value={filters.distance ? String(filters.distance) : ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                distance: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />

          <Select
            options={sortOptions}
            value={filters.sortBy ?? 'newest'}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
          />
        </div>

        {/* Action Row for Reset Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
            <SlidersHorizontal style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-neutral-400)' }} />
            <span>Filter items by specific criteria</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.875rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: hasActiveFilters ? 'var(--color-neutral-300)' : 'transparent',
              backgroundColor: hasActiveFilters ? 'var(--color-neutral-100)' : 'transparent',
              color: hasActiveFilters ? 'var(--color-neutral-800)' : 'var(--color-neutral-400)',
              cursor: hasActiveFilters ? 'pointer' : 'default',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              if (hasActiveFilters) {
                e.currentTarget.style.backgroundColor = 'var(--color-neutral-200)';
                e.currentTarget.style.color = 'var(--color-neutral-900)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasActiveFilters) {
                e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                e.currentTarget.style.color = 'var(--color-neutral-800)';
              }
            }}
          >
            <RotateCcw style={{ width: '0.8125rem', height: '0.8125rem' }} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
