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

  return (
    <div className="bg-white p-4 rounded-[var(--radius-lg)] border border-neutral-200 shadow-card space-y-4 mb-6">
      {/* Top Search Bar */}
      <SearchBar
        value={filters.query ?? ''}
        onChange={(q) => onFilterChange({ ...filters, query: q })}
        placeholder="Search items by title, category, or location..."
      />

      {/* Filter Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-neutral-100 items-end">
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

        <div className="flex justify-end col-span-1 sm:col-span-2 lg:col-span-1">
          <button
            onClick={onReset}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 underline cursor-pointer py-2 px-1"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
