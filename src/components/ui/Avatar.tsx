import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

const iconSizeClasses: Record<AvatarSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({
  src,
  name,
  size = 'md',
  className = '',
  showStatus = false,
  isOnline = false,
}: AvatarProps) {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`
            ${sizeClasses[size]}
            rounded-full object-cover
            border-2 border-white shadow-sm
          `}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]}
            ${getColorFromName(name)}
            rounded-full flex items-center justify-center
            text-white font-semibold
            border-2 border-white shadow-sm
          `}
          aria-label={name}
        >
          {name ? getInitials(name) : <User className={iconSizeClasses[size]} />}
        </div>
      )}

      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizeClasses[size]}
            rounded-full border-white
            ${isOnline ? 'bg-green-500' : 'bg-neutral-400'}
          `}
        />
      )}
    </div>
  );
}
