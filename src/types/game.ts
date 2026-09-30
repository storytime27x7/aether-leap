export type ActionState = 'STAND' | 'RUN' | 'JUMP' | 'DUCK' | 'PRONE' | 'ATTACK';

export type ObstacleType = 
  | 'SPIKE_LOW'          // Jump over
  | 'GAP'                // Jump over
  | 'HIGH_BEAM'          // Duck under
  | 'HANGING_SAW'        // Duck under
  | 'LOW_LASER'          // Lie down / Prone slide under
  | 'SWOOPING_BAT'       // Lie down / Prone slide under
  | 'SWINGING_PENDULUM'  // Move forward/back timing
  | 'FALLING_STALACTITE' // Move forward/back dodge
  | 'BARRIER_WALL'       // Attack to break or jump high
  | 'COIN_ROW'           // Collectible
  | 'STAR_GEM'           // Collectible
  | 'HEART_PICKUP'       // Collectible
  | 'SHIELD_ORB';        // Collectible

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  speedMultiplier?: number;
  passed?: boolean;
  collected?: boolean;
  destroyed?: boolean;
  angle?: number;
  targetY?: number;
  hp?: number;
}

export interface Boss {
  name: string;
  title: string;
  maxHp: number;
  hp: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  attackTimer: number;
  currentPhase: number;
  isDefeated: boolean;
  attackPattern: 'LASER_SWEEP' | 'FIRE_BREATH' | 'SUMMON_HAZARDS' | 'GROUND_SMASH';
}

export type ItemType = 'CROWN' | 'HAT' | 'WEAPON' | 'COMPANION';

export interface GameItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  levelUnlocked: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  color: string;
  iconName: string;
  bonus: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  color: string;
  accentColor: string;
  speed: number;
  jumpForce: number;
  description: string;
  perk: string;
  unlockedAtLevel: number;
  cost: number;
}

export interface WorldTheme {
  id: number;
  name: string;
  subtitle: string;
  skyTop: string;
  skyBottom: string;
  groundColor: string;
  gridLineColor: string;
  accentColor: string;
  ambientParticle: 'neon_sparks' | 'fireflies' | 'lava_embers' | 'air_bubbles' | 'wind_leaves' | 'sand_dust' | 'glitch_cubes' | 'snowflakes' | 'void_wisps' | 'stardust';
}

export interface LevelConfig {
  levelNumber: number;
  worldId: number;
  length: number; // Distance in pixels
  speed: number; // Base scroll speed
  obstacleDensity: number;
  hasBoss: boolean;
  rewardItemId?: string;
  rewardCoins: number;
  targetTimeSeconds: number;
}

export interface GameSaveState {
  currentLevel: number;
  highestLevelUnlocked: number;
  score: number;
  highScore: number;
  coins: number;
  selectedCharacterId: string;
  unlockedCharacters: string[];
  inventory: string[];
  equippedHat: string | null;
  equippedWeapon: string | null;
  equippedCompanion: string | null;
  levelStars: Record<number, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
}
