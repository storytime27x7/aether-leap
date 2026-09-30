import { 
  WorldTheme, 
  CharacterConfig, 
  GameItem, 
  LevelConfig, 
  GameSaveState,
  Boss
} from '../types/game';

export const WORLDS: WorldTheme[] = [
  {
    id: 1,
    name: 'Neo-Tokyo Cyber Grid',
    subtitle: 'High-speed neon highways and pulse lasers',
    skyTop: '#090d16',
    skyBottom: '#1e1035',
    groundColor: '#0f172a',
    gridLineColor: '#06b6d4',
    accentColor: '#38bdf8',
    ambientParticle: 'neon_sparks'
  },
  {
    id: 2,
    name: 'Enchanted Twilight Canopy',
    subtitle: 'Ancient bioluminescent roots and spore hazards',
    skyTop: '#06130d',
    skyBottom: '#0e2e1d',
    groundColor: '#041d13',
    gridLineColor: '#10b981',
    accentColor: '#34d399',
    ambientParticle: 'fireflies'
  },
  {
    id: 3,
    name: 'Molten Magma Abyss',
    subtitle: 'Bubbling sulfur geysers and flying cinder orbs',
    skyTop: '#180707',
    skyBottom: '#3b0a0a',
    groundColor: '#200505',
    gridLineColor: '#f97316',
    accentColor: '#fb923c',
    ambientParticle: 'lava_embers'
  },
  {
    id: 4,
    name: 'Sunken Abyssal Atlantis',
    subtitle: 'Submerged crystalline temples and current traps',
    skyTop: '#03141f',
    skyBottom: '#0c2738',
    groundColor: '#061c28',
    gridLineColor: '#0ea5e9',
    accentColor: '#38bdf8',
    ambientParticle: 'air_bubbles'
  },
  {
    id: 5,
    name: 'Skybound Cloud Citadel',
    subtitle: 'Floating marble ruins and tempest gusts',
    skyTop: '#111827',
    skyBottom: '#1f2937',
    groundColor: '#1e293b',
    gridLineColor: '#e2e8f0',
    accentColor: '#60a5fa',
    ambientParticle: 'wind_leaves'
  },
  {
    id: 6,
    name: 'Solar Dune Pharaoh Crypt',
    subtitle: 'Golden sands, rolling monoliths, and sun traps',
    skyTop: '#1c1204',
    skyBottom: '#382305',
    groundColor: '#261802',
    gridLineColor: '#eab308',
    accentColor: '#facc15',
    ambientParticle: 'sand_dust'
  },
  {
    id: 7,
    name: 'Quantum Glitch Foundry',
    subtitle: 'Deconstructed cyberspace and spatial inverters',
    skyTop: '#130521',
    skyBottom: '#280c44',
    groundColor: '#18072b',
    gridLineColor: '#c084fc',
    accentColor: '#d8b4fe',
    ambientParticle: 'glitch_cubes'
  },
  {
    id: 8,
    name: 'Boreal Frostfang Peaks',
    subtitle: 'Razor icicles, blinding blizzards, and frozen pits',
    skyTop: '#081524',
    skyBottom: '#102842',
    groundColor: '#0c1e33',
    gridLineColor: '#93c5fd',
    accentColor: '#bfdbfe',
    ambientParticle: 'snowflakes'
  },
  {
    id: 9,
    name: 'Nether Umbra Void',
    subtitle: 'Dark matter rifts and swooping shade wraiths',
    skyTop: '#090314',
    skyBottom: '#1a052e',
    groundColor: '#110320',
    gridLineColor: '#a855f7',
    accentColor: '#c084fc',
    ambientParticle: 'void_wisps'
  },
  {
    id: 10,
    name: 'Celestial Astral Throne',
    subtitle: 'Starlight rings and the Final Sovereign Gauntlet',
    skyTop: '#0b0b1c',
    skyBottom: '#211e4f',
    groundColor: '#141233',
    gridLineColor: '#fbbf24',
    accentColor: '#fde047',
    ambientParticle: 'stardust'
  }
];

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'char_kaelen',
    name: 'Kaelen',
    title: 'The Cyber Runner',
    color: '#06b6d4',
    accentColor: '#38bdf8',
    speed: 1.0,
    jumpForce: 1.0,
    description: 'An agile metropolitan runner balanced for all hurdle types.',
    perk: 'Standard Balanced Movement · Quick Recovery',
    unlockedAtLevel: 1,
    cost: 0
  },
  {
    id: 'char_kage',
    name: 'Kage',
    title: 'Shadow Shinobi',
    color: '#a855f7',
    accentColor: '#d8b4fe',
    speed: 1.08,
    jumpForce: 1.18,
    description: 'Stealth infiltrator with superior aerial acrobatics.',
    perk: '+18% Jump Height & Double Jump Flip',
    unlockedAtLevel: 6,
    cost: 150
  },
  {
    id: 'char_aria',
    name: 'Aria',
    title: 'Valkyrie Knight',
    color: '#f59e0b',
    accentColor: '#fde68a',
    speed: 0.98,
    jumpForce: 1.02,
    description: 'Armored vanguard with a holy barrier.',
    perk: 'Deflects 1 hazard hit every level run',
    unlockedAtLevel: 14,
    cost: 350
  },
  {
    id: 'char_zephyr',
    name: 'Zephyr',
    title: 'Astro Nomad',
    color: '#10b981',
    accentColor: '#6ee7b7',
    speed: 1.12,
    jumpForce: 1.05,
    description: 'Equipped with micro-thrusters for prolonged air glide.',
    perk: '+12% Sprint Velocity & Low-Gravity Float',
    unlockedAtLevel: 26,
    cost: 600
  },
  {
    id: 'char_nyx',
    name: 'Nyx',
    title: 'Mystic Sorceress',
    color: '#ec4899',
    accentColor: '#f472b6',
    speed: 1.04,
    jumpForce: 1.1,
    description: 'Harnesses dimensional glyphs to phase past obstacles.',
    perk: 'Wider attack radius and +25% Coin Magnetic Aura',
    unlockedAtLevel: 45,
    cost: 1000
  },
  {
    id: 'char_titan',
    name: 'Titan',
    title: 'Cyber Mech Unit',
    color: '#ef4444',
    accentColor: '#f87171',
    speed: 1.0,
    jumpForce: 0.95,
    description: 'Heavy reinforced chassis capable of demolishing minor spikes.',
    perk: 'Destroys low ground spikes by sliding into them!',
    unlockedAtLevel: 70,
    cost: 2000
  }
];

