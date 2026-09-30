import React from 'react';
import { ActionState, Boss } from '../types/game';
import { Heart, Coins, Trophy, Pause, Backpack, Users, Shield, Zap } from 'lucide-react';

interface GameHUDProps {
  currentLevel: number;
  worldName: string;
  score: number;
  coins: number;
  lives: number;
  maxLives: number;
  progress: number;
  actionState: ActionState;
  boss: Boss | null;
  hasShield: boolean;
  onPause: () => void;
  onOpenInventory: () => void;
  onOpenShop: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentLevel,
  worldName,
  score,
  coins,
  lives,
  maxLives,
  progress,
  actionState,
  boss,
  hasShield,
  onPause,
  onOpenInventory,
  onOpenShop
}) => {
  // Action status human label & color
  const actionBadges: Record<ActionState, { label: string; color: string }> = {
    STAND: { label: 'Ready', color: 'text-slate-400' },
    RUN: { label: 'Sprinting', color: 'text-emerald-400' },
    JUMP: { label: 'Airborne Leap', color: 'text-sky-400' },
    DUCK: { label: 'Ducking / Crouch', color: 'text-amber-400' },
    PRONE: { label: 'Lie Down Slide', color: 'text-rose-400' },
    ATTACK: { label: 'Weapon Strike', color: 'text-purple-400' }
  };

  const badge = actionBadges[actionState] || actionBadges.RUN;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none select-none z-20 flex flex-col gap-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Level & World Info */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                Level {currentLevel}
              </span>
              <span className="text-slate-600 text-xs">/ 100</span>
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[130px] sm:max-w-[180px]">
              {worldName}
            </span>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-700/80" />

          {/* Action Stance Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-[11px] text-slate-400">Action:</span>
            <span className={badge.color}>{badge.label}</span>
          </div>
        </div>

        {/* Center / Right: Lives, Coins, Score, Modals */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Health Hearts */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-transform duration-200 ${
                  i < lives 
                    ? 'text-rose-500 fill-rose-500 scale-100' 
                    : 'text-slate-700 fill-slate-800 scale-90'
                }`}
              />
            ))}
            {hasShield && (
              <Shield className="w-4 h-4 text-sky-400 fill-sky-400/40 ml-1 animate-pulse" />
            )}
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-amber-400 text-xs font-mono font-bold tabular-nums">
            <Coins className="w-3.5 h-3.5" />
            <span>{coins}</span>
          </div>

          {/* Score */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-slate-100 text-xs font-mono font-bold tabular-nums">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>{score.toLocaleString()}</span>
          </div>

          {/* Quick Action Navigation Buttons */}
          <button
            onClick={onOpenInventory}
            className="w-8 h-8 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Gifts & Inventory"
            aria-label="Open Inventory"
          >
            <Backpack className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={onOpenShop}
            className="w-8 h-8 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Wardrobe & Heroes"
            aria-label="Open Wardrobe"
          >
            <Users className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={onPause}
            className="w-8 h-8 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Pause Game"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Level Course Progress Tracker Bar */}
      <div className="w-full bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider pl-1">
          START
        </span>
        <div className="relative flex-1 h-2 bg-slate-800/90 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-400 transition-all duration-100 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider pr-1 font-bold">
          {boss ? 'BOSS' : 'FLAG'}
        </span>
      </div>

      {/* Mobile Action State Tag */}
      <div className="sm:hidden flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[11px] font-medium border border-slate-800">
          <span className="text-slate-400">Action: </span>
          <span className={badge.color}>{badge.label}</span>
        </div>
      </div>
    </div>
  );
};
