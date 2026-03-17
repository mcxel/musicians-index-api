// tmi-platform/apps/web/src/components/ui/Avatar.tsx
'use client';

import Image from 'next/image';
import clsx from 'clsx';

type AvatarProps = {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isSpeaking?: boolean;
  isIdle?: boolean;
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

const onlineDotClasses = {
  sm: 'w-2 h-2 bottom-0 right-0',
  md: 'w-3 h-3 bottom-0 right-0',
  lg: 'w-4 h-4 bottom-1 right-1',
  xl: 'w-5 h-5 bottom-1 right-1',
}

export function Avatar({
  src,
  name,
  size = 'md',
  isOnline = false,
  isSpeaking = false,
  isIdle = false,
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const onlineDotClass = onlineDotClasses[size];

  return (
    <div className={clsx('relative flex-shrink-0', sizeClass)}>
      <div
        className={clsx(
          'absolute -inset-1 rounded-full transition-all duration-300',
          // Speaker highlight
          isSpeaking && 'ring-4 ring-blue-500',
          // Idle animation
          isIdle && !isSpeaking && 'animate-pulse ring-2 ring-gray-500/50 motion-reduce:animate-none'
        )}
      />
      <Image
        className="rounded-full object-cover w-full h-full"
        src={src || '/default-avatar.png'} // A default avatar is good practice
        alt={name || 'User avatar'}
        width={128} // Provide base width/height for Next.js Image component
        height={128}
      />
      {isOnline && (
        <span
          className={clsx(
            'absolute rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900',
            onlineDotClass
          )}
          title="Online"
        />
      )}
    </div>
  );
}
