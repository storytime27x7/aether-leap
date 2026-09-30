import React from 'react';
import { RotateCcw, Compass, AlertCircle, HeartCrack } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  levelNumber: number;
  score: number;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  levelNumber,
  score,
  onRetry,
  onOpenLevelSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/70 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 text-rose-400">
          <HeartCrack className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Run Interrupted</h2>
        <p className="text-xs text-slate-400 mt-1">
          Hurdles overcame your runner on Level {levelNumber}.
        </p>

        {/* Tip Box */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 my-4 text-left text-xs text-slate-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <span className="font-semibold text-white">Pro Tip: </span>
            Low lasers need <span className="text-rose-400 font-bold">PRONE</span> slide, hanging saws require <span className="text-amber-400 font-bold">DUCK</span>, and barrier walls can be broken with <span className="text-purple-400 font-bold">SLASH</span>!
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Try Level {levelNumber} Again
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Choose Another Realm
          </button>
        </div>
      </div>
    </div>
  );
};