export const ITEMS_DATABASE: GameItem[] = [
  // CROWNS & TAJ
  {
    id: 'crown_golden_taj',
    name: 'Imperial Golden Taj',
    type: 'CROWN',
    description: 'A radiant imperial crown forged in pure gold and crowned with emerald stars.',
    levelUnlocked: 10,
    rarity: 'Rare',
    color: '#eab308',
    iconName: 'Crown',
    bonus: '+20% Level Bonus Score'
  },
  {
    id: 'crown_ruby_sovereign',
    name: 'Ruby Sovereign Taj',
    type: 'CROWN',
    description: 'Ancient royal headdress inlaid with shimmering crimson fire-rubies.',
    levelUnlocked: 30,
    rarity: 'Epic',
    color: '#ef4444',
    iconName: 'Crown',
    bonus: '+35% Coin Value Pickups'
  },
  {
    id: 'crown_astral_diadem',
    name: 'Astral Nebula Crown',
    type: 'CROWN',
    description: 'Woven from concentrated stardust gathered in celestial orbits.',
    levelUnlocked: 60,
    rarity: 'Legendary',
    color: '#a855f7',
    iconName: 'Sparkles',
    bonus: 'Start every level with +1 Extra Shield'
  },
  {
    id: 'crown_mythic_sovereign',
    name: 'Supreme Mythic Crown of 100 Realms',
    type: 'CROWN',
    description: 'The ultimate emblem bestowed only upon conquerors of all 100 levels!',
    levelUnlocked: 100,
    rarity: 'Mythic',
    color: '#38bdf8',
    iconName: 'Trophy',
    bonus: 'Permanent 2x Multiplier on All Runs'
  },

  // HATS & HEADGEAR
  {
    id: 'hat_cyber_visor',
    name: 'Neon Cyber Visor',
    type: 'HAT',
    description: 'Tactical HUD visor projecting trajectory lines and hazard highlights.',
    levelUnlocked: 5,
    rarity: 'Common',
    color: '#06b6d4',
    iconName: 'Glasses',
    bonus: 'Highlights hazard hitboxes earlier'
  },
  {
    id: 'hat_shinobi_hood',
    name: 'Shinobi Shadow Hood',
    type: 'HAT',
    description: 'Woven midnight fabric that silences your footsteps and quickens ducks.',
    levelUnlocked: 15,
    rarity: 'Rare',
    color: '#64748b',
    iconName: 'Feather',
    bonus: 'Ducking and sliding transitions 20% faster'
  },
  {
    id: 'hat_archmage_pointed',
    name: 'Arch-Mage Stellar Hat',
    type: 'HAT',
    description: 'Constellation-patterned hat that crackles with static arc energy.',
    levelUnlocked: 35,
    rarity: 'Epic',
    color: '#6366f1',
    iconName: 'Sparkle',
    bonus: 'Weapon attacks generate lingering energy sparks'
  },
  {
    id: 'hat_spartan_crest',
    name: 'Golden Spartan Crest',
    type: 'HAT',
    description: 'Tempered bronze helmet with an imposing scarlet warrior plume.',
    levelUnlocked: 65,
    rarity: 'Legendary',
    color: '#f97316',
    iconName: 'Shield',
    bonus: 'Invulnerability frame duration increased by 50%'
  },

  // WEAPONS
  {
    id: 'weapon_plasma_dagger',
    name: 'Plasma Energy Dagger',
    type: 'WEAPON',
    description: 'Compact blade capable of slicing through barrier walls in 1 hit.',
    levelUnlocked: 3,
    rarity: 'Common',
    color: '#38bdf8',
    iconName: 'Sword',
    bonus: 'Destroys barrier obstacles and strikes bosses'
  },
  {
    id: 'weapon_shadow_katana',
    name: 'Muramasa Shadow Katana',
    type: 'WEAPON',
    description: 'Forged in shadowy steel, emitting dark cutting waves.',
    levelUnlocked: 12,
    rarity: 'Rare',
    color: '#c084fc',
    iconName: 'Crosshair',
    bonus: '+40% Attack Range & Cleaves multiple hazards'
  },
  {
    id: 'weapon_photon_blaster',
    name: 'Photon Pulse Blaster',
    type: 'WEAPON',
    description: 'Fires high-speed plasma bolts straight down the lane.',
    levelUnlocked: 28,
    rarity: 'Epic',
    color: '#f43f5e',
    iconName: 'Zap',
    bonus: 'Ranged attack destroys obstacles from a distance'
  },
  {
    id: 'weapon_thunder_hammer',
    name: 'Mjollnir Thunder Hammer',
    type: 'WEAPON',
    description: 'Smashes the ground with lightning arcs that vaporize ground traps.',
    levelUnlocked: 48,
    rarity: 'Legendary',
    color: '#eab308',
    iconName: 'Hammer',
    bonus: 'Shockwave smashes nearby ground spikes upon landing'
  },
  {
    id: 'weapon_excalibur_blade',
    name: 'Excalibur Celestial Greatsword',
    type: 'WEAPON',
    description: 'Legendary blade of kings surrounded by a radiant golden halo.',
    levelUnlocked: 75,
    rarity: 'Legendary',
    color: '#fbbf24',
    iconName: 'Flame',
    bonus: 'Deals 2x Damage to Level Bosses'
  },

  // COMPANIONS (PETS)
  {
    id: 'companion_sparky',
    name: 'Sparky (Robo-Drone)',
    type: 'COMPANION',
    description: 'A cheerful floating hover-drone that magnets nearby coins toward you.',
    levelUnlocked: 8,
    rarity: 'Rare',
    color: '#38bdf8',
    iconName: 'Bot',
    bonus: 'Automatically magnets coins within 120px range'
  },
  {
    id: 'companion_ignis',
    name: 'Ignis (Baby Fire Dragon)',
    type: 'COMPANION',
    description: 'Flaps its fiery wings alongside you and shoots fire sparks at flying bats.',
    levelUnlocked: 20,
    rarity: 'Epic',
    color: '#f97316',
    iconName: 'Flame',
    bonus: 'Auto-burns swooping flying hazards once every 8 seconds'
  },
  {
    id: 'companion_lumi',
    name: 'Lumi (Starlight Wisp)',
    type: 'COMPANION',
    description: 'A gentle glowing star sprite that shields you with a radiant aura.',
    levelUnlocked: 42,
    rarity: 'Epic',
    color: '#34d399',
    iconName: 'Sun',
    bonus: 'Absorbs 1 fatal drop pit fall per run'
  },
  {
    id: 'companion_kitsune',
    name: 'Kitsune (Cyber Fox)',
    type: 'COMPANION',
    description: 'Nine-tailed holographic fox providing fortune and swiftness.',
    levelUnlocked: 60,
    rarity: 'Legendary',
    color: '#ec4899',
    iconName: 'Cat',
    bonus: 'Multiplies all collected points by 1.5x'
  },
  {
    id: 'companion_chronos',
    name: 'Chronos (Time Sprite)',
    type: 'COMPANION',
    description: 'A celestial entity that slows down trap oscillations and flying projectiles.',
    levelUnlocked: 85,
    rarity: 'Mythic',
    color: '#eab308',
    iconName: 'Clock',
    bonus: 'Trap oscillation speed reduced by 15%'
  }
];

