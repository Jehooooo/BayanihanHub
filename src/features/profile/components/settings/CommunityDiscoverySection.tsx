// ============================================================
// CommunityDiscoverySection — Discovery Radius + Feed Defaults
// ============================================================

import React from 'react';
import { Globe, Compass } from 'lucide-react';
import SettingsSection, { SettingsDivider, SettingsRow } from './SettingsSection';
import SettingsToggle from './SettingsToggle';
import { useSettingsStore } from '@/stores/settingsStore';
import toast from 'react-hot-toast';

const RADIUS_OPTIONS = [
  { value: 'barangay', label: 'Within my Barangay', description: 'See posts only from your immediate barangay' },
  { value: '5km', label: 'Within 5 km', description: 'Posts within a 5-kilometer radius' },
  { value: '10km', label: 'Within 10 km', description: 'Posts within a 10-kilometer radius' },
  { value: 'municipality', label: 'My Municipality', description: 'All posts within your municipality' },
  { value: 'whole_municipality', label: 'Whole Municipality (wider)', description: 'Broadest community discovery area' },
] as const;

const FEED_OPTIONS = [
  { value: 'nearby', label: 'Nearby (Default)' },
  { value: 'all', label: 'All Posts' },
] as const;

const CATEGORY_OPTIONS = [
  'All Categories', 'Food & Groceries', 'Clothing & Apparel', 'Books & Education',
  'Electronics', 'Furniture & Home', 'Toys & Kids', 'Tools & Equipment',
  'Medical & Health', 'Sports & Hobbies', 'Others',
];

export default function CommunityDiscoverySection() {
  const { discovery, updateDiscovery } = useSettingsStore();

  const handleRadiusChange = (value: string) => {
    updateDiscovery({ radius: value as any });
    toast.success('Discovery radius updated.');
  };

  const handleToggle = (key: keyof typeof discovery, value: boolean) => {
    updateDiscovery({ [key]: value } as any);
    toast.success('Discovery preference saved.');
  };

  return (
    <SettingsSection
      id="community-discovery"
      icon={<Globe className="w-4 h-4" />}
      title="Community Discovery"
      description="Control how far you discover donations, requests, and exchange opportunities."
    >
      {/* Discovery Radius */}
      <div className="py-2">
        <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-3">
          Discovery Radius
        </p>
        <div className="space-y-2">
          {RADIUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`
                flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${discovery.radius === opt.value
                  ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }
              `}
            >
              <input
                type="radio"
                name="discovery-radius"
                value={opt.value}
                checked={discovery.radius === opt.value}
                onChange={() => handleRadiusChange(opt.value)}
                className="mt-0.5 accent-primary-600 flex-shrink-0"
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">{opt.label}</span>
                <p className="text-xs text-neutral-500 mt-0.5">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <SettingsDivider />

      {/* Default Feed */}
      <SettingsRow
        label="Default Feed"
        description="What you see first when you open Browse or Dashboard."
      >
        <select
          value={discovery.defaultFeed}
          onChange={(e) => {
            updateDiscovery({ defaultFeed: e.target.value as any });
            toast.success('Feed preference saved.');
          }}
          className="text-sm rounded-lg border border-neutral-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {FEED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </SettingsRow>

      <SettingsDivider />

      {/* Default Category */}
      <SettingsRow
        label="Default Browse Category"
        description="Filters the Browse page to your preferred category."
      >
        <select
          value={discovery.defaultCategory}
          onChange={(e) => {
            updateDiscovery({ defaultCategory: e.target.value });
            toast.success('Category preference saved.');
          }}
          className="text-sm rounded-lg border border-neutral-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c === 'All Categories' ? 'all' : c}>{c}</option>
          ))}
        </select>
      </SettingsRow>

      <SettingsDivider />

      <SettingsToggle
        id="show-completed"
        label="Show Completed Listings"
        description="Display donated or exchanged items in browse results."
        checked={discovery.showCompletedListings}
        onChange={(v) => handleToggle('showCompletedListings', v)}
      />

      <SettingsToggle
        id="show-unavailable"
        label="Show Unavailable Items"
        description="Include reserved or unavailable items in search results."
        checked={discovery.showUnavailableItems}
        onChange={(v) => handleToggle('showUnavailableItems', v)}
      />
    </SettingsSection>
  );
}
