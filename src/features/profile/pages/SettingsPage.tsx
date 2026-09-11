// ============================================================
// BayanihanHub — Settings Page (Unified Nav + Smooth Scroll)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Globe, Bell, Shield, MessageSquare,
  Lock, Palette, Database, AlertTriangle,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ProfileSettingsSection from '../components/settings/ProfileSettingsSection';
import CommunityDiscoverySection from '../components/settings/CommunityDiscoverySection';
import NotificationSettingsSection from '../components/settings/NotificationSettingsSection';
import PrivacySection from '../components/settings/PrivacySection';
import MessagingSection from '../components/settings/MessagingSection';
import AccountSecuritySection from '../components/settings/AccountSecuritySection';
import AppearanceSection from '../components/settings/AppearanceSection';
import DataPrivacySection from '../components/settings/DataPrivacySection';
import DangerZoneSection from '../components/settings/DangerZoneSection';

// ── Nav Definitions ───────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'profile-picture',      label: 'Profile & Location',    icon: <User className="w-4 h-4" /> },
  { id: 'community-discovery',  label: 'Community Discovery',   icon: <Globe className="w-4 h-4" /> },
  { id: 'notifications',        label: 'Notifications',         icon: <Bell className="w-4 h-4" /> },
  { id: 'privacy',              label: 'Privacy & Trust',       icon: <Shield className="w-4 h-4" /> },
  { id: 'messaging',            label: 'Messaging',             icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'account-security',     label: 'Account & Security',    icon: <Lock className="w-4 h-4" /> },
  { id: 'appearance',           label: 'Appearance',            icon: <Palette className="w-4 h-4" /> },
  { id: 'data-privacy',         label: 'Data & Privacy',        icon: <Database className="w-4 h-4" /> },
  { id: 'danger-zone',          label: 'Danger Zone',           icon: <AlertTriangle className="w-4 h-4" />, danger: true },
];

// ── Smooth eased scroll helper ────────────────────────────────

function smoothScrollTo(targetY: number, duration = 520) {
  const startY = window.scrollY;
  const diff   = targetY - startY;
  let startTime: number | null = null;

  // Ease-in-out cubic
  function ease(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ── Unified Settings Nav ──────────────────────────────────────

function SettingsNav({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate: (id: string) => void;
}) {
  const pillsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view on mobile
  useEffect(() => {
    if (!pillsRef.current) return;
    const active = pillsRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <nav className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-6 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Settings</p>
          </div>
          <ul className="py-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    data-active={isActive}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium
                      transition-all duration-200 border-r-2
                      ${isActive
                        ? item.danger
                          ? 'bg-red-50 text-red-700 border-red-500'
                          : 'bg-primary-50 text-primary-700 border-primary-500'
                        : item.danger
                        ? 'text-red-500 border-transparent hover:bg-red-50/50 hover:text-red-600'
                        : 'text-neutral-600 border-transparent hover:bg-neutral-50 hover:text-neutral-800'
                      }
                    `}
                  >
                    <span
                      className={`transition-colors duration-200 ${
                        isActive
                          ? item.danger ? 'text-red-500' : 'text-primary-600'
                          : item.danger ? 'text-red-400' : 'text-neutral-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ── Mobile Horizontal Pills ── */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-200 -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 py-2 mb-4 w-[calc(100%+1.75rem)] sm:w-[calc(100%+3rem)]">
        <div ref={pillsRef} className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-active={isActive}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  border whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? item.danger
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : item.danger
                    ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
                    : 'text-neutral-600 border-neutral-200 bg-white hover:bg-neutral-50'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile-picture');
  const isManualScroll = useRef(false);

  // Navigate to section with smooth animated scroll
  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    isManualScroll.current = true;

    const el = document.getElementById(id);
    if (!el) return;

    // Offset: 80px for mobile sticky nav, 24px breathing room
    const OFFSET = window.innerWidth < 1024 ? 88 : 24;
    const targetY = el.getBoundingClientRect().top + window.scrollY - OFFSET;

    smoothScrollTo(targetY, 520);

    // Release manual lock after animation completes
    setTimeout(() => { isManualScroll.current = false; }, 600);
  }, []);

  // Intersection Observer — update active on natural scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isManualScroll.current) {
            setActiveSection(id);
          }
        },
        { rootMargin: '-15% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage your profile, privacy, notifications, and account preferences.
        </p>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">

        {/* Unified Nav (renders sidebar on desktop, pills on mobile) */}
        <SettingsNav activeSection={activeSection} onNavigate={scrollToSection} />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-5">
          <ProfileSettingsSection />
          <CommunityDiscoverySection />
          <NotificationSettingsSection />
          <PrivacySection />
          <MessagingSection />
          <AccountSecuritySection />
          <AppearanceSection />
          <DataPrivacySection />
          <DangerZoneSection />
        </div>
      </div>
    </PageLayout>
  );
}
