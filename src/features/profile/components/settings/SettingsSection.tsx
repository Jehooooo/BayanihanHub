// ============================================================
// SettingsSection — Wrapper Card with Icon + Heading
// ============================================================

import React from 'react';

interface SettingsSectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}

export default function SettingsSection({
  id,
  icon,
  title,
  description,
  children,
  className = '',
  danger = false,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className={`
        rounded-xl border bg-white shadow-sm overflow-hidden
        ${danger ? 'border-red-200' : 'border-neutral-200'}
        ${className}
      `}
    >
      {/* Section Header */}
      <div
        className={`px-5 py-4 border-b ${
          danger ? 'border-red-100 bg-red-50/40' : 'border-neutral-100 bg-neutral-50/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex-shrink-0 ${danger ? 'text-red-500' : 'text-primary-600'}`}
          >
            {icon}
          </span>
          <div>
            <h2
              className={`text-sm font-bold tracking-tight ${
                danger ? 'text-red-700' : 'text-neutral-900'
              }`}
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Body */}
      <div className="px-5 py-4 space-y-1">{children}</div>
    </section>
  );
}

// ── Divider between settings items ───────────────────────────

export function SettingsDivider() {
  return <hr className="border-neutral-100 my-1" />;
}

// ── Row with label + control on right ────────────────────────

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
