import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';
import ScrollReveal from '@/components/common/ScrollReveal';
import { itemsService } from '@/services/items.service';
import type { Item, SearchFilters } from '@/types';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';
import { useAuthStore } from '@/stores/authStore';

export default function BrowsePage() {
  const { user } = useAuthStore();
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
    if (!user?.id) {
      toast.error('Please log in to save items.');
      return;
    }

    // Optimistic UI update locally first
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newFavStatus = !item.isFavorited;
    
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorited: newFavStatus } : i))
    );
    
    await itemsService.toggleFavorite(id, user.id);
    // Real response handled by event listener below if there's a discrepancy
  };

  useEffect(() => {
    const handleFavEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ itemId: string; isFavorited: boolean }>;
      const { itemId, isFavorited } = customEvent.detail;
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isFavorited } : i))
      );
    };
    window.addEventListener('bayanihan-favorite-toggled', handleFavEvent);
    return () => window.removeEventListener('bayanihan-favorite-toggled', handleFavEvent);
  }, []);

  const handleResetFilters = () => {
    setFilters({ query: '', sortBy: 'newest' });
  };

  return (
    <PageLayout>
      <SEO 
        title="Browse Donations and Exchanges" 
        description="Browse available donated items, community requests, and exchange opportunities on BayanihanHub." 
        canonicalUrl="/browse" 
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4.5rem' }}>
        <ScrollReveal direction="down" duration={500}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Browse Available Items</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Discover community donations and items available for fair exchange.
            </p>
          </div>
        </ScrollReveal>

        {/* Filter Controls */}
        <ScrollReveal direction="up" delay={80}>
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </ScrollReveal>

        {/* Item Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx * 60} direction="up">
                <ItemCard
                  item={item}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