export const BOSS_ROSTER: Record<number, Omit<Boss, 'hp' | 'x' | 'y' | 'attackTimer' | 'currentPhase' | 'isDefeated'>> = {
  10: {
    name: 'Cyber Titan MK-X',
    title: 'Guardian of the Neo-Tokyo Grid',
    maxHp: 6,
    width: 90,
    height: 120,
    color: '#06b6d4',
    attackPattern: 'LASER_SWEEP'
  },
  20: {
    name: 'Elder Spore Treant',
    title: 'Heart of the Twilight Canopy',
    maxHp: 8,
    width: 100,
    height: 130,
    color: '#10b981',
    attackPattern: 'FIRE_BREATH'
  },
  30: {
    name: 'Magma Wyrm Ignis',
    title: 'Terror of the Molten Core',
    maxHp: 10,
    width: 110,
    height: 120,
    color: '#f97316',
    attackPattern: 'GROUND_SMASH'
  },
  40: {
    name: 'Abyssal Leviathan',
    title: 'Monarch of Sunken Atlantis',
    maxHp: 12,
    width: 110,
    height: 140,
    color: '#0ea5e9',
    attackPattern: 'LASER_SWEEP'
  },
  50: {
    name: 'Storm Griffin Zephyrus',
    title: 'Sentinel of the Cloud Citadel',
    maxHp: 14,
    width: 115,
    height: 130,
    color: '#e2e8f0',
    attackPattern: 'SUMMON_HAZARDS'
  },
  60: {
    name: 'Anubis Sun Sentinel',
    title: 'Keeper of Pharaoh Sands',
    maxHp: 16,
    width: 100,
    height: 135,
    color: '#eab308',
    attackPattern: 'GROUND_SMASH'
  },
  70: {
    name: 'Glitch Overlord Matrix',
    title: 'Anomaly of Quantum Foundry',
    maxHp: 18,
    width: 110,
    height: 120,
    color: '#c084fc',
    attackPattern: 'LASER_SWEEP'
  },
  80: {
    name: 'Frostfang Colossus',
    title: 'Titan of Boreal Frost',
    maxHp: 20,
    width: 120,
    height: 140,
    color: '#93c5fd',
    attackPattern: 'GROUND_SMASH'
  },
  90: {
    name: 'Void Shadow Devourer',
    title: 'Horror of Nether Umbra',
    maxHp: 22,
    width: 120,
    height: 145,
    color: '#a855f7',
    attackPattern: 'SUMMON_HAZARDS'
  },
  100: {
    name: 'Grand Astral Sovereign',
    title: 'Supreme Ruler of the 100 Realms',
    maxHp: 28,
    width: 130,
    height: 150,
    color: '#fbbf24',
    attackPattern: 'LASER_SWEEP'
  }
};

