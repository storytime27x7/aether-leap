import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ActionState, 
  Boss, 
  GameItem, 
  CharacterConfig, 
  ItemType 
} from './types/game';
import { 
  ALL_LEVELS, 
  CHARACTERS, 
  ITEMS_DATABASE, 
  WORLDS, 
  loadSavedGameState, 
  saveGameStateToStorage 
} from './game/levelsData';
import { GameEngine } from './game/gameEngine';
import { soundManager } from './audio/soundManager';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { InventoryModal } from './components/InventoryModal';
import { CharacterShopModal } from './components/CharacterShopModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Smartphone, Keyboard } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent Game State loaded from localStorage
  const [gameState, setGameState] = useState(() => loadSavedGameState());

  // In-Game Live HUD Metrics
  const [score, setScore] = useState(gameState.score);
  const [coins, setCoins] = useState(gameState.coins);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [progress, setProgress] = useState(0);
  const [actionState, setActionState] = useState<ActionState>('STAND');
  const [activeBoss, setActiveBoss] = useState<Boss | null>(null);
  const [hasShield, setHasShield] = useState(false);

  // Modals & Menus
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [victoryData, setVictoryData] = useState<{
    isOpen: boolean;
    levelNumber: number;
    stars: number;
    rewardCoins: number;
    rewardItem?: GameItem;
  }>({
    isOpen: false,
    levelNumber: 1,
    stars: 1,
    rewardCoins: 50
  });
  const [gameOverData, setGameOverData] = useState<{
    isOpen: boolean;
    levelNumber: number;
  }>({
    isOpen: false,
    levelNumber: 1
  });

  // UI preferences
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    return typeof window !== 'undefined' && ('ontouchstart' in window || window.innerWidth < 850);
  });

  // Get active configurations
  const currentLevelConfig = ALL_LEVELS.find(l => l.levelNumber === gameState.currentLevel) || ALL_LEVELS[0];
  const currentWorld = WORLDS.find(w => w.id === currentLevelConfig.worldId) || WORLDS[0];
  const selectedCharacter = CHARACTERS.find(c => c.id === gameState.selectedCharacterId) || CHARACTERS[0];
  const equippedHatItem = ITEMS_DATABASE.find(i => i.id === gameState.equippedHat) || null;
  const equippedWeaponItem = ITEMS_DATABASE.find(i => i.id === gameState.equippedWeapon) || null;
  const equippedCompanionItem = ITEMS_DATABASE.find(i => i.id === gameState.equippedCompanion) || null;

  // Sync sound manager settings on initial load
  useEffect(() => {
    soundManager.soundEnabled = gameState.soundEnabled;
    soundManager.musicEnabled = gameState.musicEnabled;
  }, [gameState.soundEnabled, gameState.musicEnabled]);

  // Save gameState changes to localStorage automatically
  useEffect(() => {
    saveGameStateToStorage(gameState);
  }, [gameState]);

  // Callbacks from Game Engine
  const handleScoreUpdate = useCallback((newScore: number, newCoins: number) => {
    setScore(newScore);
    setCoins(newCoins);
    setGameState(prev => ({
      ...prev,
      score: newScore,
      highScore: Math.max(prev.highScore, newScore),
      coins: newCoins
    }));
  }, []);

  const handleLivesUpdate = useCallback((newLives: number, newMaxLives: number) => {
    setLives(newLives);
    setMaxLives(newMaxLives);
  }, []);

  const handleLevelProgress = useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);

  const handleActionStateChange = useCallback((newState: ActionState) => {
    setActionState(newState);
  }, []);

  const handleBossStateChange = useCallback((boss: Boss | null) => {
    setActiveBoss(boss ? { ...boss } : null);
  }, []);

  const handleLevelComplete = useCallback((levelNumber: number, stars: number, rewardItem?: GameItem) => {
    setGameState(prev => {
      const nextLevel = Math.min(100, levelNumber + 1);
      const newInventory = rewardItem && !prev.inventory.includes(rewardItem.id)
        ? [...prev.inventory, rewardItem.id]
        : prev.inventory;

      return {
        ...prev,
        highestLevelUnlocked: Math.max(prev.highestLevelUnlocked, nextLevel),
        inventory: newInventory,
        levelStars: {
          ...prev.levelStars,
          [levelNumber]: Math.max(prev.levelStars[levelNumber] || 0, stars)
        }
      };
    });

    setVictoryData({
      isOpen: true,
      levelNumber,
      stars,
      rewardCoins: currentLevelConfig.rewardCoins,
      rewardItem
    });
  }, [currentLevelConfig.rewardCoins]);

  const handleGameOver = useCallback((levelNumber: number, finalScore: number) => {
    setGameOverData({
      isOpen: true,
      levelNumber
    });
  }, []);

  // Initialize or Re-initialize Engine when level or character changes
  const startOrResetEngine = useCallback((targetLevelNum?: number) => {
    const lvlNum = targetLevelNum ?? gameState.currentLevel;
    const lvlConfig = ALL_LEVELS.find(l => l.levelNumber === lvlNum) || ALL_LEVELS[0];

    if (canvasRef.current) {
      if (engineRef.current) {
        engineRef.current.stop();
      }

      const engine = new GameEngine(
        canvasRef.current,
        lvlConfig,
        selectedCharacter,
        {
          onScoreUpdate: handleScoreUpdate,
          onLivesUpdate: handleLivesUpdate,
          onLevelProgress: handleLevelProgress,
          onActionStateChange: handleActionStateChange,
          onBossStateChange: handleBossStateChange,
          onLevelComplete: handleLevelComplete,
          onGameOver: handleGameOver
        }
      );

      engine.setEquippedItems(equippedHatItem, equippedWeaponItem, equippedCompanionItem);
      engineRef.current = engine;
      engine.start();

      setIsPaused(false);
      setVictoryData(prev => ({ ...prev, isOpen: false }));
      setGameOverData(prev => ({ ...prev, isOpen: false }));
    }
  }, [
    gameState.currentLevel, 
    selectedCharacter, 
    equippedHatItem, 
    equippedWeaponItem, 
    equippedCompanionItem, 
    handleScoreUpdate, 
    handleLivesUpdate, 
    handleLevelProgress, 
    handleActionStateChange, 
    handleBossStateChange, 
    handleLevelComplete, 
    handleGameOver
  ]);

  // Start Odyssey button handler
  const handleStartGame = () => {
    setIsStarted(true);
    startOrResetEngine();
  };

  // Switch to specific Level
  const handleSelectLevel = (levelNumber: number) => {
    setGameState(prev => ({
      ...prev,
      currentLevel: levelNumber
    }));
    if (isStarted) {
      startOrResetEngine(levelNumber);
    }
  };

  // Next Level
  const handleNextLevel = () => {
    const nextLevel = Math.min(100, gameState.currentLevel + 1);
    setGameState(prev => ({
      ...prev,
      currentLevel: nextLevel
    }));
    startOrResetEngine(nextLevel);
  };

  // Replay Level
  const handleReplayLevel = () => {
    startOrResetEngine(gameState.currentLevel);
  };

  // Pause toggles
  const handlePause = () => {
    if (!engineRef.current || victoryData.isOpen || gameOverData.isOpen) return;
    setIsPaused(true);
    engineRef.current.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.resume();
    }
  };

  // Audio toggles
  const handleToggleSound = () => {
    setGameState(prev => {
      const nextVal = !prev.soundEnabled;
      soundManager.soundEnabled = nextVal;
      return { ...prev, soundEnabled: nextVal };
    });
  };

  const handleToggleMusic = () => {
    setGameState(prev => {
      const nextVal = !prev.musicEnabled;
      soundManager.musicEnabled = nextVal;
      if (!nextVal) {
        soundManager.stopMusic();
      } else if (isStarted && !isPaused) {
        soundManager.startMusic();
      }
      return { ...prev, musicEnabled: nextVal };
    });
  };

  // Character selection
  const handleSelectCharacter = (charId: string) => {
    setGameState(prev => ({
      ...prev,
      selectedCharacterId: charId
    }));
    const newChar = CHARACTERS.find(c => c.id === charId);
    if (newChar && engineRef.current) {
      engineRef.current.setCharacter(newChar);
    }
  };

  // Character unlocking with coins
  const handleUnlockCharacter = (char: CharacterConfig) => {
    if (gameState.coins >= char.cost) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - char.cost,
        unlockedCharacters: [...prev.unlockedCharacters, char.id],
        selectedCharacterId: char.id
      }));
      setCoins(prev => prev - char.cost);
      if (engineRef.current) {
        engineRef.current.setCharacter(char);
      }
    }
  };

  // Item equipping
  const handleEquipItem = (item: GameItem) => {
    setGameState(prev => {
      const next = { ...prev };
      if (item.type === 'CROWN' || item.type === 'HAT') {
        next.equippedHat = item.id;
      } else if (item.type === 'WEAPON') {
        next.equippedWeapon = item.id;
      } else if (item.type === 'COMPANION') {
        next.equippedCompanion = item.id;
      }
      return next;
    });

    if (engineRef.current) {
      const hat = (item.type === 'CROWN' || item.type === 'HAT') ? item : equippedHatItem;
      const weapon = item.type === 'WEAPON' ? item : equippedWeaponItem;
      const companion = item.type === 'COMPANION' ? item : equippedCompanionItem;
      engineRef.current.setEquippedItems(hat, weapon, companion);
    }
  };

  const handleUnequipItem = (type: ItemType) => {
    setGameState(prev => {
      const next = { ...prev };
      if (type === 'CROWN' || type === 'HAT') {
        next.equippedHat = null;
      } else if (type === 'WEAPON') {
        next.equippedWeapon = null;
      } else if (type === 'COMPANION') {
        next.equippedCompanion = null;
      }
      return next;
    });

    if (engineRef.current) {
      const hat = (type === 'CROWN' || type === 'HAT') ? null : equippedHatItem;
      const weapon = type === 'WEAPON' ? null : equippedWeaponItem;
      const companion = type === 'COMPANION' ? null : equippedCompanionItem;
      engineRef.current.setEquippedItems(hat, weapon, companion);
    }
  };

  // Desktop Keyboard Controls Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current || !isStarted || isPaused) return;

      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          engineRef.current.triggerJump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          engineRef.current.triggerDuck(true);
          break;
        case 'KeyZ':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          engineRef.current.triggerProne(true);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          engineRef.current.triggerMove('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          engineRef.current.triggerMove('right');
          break;
        case 'KeyX':
        case 'KeyF':
        case 'Enter':
          e.preventDefault();
          engineRef.current.triggerAttack();
          break;
        case 'Escape':
        case 'KeyP':
          e.preventDefault();
          handlePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      switch (e.code) {
        case 'ArrowDown':
        case 'KeyS':
          engineRef.current.triggerDuck(false);
          break;
        case 'KeyZ':
        case 'ShiftLeft':
        case 'ShiftRight':
          engineRef.current.triggerProne(false);
          break;
        case 'ArrowLeft':
        case 'KeyA':
        case 'ArrowRight':
        case 'KeyD':
          engineRef.current.triggerMove('stop');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isStarted, isPaused]);

  return (
    <main className="relative w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* 16:9 Canvas Game Container */}
      <div className="relative w-full h-full max-w-[1440px] max-h-[810px] flex items-center justify-center bg-black overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain block"
        />

        {/* Real-time In-Game HUD */}
        {isStarted && (
          <GameHUD
            currentLevel={gameState.currentLevel}
            worldName={currentWorld.name}
            score={score}
            coins={coins}
            lives={lives}
            maxLives={maxLives}
            progress={progress}
            actionState={actionState}
            boss={activeBoss}
            hasShield={hasShield}
            onPause={handlePause}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenShop={() => setIsShopOpen(true)}
          />
        )}

        {/* Mobile / Touch Ergonomic Controls */}
        {isStarted && showTouchControls && (
          <TouchControls
            onJump={() => engineRef.current?.triggerJump()}
            onDuck={(duck) => engineRef.current?.triggerDuck(duck)}
            onProne={(prone) => engineRef.current?.triggerProne(prone)}
            onMove={(dir) => engineRef.current?.triggerMove(dir)}
            onAttack={() => engineRef.current?.triggerAttack()}
          />
        )}

        {/* Title / Start Odyssey Screen (if not started yet) */}
        {!isStarted && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 mb-4 shadow-xl shadow-sky-500/10">
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Aether Leap
            </h1>
            <p className="text-xs sm:text-sm text-sky-400 font-semibold tracking-wider uppercase mt-1 mb-2">
              100 Realm Obstacle Odyssey
            </p>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              Navigate 100 progressive levels with high-speed jumps, crouches, floor slides, and weapon slashes across 10 biomes!
            </p>

            {/* Resume / Level Badge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 mb-6 flex items-center gap-4 text-left shadow-lg">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Current Saved State</span>
                <div className="text-sm font-bold text-white">
                  Level {gameState.currentLevel} · {currentWorld.name}
                </div>
              </div>
              <div className="h-8 w-[1px] bg-slate-800" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Coins</span>
                <div className="text-sm font-bold text-amber-400 font-mono">
                  {gameState.coins}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                onClick={handleStartGame}
                className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25 active:scale-98 transition-transform cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Resume Level {gameState.currentLevel}</span>
              </button>

              <button
                onClick={() => setIsLevelSelectOpen(true)}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
              >
                Select from 100 Realms
              </button>
            </div>

            {/* Desktop / Touch Indicator Toggle */}
            <div className="flex items-center gap-4 mt-8 text-xs text-slate-400">
              <button
                onClick={() => setShowTouchControls(!showTouchControls)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {showTouchControls ? <Smartphone className="w-4 h-4 text-sky-400" /> : <Keyboard className="w-4 h-4 text-slate-500" />}
                <span>Touch Controls: {showTouchControls ? 'Visible' : 'Hidden'}</span>
              </button>
              <span>·</span>
              <button
                onClick={handleToggleSound}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {gameState.soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Audio {gameState.soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modals & Drawers */}
        <PauseModal
          isOpen={isPaused}
          currentLevel={gameState.currentLevel}
          worldName={currentWorld.name}
          soundEnabled={gameState.soundEnabled}
          musicEnabled={gameState.musicEnabled}
          onResume={handleResume}
          onRestart={handleReplayLevel}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
        />

        <InventoryModal
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          unlockedItemIds={gameState.inventory}
          equippedHat={gameState.equippedHat}
          equippedWeapon={gameState.equippedWeapon}
          equippedCompanion={gameState.equippedCompanion}
          currentLevel={gameState.currentLevel}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
        />

        <CharacterShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          unlockedCharacterIds={gameState.unlockedCharacters}
          selectedCharacterId={gameState.selectedCharacterId}
          coins={gameState.coins}
          currentLevel={gameState.currentLevel}
          onSelectCharacter={handleSelectCharacter}
          onUnlockCharacter={handleUnlockCharacter}
        />

        <LevelSelectModal
          isOpen={isLevelSelectOpen}
          onClose={() => setIsLevelSelectOpen(false)}
          highestLevelUnlocked={gameState.highestLevelUnlocked}
          currentLevel={gameState.currentLevel}
          levelStars={gameState.levelStars}
          onSelectLevel={handleSelectLevel}
        />

        <VictoryModal
          isOpen={victoryData.isOpen}
          levelNumber={victoryData.levelNumber}
          stars={victoryData.stars}
          score={score}
          rewardCoins={victoryData.rewardCoins}
          rewardItem={victoryData.rewardItem}
          hasNextLevel={gameState.currentLevel < 100}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
          onEquipRewardItem={handleEquipItem}
        />

        <GameOverModal
          isOpen={gameOverData.isOpen}
          levelNumber={gameOverData.levelNumber}
          score={score}
          onRetry={handleReplayLevel}
          onOpenLevelSelect={() => {
            setGameOverData(prev => ({ ...prev, isOpen: false }));
            setIsLevelSelectOpen(true);
          }}
        />
      </div>
    </main>
  );
}
