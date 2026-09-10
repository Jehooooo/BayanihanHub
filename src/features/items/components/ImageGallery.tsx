import { useState } from 'react';
import { Package } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const validImages = (images || []).filter(Boolean);

  if (validImages.length === 0 || failedIndices[activeIdx]) {
    // If the active image failed or no images provided, check if there is another valid one
    const alternativeIdx = validImages.findIndex((_, idx) => !failedIndices[idx]);
    if (alternativeIdx !== -1 && alternativeIdx !== activeIdx) {
      setActiveIdx(alternativeIdx);
    } else {
      return (
        <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col items-center justify-center text-neutral-400 border border-neutral-200/80 shadow-sm gap-3 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs flex items-center justify-center text-primary-600 border border-neutral-200/80">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <span className="text-sm font-bold text-neutral-700">{title}</span>
          <span className="text-xs text-neutral-400">Photo preview unavailable</span>
        </div>
      );
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Main Large Display (First picture is default thumbnail) */}
      <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-card relative">
        <img
          src={validImages[activeIdx]}
          alt={`${title} - view ${activeIdx + 1}`}
          className="w-full h-full object-cover"
          onError={() => setFailedIndices((prev) => ({ ...prev, [activeIdx]: true }))}
        />
        {activeIdx === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              pointerEvents: 'none',
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            <span style={{ color: '#f59e0b', fontSize: '0.8125rem', lineHeight: 1 }}>★</span>
            <span style={{ lineHeight: 1, letterSpacing: '0.015em' }}>Primary Photo</span>
          </div>
        )}
      </div>

      {/* Thumbnail Bar */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`
                w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer relative
                ${activeIdx === idx ? 'border-primary-500 shadow-md ring-2 ring-primary-100 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}
              `}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setFailedIndices((prev) => ({ ...prev, [idx]: true }))}
              />
              {idx === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-neutral-900/80 text-white text-[9px] font-bold py-0.5 text-center">
                  Cover
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