/**
 * Generate 100 unique levels with progressive difficulty curves.
 */
export function generateAllLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  for (let i = 1; i <= 100; i++) {
    // 10 worlds, 10 levels each
    const worldId = Math.min(10, Math.ceil(i / 10));
    const isBoss = i % 10 === 0;

    // Progressive length: starts at 3200px, climbs up to 8000px
    const baseLength = 3200 + (i * 45);
    const length = isBoss ? baseLength + 800 : baseLength;

    // Progressive speed: starts at 5.5, scales smoothly up to 9.2
    const speed = 5.4 + Math.min(3.8, (i / 100) * 3.8);

    // Progressive density: starts at 0.0035, reaches 0.009
    const obstacleDensity = 0.0035 + (i / 100) * 0.0055;

    // Find reward item matching this level
    const rewardItem = ITEMS_DATABASE.find(item => item.levelUnlocked === i);

    // Coins reward increases with level
    const rewardCoins = 50 + (i * 15);

    // Target completion time in seconds
    const targetTimeSeconds = Math.round(length / (speed * 60));

    levels.push({
      levelNumber: i,
      worldId,
      length,
      speed,
      obstacleDensity,
      hasBoss: isBoss,
      rewardItemId: rewardItem ? rewardItem.id : undefined,
      rewardCoins,
      targetTimeSeconds
    });
  }

  return levels;
}

