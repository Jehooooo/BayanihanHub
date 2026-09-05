import { useState } from 'react';
import { Package } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200/80 flex flex-col items-center justify-center text-neutral-400 border border-neutral-200/80 shadow-sm gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center text-neutral-400">
          <Package className="w-7 h-7 text-neutral-400" />
        </div>
        <span className="text-xs font-semibold text-neutral-500">No photos uploaded for this listing</span>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Main Large Display */}
      <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-card">
        <img
          src={images[activeIdx]}
          alt={`${title} - view ${activeIdx + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`
                w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer
                ${activeIdx === idx ? 'border-primary-500 shadow-md ring-2 ring-primary-100 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}
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
