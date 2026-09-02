import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 rounded-[var(--radius-lg)] bg-neutral-100 flex items-center justify-center text-neutral-400 border border-neutral-200">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Large Display */}
      <div className="w-full h-80 sm:h-96 rounded-[var(--radius-lg)] overflow-hidden bg-neutral-100 border border-neutral-200">
        <img
          src={images[activeIdx]}
          alt={`${title} - view ${activeIdx + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback gradient if thumbnail fails to render
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`
                w-20 h-20 rounded-[var(--radius-md)] overflow-hidden shrink-0 border-2 transition-all cursor-pointer
                ${activeIdx === idx ? 'border-primary-500 shadow-sm scale-95' : 'border-transparent opacity-70 hover:opacity-100'}
              `}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
