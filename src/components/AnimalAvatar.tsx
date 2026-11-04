import React, { useState } from 'react';

export interface AnimalAvatarProps {
  animal: {
    name: string;
    species: string;
    tagId?: string;
    breed?: string;
    photoUrl?: string;
    sex?: string;
  };
  size?: 'icon' | 'card' | 'hero' | 'thumbnail';
  className?: string;
  showBadge?: boolean;
}

export const AnimalAvatar: React.FC<AnimalAvatarProps> = ({
  animal,
  size = 'icon',
  className = '',
  showBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [lastPhotoUrl, setLastPhotoUrl] = useState(animal.photoUrl);

  // Reset error state if animal or photoUrl changes
  if (animal.photoUrl !== lastPhotoUrl) {
    setLastPhotoUrl(animal.photoUrl);
    setHasError(false);
  }

  const sp = animal.species || 'Goat';
  const isGoat = sp === 'Goat';
  const isSheep = sp === 'Sheep';
  const isCow = sp === 'Cow';
  const isBuffalo = sp === 'Buffalo';
  const isChicken = sp === 'Chicken';

  // Species-specific styling palettes
  let bgGradient = 'from-amber-50 via-emerald-50 to-teal-100/90';
  let borderColor = 'border-emerald-200/90';
  let badgeBg = 'bg-emerald-100/90 text-emerald-950 border-emerald-300';
  let ringBg = 'bg-emerald-600/10 border-emerald-300/40';
  let emoji = '🐐';

  if (isSheep) {
    bgGradient = 'from-sky-50 via-stone-50 to-indigo-100/90';
    borderColor = 'border-sky-200/90';
    badgeBg = 'bg-sky-100/90 text-sky-950 border-sky-300';
    ringBg = 'bg-sky-600/10 border-sky-300/40';
    emoji = '🐑';
  } else if (isCow) {
    bgGradient = 'from-amber-50 via-orange-50 to-amber-100';
    borderColor = 'border-amber-300/80';
    badgeBg = 'bg-amber-100 text-amber-950 border-amber-300';
    ringBg = 'bg-amber-600/10 border-amber-300/40';
    emoji = '🐄';
  } else if (isBuffalo) {
    bgGradient = 'from-slate-100 via-stone-100 to-slate-200';
    borderColor = 'border-slate-300';
    badgeBg = 'bg-slate-200 text-slate-900 border-slate-300';
    ringBg = 'bg-slate-600/10 border-slate-300/40';
    emoji = '🐃';
  } else if (isChicken) {
    bgGradient = 'from-rose-50 via-amber-50 to-orange-100';
    borderColor = 'border-rose-200';
    badgeBg = 'bg-rose-100 text-rose-950 border-rose-300';
    ringBg = 'bg-rose-600/10 border-rose-300/40';
    emoji = '🐔';
  }

  // Check if we have a valid photoUrl that hasn't errored
  const hasValidPhoto = Boolean(
    animal.photoUrl && 
    animal.photoUrl.trim() !== '' && 
    !hasError
  );

  // Large Hero View for Animal Detail Modal
  if (size === 'hero') {
    if (hasValidPhoto) {
      return (
        <img
          src={animal.photoUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }

    return (
      <div 
        className={`w-full h-full min-h-[190px] bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-4 relative overflow-hidden select-none border-b border-stone-200 ${className}`}
      >
        {/* Soft background decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/50 blur-lg pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-2.5">
          {/* Centered Large Species Illustration Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-105">
            <span className="text-4xl sm:text-5xl drop-shadow-xs select-none">{emoji}</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-black font-mono border ${badgeBg}`}>
                #{animal.tagId || 'NEW'}
              </span>
              <span className="text-xs font-black text-stone-800">
                {animal.breed || animal.species}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-semibold mt-1">
              No photo uploaded yet · Tap &quot;Change Photo&quot; to upload
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Small Icon View / Card View
  if (hasValidPhoto) {
    return (
      <img
        src={animal.photoUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${className}`}
      />
    );
  }

  // Graceful Fallback: Beautiful, tactile vector-style avatar tile
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center relative overflow-hidden select-none border ${borderColor} ${className}`}
    >
      {/* Decorative soft highlight glow */}
      <div className="absolute inset-0 bg-radial from-white/80 via-white/20 to-transparent pointer-events-none" />

      {/* Main species illustration circle */}
      <div className="relative z-10 flex items-center justify-center">
        <div className={`rounded-full bg-white/85 shadow-2xs border ${ringBg} flex items-center justify-center ${
          size === 'thumbnail'
            ? 'w-7 h-7 text-sm'
            : size === 'card'
            ? 'w-10 h-10 sm:w-11 sm:h-11 text-xl sm:text-2xl'
            : 'w-9 h-9 min-[400px]:w-10 min-[400px]:h-10 text-xl min-[400px]:text-2xl'
        }`}>
          <span className="drop-shadow-xs leading-none select-none">
            {emoji}
          </span>
        </div>
      </div>

      {/* Subtle Tag initials at bottom if showBadge */}
      {showBadge && animal.tagId && (
        <span className="relative z-10 mt-1 px-1 py-0.2 rounded font-mono font-black text-[8px] bg-white/95 text-stone-700 leading-none shadow-2xs border border-stone-200/80">
          #{animal.tagId.slice(-3)}
        </span>
      )}
    </div>
  );
};
