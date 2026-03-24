import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-lg',
  lg: 'w-20 h-20 text-3xl',
};

export default function PlayerAvatar({ size = 'md', className = '' }) {
  const player = useLiveQuery(() => db.player.get('default'));

  const sizeClass = sizes[size] || sizes.md;
  const initials = (player?.name || 'P')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (player?.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt={player.name || 'Player'}
        className={`${sizeClass} rounded-full object-cover border-2 border-kp-primary-container ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-kp-primary-container text-kp-on-primary-fixed flex items-center justify-center font-headline font-black ${className}`}>
      {initials}
    </div>
  );
}
