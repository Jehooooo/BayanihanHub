// ============================================================
// Bayanihan Hub — Registration Stepper Component
// ============================================================

import React from 'react';
import { Check, User, CreditCard, FileText, Camera, ShieldCheck } from 'lucide-react';

export interface StepItem {
  number: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { number: 1, title: 'Account Information', shortTitle: 'Account', icon: User },
  { number: 2, title: 'Select Valid ID', shortTitle: 'Select ID', icon: CreditCard },
  { number: 3, title: 'ID Details & Document', shortTitle: 'ID Details', icon: FileText },
  { number: 4, title: 'Facial Verification', shortTitle: 'Selfie Check', icon: Camera },
  { number: 5, title: 'Verified Activation', shortTitle: 'Activate', icon: ShieldCheck },
];

interface RegistrationStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function RegistrationStepper({ currentStep, onStepClick }: RegistrationStepperProps) {
  return (
    <div style={{ width: '100%', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Background Connecting Bar */}
        <div
          style={{
            position: 'absolute',
            top: '1.25rem',
            left: '2rem',
            right: '2rem',
            height: '2px',
            backgroundColor: 'var(--color-neutral-200)',
            zIndex: 0,
          }}
        />
        {/* Active Progress Bar Fill */}
        <div
          style={{
            position: 'absolute',
            top: '1.25rem',
            left: '2rem',
            width: `${((Math.min(currentStep, 5) - 1) / (STEPS.length - 1)) * 100}%`,
            height: '2px',
            backgroundColor: 'var(--color-primary-600)',
            transition: 'width 300ms ease-in-out',
            zIndex: 0,
          }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const StepIcon = step.icon;

          return (
            <div
              key={step.number}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                cursor: isCompleted && onStepClick ? 'pointer' : 'default',
                userSelect: 'none',
              }}
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(step.number);
                }
              }}
            >
              {/* Circle Badge */}
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  transition: 'all 200ms ease-in-out',
                  backgroundColor: isCompleted
                    ? 'var(--color-primary-600)'
                    : isCurrent
                    ? '#ffffff'
                    : 'var(--color-neutral-100)',
                  color: isCompleted
                    ? '#ffffff'
                    : isCurrent
                    ? 'var(--color-primary-600)'
                    : 'var(--color-neutral-400)',
                  border: isCurrent
                    ? '2px solid var(--color-primary-600)'
                    : isCompleted
                    ? '2px solid var(--color-primary-600)'
                    : '2px solid var(--color-neutral-200)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(46, 125, 50, 0.15)' : 'none',
                }}
              >
                {isCompleted ? (
                  <Check style={{ width: '1.125rem', height: '1.125rem', strokeWidth: 3 }} />
                ) : (
                  <StepIcon style={{ width: '1.125rem', height: '1.125rem' }} />
                )}
              </div>

              {/* Step Label */}
              <div
                style={{
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? 'var(--color-primary-700)'
                    : isCompleted
                    ? 'var(--color-neutral-800)'
                    : 'var(--color-neutral-400)',
                  transition: 'color 150ms',
                }}
              >
                <span className="hidden sm:inline">{step.title}</span>
                <span className="inline sm:hidden">{step.shortTitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
