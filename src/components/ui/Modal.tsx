import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal Content */}
      <div
        className={`relative w-full ${
          size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-4xl'
        } bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-modal)] flex flex-col max-h-[92vh] overflow-hidden border border-neutral-200 z-10 animate-scale-in`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-100 bg-neutral-50/80 shrink-0">
            {title && (
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 m-0 tracking-tight">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/70 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-neutral-800 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
