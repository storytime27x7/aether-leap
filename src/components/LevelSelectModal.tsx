import React, { useState } from 'react';
import { WORLDS, ALL_LEVELS } from '../game/levelsData';
import { X, Star, Lock, Skull, CheckCircle2 } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  highestLevelUnlocked: number;
  currentLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (lvl: number) => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  highestLevelUnlocked,
  currentLevel,
  levelStars,
  onSelectLevel
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(Math.min(10, Math.ceil(currentLevel / 10)));

  if (!isOpen) return null;

  const currentWorld = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];
  const levelsInWorld = ALL_LEVELS.filter(l => l.worldId === selectedWorldId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
              100 Progressive Realms
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conquer all 100 levels across 10 unique biomes with climbing hurdles and epic guardians.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World Selection Carousel */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {WORLDS.map(w => {
            const isUnlocked = highestLevelUnlocked >= (w.id - 1) * 10 + 1;
            const isSelected = selectedWorldId === w.id;

            return (
              <button
                key={w.id}
                onClick={() => setSelectedWorldId(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/60'
                    : isUnlocked
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-slate-950 text-slate-600 border border-slate-900'
                }`}
              >
                <span>W{w.id}: {w.name.split(' ')[0]}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-slate-600" />}
              </button>
            );
          })}
        </div>

        {/* Selected World Banner */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{currentWorld.name}</h3>
            <p className="text-xs text-slate-400">{currentWorld.subtitle}</p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Levels {(currentWorld.id - 1) * 10 + 1} - {currentWorld.id * 10}
          </div>
        </div>

        {/* Level Grid (10 levels per world) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {levelsInWorld.map(lvl => {
            const isUnlocked = lvl.levelNumber <= highestLevelUnlocked;
            const isCurrent = lvl.levelNumber === currentLevel;
            const stars = levelStars[lvl.levelNumber] || 0;
            const isBoss = lvl.hasBoss;

            return (
              <button
                key={lvl.levelNumber}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.levelNumber);
                    onClose();
                  }
                }}
                disabled={!isUnlocked}
                className={`h-24 rounded-2xl border p-2 flex flex-col items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/20 scale-102'
                    : isUnlocked
                    ? 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 text-white cursor-pointer hover:border-slate-600'
                    : 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full px-1">
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    #{lvl.levelNumber}
                  </span>
                  {isBoss && (
                    <span title="Boss Guardian Level">
                      <Skull className="w-3.5 h-3.5 text-rose-400" />
                    </span>
                  )}
                </div>

                <div className="text-base font-extrabold text-white">
                  {isUnlocked ? (
                    isCurrent ? (
                      <span className="text-sky-400">Active</span>
                    ) : (
                      `Lvl ${lvl.levelNumber}`
                    )
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                {/* Stars earned */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= stars 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-slate-700 fill-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
