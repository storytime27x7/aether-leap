import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Sword, Zap } from 'lucide-react';

interface TouchControlsProps {
  onJump: () => void;
  onDuck: (duck: boolean) => void;
  onProne: (prone: boolean) => void;
  onMove: (dir: 'left' | 'right' | 'stop') => void;
  onAttack: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onJump,
  onDuck,
  onProne,
  onMove,
  onAttack
}) => {
  return (
    <div className="absolute bottom-3 left-0 right-0 px-4 flex items-end justify-between pointer-events-none select-none z-20">
      {/* Left Control Cluster: Movement & Duck */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Left Move */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onMove('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); onMove('stop'); }}
          onMouseDown={() => onMove('left')}
          onMouseUp={() => onMove('stop')}
          className="w-13 h-13 rounded-2xl bg-slate-900/80 active:bg-sky-500/30 backdrop-blur-md border border-slate-700/80 active:border-sky-400 flex items-center justify-center text-slate-200 active:text-sky-300 shadow-xl active:scale-95 transition-transform"
          aria-label="Move Backward"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Right Move */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onMove('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); onMove('stop'); }}
          onMouseDown={() => onMove('right')}
          onMouseUp={() => onMove('stop')}
          className="w-13 h-13 rounded-2xl bg-slate-900/80 active:bg-sky-500/30 backdrop-blur-md border border-slate-700/80 active:border-sky-400 flex items-center justify-center text-slate-200 active:text-sky-300 shadow-xl active:scale-95 transition-transform"
          aria-label="Move Forward"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* Duck / Sit */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onDuck(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDuck(false); }}
          onMouseDown={() => onDuck(true)}
          onMouseUp={() => onDuck(false)}
          className="w-13 h-13 rounded-2xl bg-amber-950/70 active:bg-amber-500/40 backdrop-blur-md border border-amber-600/60 active:border-amber-400 flex flex-col items-center justify-center text-amber-200 shadow-xl active:scale-95 transition-transform"
          aria-label="Duck / Sit"
        >
          <ArrowDown className="w-5 h-5 text-amber-400" />
          <span className="text-[9px] font-bold tracking-tight uppercase">DUCK</span>
        </button>
      </div>

      {/* Right Control Cluster: Prone Slide, Attack, Jump */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Lie Down / Prone Slide */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onProne(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onProne(false); }}
          onMouseDown={() => onProne(true)}
          onMouseUp={() => onProne(false)}
          className="w-13 h-13 rounded-2xl bg-rose-950/70 active:bg-rose-500/40 backdrop-blur-md border border-rose-600/60 active:border-rose-400 flex flex-col items-center justify-center text-rose-200 shadow-xl active:scale-95 transition-transform"
          aria-label="Lie Down / Prone Slide"
        >
          <Zap className="w-5 h-5 text-rose-400" />
          <span className="text-[9px] font-bold tracking-tight uppercase">PRONE</span>
        </button>

        {/* Attack / Weapon */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onAttack(); }}
          onMouseDown={() => onAttack()}
          className="w-13 h-13 rounded-2xl bg-purple-950/70 active:bg-purple-500/40 backdrop-blur-md border border-purple-600/60 active:border-purple-400 flex flex-col items-center justify-center text-purple-200 shadow-xl active:scale-95 transition-transform"
          aria-label="Attack / Weapon"
        >
          <Sword className="w-5 h-5 text-purple-400" />
          <span className="text-[9px] font-bold tracking-tight uppercase">SLASH</span>
        </button>

        {/* Big Jump */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onJump(); }}
          onMouseDown={() => onJump()}
          className="w-16 h-16 rounded-2xl bg-gradient-to-t from-sky-600 to-sky-400 active:from-sky-700 active:to-sky-500 text-white shadow-xl shadow-sky-500/30 flex flex-col items-center justify-center active:scale-95 transition-transform border border-sky-300/40"
          aria-label="Jump / Leap"
        >
          <ArrowUp className="w-7 h-7 stroke-[2.5]" />
          <span className="text-[10px] font-extrabold tracking-wider uppercase mt-[-2px]">JUMP</span>
        </button>
      </div>
    </div>
  );
};
