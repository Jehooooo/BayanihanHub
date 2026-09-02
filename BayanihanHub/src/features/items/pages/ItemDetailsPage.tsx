import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  ArrowLeftRight,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Truck,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ImageGallery from '../components/ImageGallery';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { itemsService } from '@/services/items.service';
import { exchangeService } from '@/services/exchange.service';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import type { Item } from '@/types';
import toast from 'react-hot-toast';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { createChat } = useChatStore();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [selectedUserItem, setSelectedUserItem] = useState('');
  const [userItems, setUserItems] = useState<Item[]>([]);

  useEffect(() => {
    if (id) {
      itemsService.getItemById(id).then((data) => {
        setItem(data);
        setIsLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      itemsService.getItems({ status: 'available' }).then((all) => {
        setUserItems(all.filter((i) => i.ownerId === user.id));
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
          <div className="h-6 bg-neutral-200 rounded w-24" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-neutral-200 rounded-lg" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
              <div className="h-32 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!item) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-neutral-800">Item not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/browse')}>
            Back to Browse
          </Button>
        </div>
      </PageLayout>
    );
  }

  const isOwner = user?.id === item.ownerId;

  const handleMessageOwner = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to send a message.');
      navigate('/login');
      return;
    }
    if (item.owner) {
      createChat([user!.id, item.owner.id]);
      navigate('/messages');
    }
  };

  const handleCreateExchange = async () => {
    if (!selectedUserItem) {
      toast.error('Please select an item to offer.');
      return;
    }
    await exchangeService.createExchange({
      offeredItemId: selectedUserItem,
      requestedItemId: item.id,
      offererId: user!.id,
      receiverId: item.ownerId,
      message: offerMessage || 'Hi, I would like to offer an exchange for your item!',
    });
    setExchangeModalOpen(false);
    toast.success('Exchange offer submitted!');
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1.5 cursor-pointer py-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Detailed Description */}
          <div className="lg:col-span-7 space-y-6">
            <ImageGallery images={item.images} title={item.title} />

            <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-neutral-200 shadow-card space-y-5">
              <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Item Description
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>

              {/* Pickup & Availability Grid */}
              <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-md)] bg-neutral-50 border border-neutral-100">
                  <Truck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 block font-medium">Pickup Options</span>
                    <span className="font-semibold text-neutral-800">
                      {item.pickupOptions.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-md)] bg-neutral-50 border border-neutral-100">
                  <Calendar className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 block font-medium">Availability</span>
                    <span className="font-semibold text-neutral-800">{item.availability}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Badges, Owner Card, CTAs */}
          <div className="lg:col-span-5 space-y-6 sticky top-20">
            <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-neutral-200 shadow-card space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={item.type === 'donation' ? 'success' : 'primary'}>
                    {item.type === 'donation' ? 'Donation' : 'For Exchange'}
                  </Badge>
                  <Badge variant="default">{item.condition}</Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight">
                  {item.title}
                </h1>
                <p className="text-xs text-neutral-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" />
                  {item.location.barangay}, {item.location.municipality} • {item.distance} km away
                </p>
              </div>

              {/* Owner Profile Card */}
              {item.owner && (
                <div className="p-4 rounded-[var(--radius-md)] bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={item.owner.avatar} name={item.owner.fullName} size="md" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                        {item.owner.fullName}
                        {item.owner.isTrusted && (
                          <ShieldCheck className="w-4 h-4 text-primary-600 fill-primary-100" />
                        )}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        ★ {item.owner.rating.toFixed(1)} • {item.owner.totalExchanges} exchanges
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/profile/${item.owner.id}`}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    View
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              {!isOwner && (
                <div className="space-y-3">
                  {item.type === 'exchange' ? (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        if (!isAuthenticated) navigate('/login');
                        else setExchangeModalOpen(true);
                      }}
                      leftIcon={<ArrowLeftRight className="w-4 h-4" />}
                    >
                      Propose Exchange
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleMessageOwner}
                      leftIcon={<MessageCircle className="w-4 h-4" />}
                    >
                      Request Donation
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={handleMessageOwner}
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                  >
                    Message Owner
                  </Button>
                </div>
              )}

              {/* Share & Save Item Row */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-xs text-neutral-500 font-semibold">
                <button
                  onClick={() => {
                    itemsService.toggleFavorite(item.id);
                    toast.success('Saved to favorites');
                  }}
                  className="flex items-center gap-1.5 hover:text-danger cursor-pointer transition-colors"
                >
                  <Heart className="w-4 h-4 text-neutral-400 hover:text-danger" /> Save Item
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Item link copied!');
                  }}
                  className="flex items-center gap-1.5 hover:text-neutral-900 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-neutral-400" /> Share Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Proposal Modal */}
      <Modal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        title="Offer an Exchange"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">
            Select one of your active listings to offer in exchange for <strong>{item.title}</strong>:
          </p>

          {userItems.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-[var(--radius-md)]">
              You haven't posted any active items to offer yet. Please post an item first!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {userItems.map((uItem) => (
                <label
                  key={uItem.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-[var(--radius-md)] border cursor-pointer transition-all
                    ${selectedUserItem === uItem.id ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}
                  `}
                >
                  <input
                    type="radio"
                    name="userItem"
                    value={uItem.id}
                    checked={selectedUserItem === uItem.id}
                    onChange={(e) => setSelectedUserItem(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{uItem.title}</p>
                    <p className="text-[11px] text-neutral-500">{uItem.condition}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <Textarea
            label="Message to Owner (Optional)"
            placeholder="Add a friendly message..."
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setExchangeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={!selectedUserItem}
              onClick={handleCreateExchange}
            >
              Submit Offer
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
