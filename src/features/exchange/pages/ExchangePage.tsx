import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, Package } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ExchangeCard from '../components/ExchangeCard';
import ItemCard from '@/features/items/components/ItemCard';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { exchangeService } from '@/services/exchange.service';
import { itemsService } from '@/services/items.service';
import { useAuthStore } from '@/stores/authStore';
import type { Exchange, ExchangeStatus, Item } from '@/types';
import toast from 'react-hot-toast';

export default function ExchangePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? 'user-1';

  const [mainTab, setMainTab] = useState<'my_items' | 'proposals' | 'community'>('my_items');
  const [proposalStatusTab, setProposalStatusTab] = useState('all');

  const [exchangeItems, setExchangeItems] = useState<Item[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, proposalsData] = await Promise.all([
        itemsService.getItems({ type: 'exchange' }),
        exchangeService.getExchanges(currentUserId),
      ]);
      setExchangeItems(itemsData);
      setExchanges(proposalsData);
    } catch {
      toast.error('Failed to load exchanges.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (id: string, status: ExchangeStatus) => {
    await exchangeService.updateExchangeStatus(id, status);
    toast.success(`Exchange status updated to ${status}`);
    loadData();
  };

  const handleFavoriteToggle = async (id: string) => {
    await itemsService.toggleFavorite(id);
    loadData();
  };

  const myExchangeItems = exchangeItems.filter(
    (item) => item.ownerId === currentUserId || item.owner?.id === currentUserId
  );

  const filteredProposals = exchanges.filter((e) => {
    if (proposalStatusTab === 'pending') return e.status === 'pending';
    if (proposalStatusTab === 'active') return e.status === 'accepted' || e.status === 'meeting_scheduled';
    if (proposalStatusTab === 'completed') return e.status === 'completed';
    return true;
  });

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
              Exchange Dashboard
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0' }}>
              Manage your posted items for swap, discover community exchange opportunities, and track trade proposals.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/post')}
            leftIcon={<Plus style={{ width: '1rem', height: '1rem' }} />}
            className="font-bold shadow-button"
          >
            Post Item for Exchange
          </Button>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs
          tabs={[
            { id: 'my_items', label: `My Exchange Items (${myExchangeItems.length})` },
            { id: 'community', label: `Community Exchanges (${exchangeItems.length})` },
            { id: 'proposals', label: `Trade Proposals (${exchanges.length})` },
          ]}
          activeTab={mainTab}
          onChange={(tab) => setMainTab(tab as 'my_items' | 'proposals' | 'community')}
        />

        {/* 1. MY POSTED EXCHANGE ITEMS */}
        {mainTab === 'my_items' && (
          <div>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{ height: '18rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-200)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : myExchangeItems.length === 0 ? (
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="No exchange items posted yet"
                description="Post items you'd like to trade or swap with other members of your community."
                actionLabel="Post an Item for Exchange"
                onAction={() => navigate('/post')}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {myExchangeItems.map((item) => (
                  <ItemCard key={item.id} item={item} onFavoriteToggle={handleFavoriteToggle} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. COMMUNITY EXCHANGES */}
        {mainTab === 'community' && (
          <div>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} style={{ height: '18rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-neutral-200)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : exchangeItems.length === 0 ? (
              <EmptyState
                icon={<ArrowLeftRight className="w-8 h-8" />}
                title="No exchange listings available"
                description="Be the first to post an exchange item in your area!"
                actionLabel="Post an Item for Exchange"
                onAction={() => navigate('/post')}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {exchangeItems.map((item) => (
                  <ItemCard key={item.id} item={item} onFavoriteToggle={handleFavoriteToggle} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. TRADE PROPOSALS */}
        {mainTab === 'proposals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Tabs
              tabs={[
                { id: 'all', label: 'All Offers' },
                { id: 'pending', label: 'Pending Response' },
                { id: 'active', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
              ]}
              activeTab={proposalStatusTab}
              onChange={setProposalStatusTab}
            />

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '10rem', backgroundColor: 'var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '10rem', backgroundColor: 'var(--color-neutral-200)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
              </div>
            ) : filteredProposals.length === 0 ? (
              <EmptyState
                icon={<ArrowLeftRight className="w-8 h-8" />}
                title="No trade proposals found"
                description="You don't have any exchange proposals in this category yet."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredProposals.map((exc) => (
                  <ExchangeCard
                    key={exc.id}
                    exchange={exc}
                    currentUserId={currentUserId}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
