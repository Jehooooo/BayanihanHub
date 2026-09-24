import { useState, type ImgHTMLAttributes } from 'react';
import { Tag } from 'lucide-react';
import Skeleton from './Skeleton';

export interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string; // e.g. '4/3', '1/1', '16/9'
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  containerClassName?: string;
}

export default function ImageWithSkeleton({
  src,
  alt = 'Image',
  aspectRatio = '4/3',
  fallbackIcon,
  fallbackText,
  className = '',
  containerClassName = '',
  style,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const showFallback = !src || hasError;

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${containerClassName}`}
      style={{
        aspectRatio,
        ...style,
      }}
    >
      {/* Shimmer skeleton while image is loading */}
      {!isLoaded && !showFallback && (
        <div className="absolute inset-0 z-10 w-full h-full">
          <Skeleton width="100%" height="100%" rounded="none" />
        </div>
      )}

      {/* Actual image */}
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`
            w-full h-full object-cover transition-opacity duration-300 ease-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          {...props}
        />
      )}

      {/* Fallback placeholder on error or missing image */}
      {showFallback && (
        <div
          role="img"
          aria-label={alt}
          className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 text-center select-none"
        >
          {fallbackIcon ?? <Tag className="w-7 h-7 mb-1 text-neutral-400" />}
          {fallbackText && (
            <span className="text-xs font-semibold text-neutral-400">
              {fallbackText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
