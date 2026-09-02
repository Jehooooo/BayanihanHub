import { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ExchangeCard from '../components/ExchangeCard';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import { exchangeService } from '@/services/exchange.service';
import { useAuthStore } from '@/stores/authStore';
import type { Exchange, ExchangeStatus } from '@/types';
import toast from 'react-hot-toast';

export default function ExchangePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExchanges = async () => {
    setIsLoading(true);
    const data = await exchangeService.getExchanges(user?.id ?? 'user-1');
    setExchanges(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadExchanges();
  }, [user]);

  const handleStatusUpdate = async (id: string, status: ExchangeStatus) => {
    await exchangeService.updateExchangeStatus(id, status);
    toast.success(`Exchange status updated to ${status}`);
    loadExchanges();
  };

  const filteredExchanges = exchanges.filter((e) => {
    if (activeTab === 'pending') return e.status === 'pending';
    if (activeTab === 'active') return e.status === 'accepted' || e.status === 'meeting_scheduled';
    if (activeTab === 'completed') return e.status === 'completed';
    return true;
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Exchange System</h1>
          <p className="text-sm text-neutral-500">
            Track item exchange proposals, accept offers, and arrange meetups with local neighbors.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'all', label: 'All Exchanges' },
            { id: 'pending', label: 'Pending Offers' },
            { id: 'active', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-40 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-40 bg-neutral-200 rounded-lg animate-pulse" />
          </div>
        ) : filteredExchanges.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="w-8 h-8" />}
            title="No exchanges found"
            description="You don't have any exchanges in this category yet."
          />
        ) : (
          <div className="space-y-4">
            {filteredExchanges.map((exc) => (
              <ExchangeCard
                key={exc.id}
                exchange={exc}
                currentUserId={user?.id ?? 'user-1'}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
