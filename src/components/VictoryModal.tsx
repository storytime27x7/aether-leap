import React from 'react';
import { GameItem } from '../types/game';
import { Star, Trophy, Coins, Crown, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  levelNumber: number;
  stars: number;
  score: number;
  rewardCoins: number;
  rewardItem?: GameItem;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onEquipRewardItem?: (item: GameItem) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelNumber,
  stars,
  score,
  rewardCoins,
  rewardItem,
  hasNextLevel,
  onNextLevel,
  onReplayLevel,
  onEquipRewardItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 text-center">
        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3].map(s => (
            <Star
              key={s}
              className={`w-9 h-9 transition-all transform duration-300 ${
                s <= stars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700 fill-slate-800 scale-90'
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          Level {levelNumber} Conquered!
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {stars === 3 ? 'Flawless Run! Zero Damage Taken.' : stars === 2 ? 'Great Agility! Level Mastered.' : 'Hurdles Cleared! Keep Climbing.'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Coins Earned
            </span>
            <span className="text-base font-mono font-bold text-amber-400">+{rewardCoins}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Total Score
            </span>
            <span className="text-base font-mono font-bold text-white">{score.toLocaleString()}</span>
          </div>
        </div>

        {/* Reward Gift Item Reveal */}
        {rewardItem && (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-4 rounded-2xl border border-amber-500/50 shadow-lg shadow-amber-500/10 mb-4 text-left">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Milestone Gift Unlocked!</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">{rewardItem.name}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{rewardItem.bonus}</p>
              </div>
              {onEquipRewardItem && (
                <button
                  onClick={() => onEquipRewardItem(rewardItem)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap transition-colors"
                >
                  Equip
                </button>
              )}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-transform"
            >
              <span>Advance to Level {levelNumber + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-bold">
              👑 You have conquered all 100 Realms of Aether Leap! Supreme Champion!
            </div>
          )}

          <button
            onClick={onReplayLevel}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Level {levelNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
