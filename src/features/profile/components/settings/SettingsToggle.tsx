// ============================================================
// SettingsToggle — Reusable Toggle Switch Component
// ============================================================

import React from 'react';

interface SettingsToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  locked?: boolean; // for security-critical settings
}

export default function SettingsToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  locked = false,
}: SettingsToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className={`text-sm font-medium cursor-pointer select-none ${
            disabled || locked ? 'text-neutral-400' : 'text-neutral-800'
          }`}
        >
          {label}
          {locked && (
            <span className="ml-2 text-xs font-normal text-neutral-400">(Required)</span>
          )}
        </label>
        {description && (
          <p className={`text-xs mt-0.5 ${disabled || locked ? 'text-neutral-300' : 'text-neutral-500'}`}>
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled || locked}
        onClick={() => !disabled && !locked && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${checked ? 'bg-primary-600' : 'bg-neutral-300'}
          ${disabled || locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}
