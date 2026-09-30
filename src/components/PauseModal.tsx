import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Music, Compass, Backpack, Users, HelpCircle, X } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  currentLevel: number;
  worldName: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenLevelSelect: () => void;
  onOpenInventory: () => void;
  onOpenShop: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  currentLevel,
  worldName,
  soundEnabled,
  musicEnabled,
  onResume,
  onRestart,
  onToggleSound,
  onToggleMusic,
  onOpenLevelSelect,
  onOpenInventory,
  onOpenShop
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Game Paused</h2>
            <p className="text-xs text-slate-400">Level {currentLevel} · {worldName}</p>
          </div>
          <button
            onClick={onResume}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Resume"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Actions */}
        <div className="p-6 flex flex-col gap-3">
          {/* Resume Button */}
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-transform"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Resume Odyssey
          </button>

          {/* Restart Level */}
          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Level {currentLevel}
          </button>

          {/* Quick Hub Navigation */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={onOpenLevelSelect}
              className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 flex flex-col items-center gap-1 border border-slate-700/60"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>100 Levels</span>
            </button>

            <button
              onClick={onOpenInventory}
              className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 flex flex-col items-center gap-1 border border-slate-700/60"
            >
              <Backpack className="w-4 h-4 text-amber-400" />
              <span>Gifts/Taj</span>
            </button>

            <button
              onClick={onOpenShop}
              className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 flex flex-col items-center gap-1 border border-slate-700/60"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Heroes</span>
            </button>
          </div>

          {/* Sound & Music Controls */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onToggleSound}
              className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-900'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
              <span>SFX: {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onToggleMusic}
              className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                musicEnabled
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-900'
              }`}
            >
              <Music className={`w-4 h-4 ${musicEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Music: {musicEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Hurdle Action Guide */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-1.5 font-bold text-white text-[11px] uppercase tracking-wider mb-0.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Obstacle Action Cheat Sheet</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Low Ground Spikes & Gaps</span>
              <span className="font-semibold text-sky-400">JUMP (Up / Space)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Suspended Beams & Saws</span>
              <span className="font-semibold text-amber-400">DUCK / SIT (Down / S)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Ultra-Low Lasers & Bats</span>
              <span className="font-semibold text-rose-400">PRONE SLIDE (Z / Shift)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Swinging Pendulums</span>
              <span className="font-semibold text-emerald-400">MOVE ◄ / ►</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Forcefield Barriers & Boss</span>
              <span className="font-semibold text-purple-400">SLASH / WEAPON (X / F)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
