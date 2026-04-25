'use client';

import { useState, useCallback } from 'react';
import { Hash } from 'lucide-react';
import type { Player } from '@/types/minecraft';
import { getFallbackAvatar, isAlexSkin, isValidUUID } from '@/lib/minecraft';

interface PlayerGridProps {
  players: Player[];
}

export function PlayerGrid({ players }: PlayerGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Use our API route (tries multiple services + SVG fallback)
  const getSrc = (uuid: string, size: number = 64): string => {
    if (!uuid || !isValidUUID(uuid)) {
      return getFallbackAvatar(isAlexSkin(uuid));
    }
    return `/api/avatar/${uuid}?size=${size}`;
  };

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  return (
    <div className="overflow-visible">
      <div className="text-xs text-gray-500 mb-2 font-medium">
        Online Players ({players.length})
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-visible">
        {players.slice(0, 24).map((player, index) => {
          const uuid = player.uuid || `unknown_${index}`;
          const avatarSrc = getSrc(uuid, 64);
          const tooltipSrc = getSrc(uuid, 128);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={`player-${uuid}-${index}`}
              className="group relative"
              style={{ animationDelay: `${index * 30}ms` }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Main avatar */}
              <img
                src={avatarSrc}
                alt={player.name}
                className="w-full aspect-square rounded-lg border border-white/10 bg-gray-800 group-hover:border-blue-500/50 transition-all animate-fade-in group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                loading="lazy"
                onError={(e) => {
                  // Ultimate fallback - SVG
                  (e.target as HTMLImageElement).src = getFallbackAvatar(isAlexSkin(uuid));
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute z-[99999] pointer-events-none"
                  style={{
                    bottom: 'calc(100% + 10px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '200px',
                    maxWidth: '240px',
                  }}
                >
                  <div className="bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in">
                    {/* Triangle */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        top: '100%',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid rgba(10,10,10,0.95)',
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                      }}
                    />

                    {/* Avatar */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={tooltipSrc}
                        alt={player.name}
                        className="w-16 h-16 rounded-xl border border-white/10 bg-gray-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackAvatar(isAlexSkin(uuid));
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{player.name}</div>
                      </div>
                    </div>

                    {/* UUID */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <Hash className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-500 font-medium">UUID:</span>
                      <span className="text-gray-300 font-mono text-[10px] truncate flex-1" title={uuid}>
                        {uuid}
                      </span>
                    </div>

                    {/* Glow */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl -z-10 blur-sm" />
                  </div>
                </div>
              )}

              {/* Name label */}
              <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-full text-[8px] text-center bg-black/80 text-white py-0.5 rounded-b-lg truncate px-0.5">
                  {player.name}
                </div>
              </div>
            </div>
          );
        })}

        {players.length > 24 && (
          <div className="flex items-center justify-center aspect-square rounded-lg border border-white/10 bg-white/[0.02] text-xs text-gray-400">
            +{players.length - 24}
          </div>
        )}
      </div>
    </div>
  );
}