export const ALL_LEVELS = generateAllLevels();

const STORAGE_KEY = 'aether_leap_save_v1';

export const INITIAL_SAVE_STATE: GameSaveState = {
  currentLevel: 1,
  highestLevelUnlocked: 1,
  score: 0,
  highScore: 0,
  coins: 100,
  selectedCharacterId: 'char_kaelen',
  unlockedCharacters: ['char_kaelen'],
  inventory: [],
  equippedHat: null,
  equippedWeapon: null,
  equippedCompanion: null,
  levelStars: {},
  soundEnabled: true,
  musicEnabled: true
};

export function loadSavedGameState(): GameSaveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_SAVE_STATE };

    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_SAVE_STATE,
      ...parsed,
      // Ensure validity
      currentLevel: Math.max(1, Math.min(100, parsed.currentLevel || 1)),
      highestLevelUnlocked: Math.max(1, Math.min(100, parsed.highestLevelUnlocked || 1)),
      unlockedCharacters: Array.isArray(parsed.unlockedCharacters) && parsed.unlockedCharacters.length > 0 
        ? parsed.unlockedCharacters 
        : ['char_kaelen'],
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
      levelStars: parsed.levelStars || {}
    };
  } catch {
    return { ...INITIAL_SAVE_STATE };
  }
}

export function saveGameStateToStorage(state: GameSaveState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}
