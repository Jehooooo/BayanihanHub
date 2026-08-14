import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '1px solid var(--color-neutral-200)',
        overflowX: 'auto',
        paddingBottom: '1px',
      }}
      role="tablist"
      className={className}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              whiteSpace: 'nowrap',
              color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 150ms ease-in-out',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '1.25rem',
                  height: '1.125rem',
                  padding: '0 0.375rem',
                  borderRadius: '9999px',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  backgroundColor: isActive ? 'var(--color-primary-100)' : 'var(--color-neutral-100)',
                  color: isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return { activeTab, setActiveTab };
}

