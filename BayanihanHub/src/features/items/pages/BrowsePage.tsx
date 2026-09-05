import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';
import { itemsService } from '@/services/items.service';
import type { Item, SearchFilters } from '@/types';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    sortBy: 'newest',
  });
  const scrollRestored = useRef(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await itemsService.getItems(filters);
      setItems(data);
    } catch {
      toast.error('Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Restore scroll position when returning from item details
  useEffect(() => {
    if (!isLoading && !scrollRestored.current) {
      const saved = sessionStorage.getItem('browse-scroll-pos');
      if (saved) {
        const y = parseInt(saved, 10);
        sessionStorage.removeItem('browse-scroll-pos');
        scrollRestored.current = true;
        // Small delay to let the grid render fully before scrolling
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' });
        });
      }
    }
  }, [isLoading]);

  const handleFavoriteToggle = async (id: string) => {
    const isFav = await itemsService.toggleFavorite(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorited: isFav } : item))
    );
    toast.success(isFav ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleResetFilters = () => {
    setFilters({ query: '', sortBy: 'newest' });
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Browse Available Items</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
            Discover community donations and items available for fair exchange.
          </p>
        </div>

        {/* Filter Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Item Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No items found"
            description="Try relaxing your filters or searching for something else."
            actionLabel="Clear Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

