import React from 'react';
import { CharacterConfig } from '../types/game';
import { CHARACTERS } from '../game/levelsData';
import { X, Check, Lock, Coins, ShieldCheck, Zap, Wind, Sparkles } from 'lucide-react';

interface CharacterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedCharacterIds: string[];
  selectedCharacterId: string;
  coins: number;
  currentLevel: number;
  onSelectCharacter: (charId: string) => void;
  onUnlockCharacter: (char: CharacterConfig) => void;
}

export const CharacterShopModal: React.FC<CharacterShopModalProps> = ({
  isOpen,
  onClose,
  unlockedCharacterIds,
  selectedCharacterId,
  coins,
  currentLevel,
  onSelectCharacter,
  onUnlockCharacter
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-sky-400" />
              Hero Wardrobe & Roster
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch heroes anytime or recruit new champions with distinct movement perks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400 text-xs font-mono font-bold tabular-nums">
              <Coins className="w-3.5 h-3.5" />
              <span>{coins} Coins</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Character Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHARACTERS.map(char => {
            const isUnlocked = unlockedCharacterIds.includes(char.id) || currentLevel >= char.unlockedAtLevel;
            const isSelected = selectedCharacterId === char.id;
            const canAfford = coins >= char.cost;

            return (
              <div
                key={char.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500 shadow-lg shadow-sky-500/10'
                    : isUnlocked
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-900/80 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Character Avatar Preview Silhouette */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center border"
                        style={{ backgroundColor: `${char.color}22`, borderColor: `${char.color}55` }}
                      >
                        <div
                          className="w-5 h-7 rounded-sm"
                          style={{ backgroundColor: char.color }}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{char.name}</h4>
                        <span className="text-xs text-slate-400">{char.title}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{char.description}</p>

                  <div className="text-[11px] font-medium text-sky-400 bg-sky-950/30 px-2 py-1 rounded-lg border border-sky-900/40 mb-3">
                    Perk: {char.perk}
                  </div>

                  {/* Character Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-3">
                    <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <span>Speed: </span>
                      <span className="font-mono text-white">{Math.round(char.speed * 100)}%</span>
                    </div>
                    <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <span>Jump Force: </span>
                      <span className="font-mono text-white">{Math.round(char.jumpForce * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <div className="w-full py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active Runner
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onSelectCharacter(char.id)}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      Select Runner
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockCharacter(char)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-500 border border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Unlock for {char.cost} Coins</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
