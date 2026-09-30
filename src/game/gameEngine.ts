import { 
  ActionState, 
  Obstacle, 
  ObstacleType, 
  Boss, 
  CharacterConfig, 
  LevelConfig, 
  WorldTheme, 
  GameItem 
} from '../types/game';
import { WORLDS, CHARACTERS, ITEMS_DATABASE, BOSS_ROSTER } from './levelsData';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, coins: number) => void;
  onLivesUpdate: (lives: number, maxLives: number) => void;
  onLevelProgress: (progress: number) => void;
  onActionStateChange: (state: ActionState) => void;
  onBossStateChange: (boss: Boss | null) => void;
  onLevelComplete: (levelNumber: number, stars: number, rewardItem?: GameItem) => void;
  onGameOver: (levelNumber: number, score: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Level & World State
  public currentLevelConfig: LevelConfig;
  public currentWorld: WorldTheme;
  public selectedCharacter: CharacterConfig;
  public equippedHat: GameItem | null = null;
  public equippedWeapon: GameItem | null = null;
  public equippedCompanion: GameItem | null = null;

  // Virtual Dimensions
  public readonly V_WIDTH = 960;
  public readonly V_HEIGHT = 540;
  public readonly GROUND_Y = 440;

  // Game Loop State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isFinished: boolean = false;

  // Player Physics
  public player = {
    x: 180,
    y: 368,
    vx: 0,
    vy: 0,
    width: 34,
    height: 72,
    baseHeight: 72,
    isGrounded: true,
    jumpCount: 0,
    maxJumps: 2,
    actionState: 'RUN' as ActionState,
    lives: 3,
    maxLives: 3,
    invincibleTimer: 0,
    shieldActive: false,
    shieldTimer: 0,
    attackTimer: 0,
    runAnimTimer: 0,
    hasAbsorbedHit: false, // Valkyrie perk
    hasAbsorbedPit: false  // Lumi perk
  };

  // Controller Inputs
  public inputs = {
    left: false,
    right: false,
    up: false,
    down: false, // Duck
    prone: false, // Lie down slide
    attack: false
  };

  // Level Progression & Scrolling
  public distanceTraveled: number = 0;
  public targetLength: number = 3200;
  public scrollSpeed: number = 5.5;
  public score: number = 0;
  public coins: number = 0;
  public levelCoinsCollected: number = 0;
  public combo: number = 1;
  public hitsTaken: number = 0;
  public levelStartTime: number = 0;

  // Obstacles, Projectiles & Boss
  public obstacles: Obstacle[] = [];
  public projectiles: Array<{ x: number; y: number; vx: number; radius: number; color: string; isBoss: boolean }> = [];
  public currentBoss: Boss | null = null;
  public inBossBattle: boolean = false;

  // Particles
  public particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
    shape?: 'circle' | 'square' | 'spark';
  }> = [];

  // Screen Shake
  public screenShakeTimer: number = 0;
  public screenShakeIntensity: number = 0;

  private callbacks: GameEngineCallbacks;

  constructor(
    canvas: HTMLCanvasElement, 
    levelConfig: LevelConfig, 
    character: CharacterConfig, 
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.currentLevelConfig = levelConfig;
    this.selectedCharacter = character;
    this.currentWorld = WORLDS.find(w => w.id === levelConfig.worldId) || WORLDS[0];
    this.callbacks = callbacks;
    this.targetLength = levelConfig.length;
    this.scrollSpeed = levelConfig.speed * character.speed;

    this.initLevel();
  }

  public setEquippedItems(hat: GameItem | null, weapon: GameItem | null, companion: GameItem | null) {
    this.equippedHat = hat;
    this.equippedWeapon = weapon;
    this.equippedCompanion = companion;
  }

  public setCharacter(character: CharacterConfig) {
    this.selectedCharacter = character;
    this.scrollSpeed = this.currentLevelConfig.speed * character.speed;
  }

  public initLevel() {
    this.distanceTraveled = 0;
    this.targetLength = this.currentLevelConfig.length;
    this.scrollSpeed = this.currentLevelConfig.speed * this.selectedCharacter.speed;
    this.isFinished = false;
    this.inBossBattle = false;
    this.hitsTaken = 0;
    this.levelCoinsCollected = 0;
    this.levelStartTime = performance.now();

    // Reset player
    this.player.x = 180;
    this.player.y = this.GROUND_Y - this.player.baseHeight;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.height = this.player.baseHeight;
    this.player.isGrounded = true;
    this.player.jumpCount = 0;
    this.player.lives = 3;
    this.player.invincibleTimer = 0;
    this.player.shieldActive = this.equippedHat?.id === 'crown_astral_diadem';
    this.player.shieldTimer = this.player.shieldActive ? 9999 : 0;
    this.player.actionState = 'RUN';
    this.player.hasAbsorbedHit = false;
    this.player.hasAbsorbedPit = false;

    this.obstacles = [];
    this.projectiles = [];
    this.particles = [];
    this.currentBoss = null;

    // Generate obstacles for this level
    this.generateObstacles();

    // Setup Boss if applicable
    if (this.currentLevelConfig.hasBoss) {
      const bossData = BOSS_ROSTER[this.currentLevelConfig.levelNumber];
      if (bossData) {
        this.currentBoss = {
          ...bossData,
          hp: bossData.maxHp,
          x: this.V_WIDTH + 100,
          y: this.GROUND_Y - bossData.height,
          attackTimer: 0,
          currentPhase: 0,
          isDefeated: false
        };
      }
    }

    // Set audio world
    soundManager.setWorldTheme(this.currentWorld.id);

    // Initial callbacks
    this.callbacks.onLivesUpdate(this.player.lives, this.player.maxLives);
    this.callbacks.onLevelProgress(0);
    this.callbacks.onActionStateChange(this.player.actionState);
    this.callbacks.onBossStateChange(this.currentBoss);
  }

  private generateObstacles() {
    const startX = 600;
    const endX = this.currentLevelConfig.hasBoss ? this.targetLength - 1200 : this.targetLength - 400;
    const density = this.currentLevelConfig.obstacleDensity;
    let currentX = startX;

    const availableTypes: ObstacleType[] = [
      'SPIKE_LOW',
      'HIGH_BEAM',
      'LOW_LASER',
      'HANGING_SAW',
      'SWOOPING_BAT',
      'SWINGING_PENDULUM',
      'BARRIER_WALL'
    ];

    // Gaps added for levels > 5
    if (this.currentLevelConfig.levelNumber > 5) {
      availableTypes.push('GAP');
    }

    while (currentX < endX) {
      // Pick random obstacle or collectible
      const roll = Math.random();

      if (roll < 0.28) {
        // Coin row
        const coinCount = 3 + Math.floor(Math.random() * 4);
        for (let c = 0; c < coinCount; c++) {
          this.obstacles.push({
            id: Math.random(),
            type: 'COIN_ROW',
            x: currentX + c * 40,
            y: this.GROUND_Y - 45 - (Math.random() > 0.5 ? 40 : 0),
            width: 24,
            height: 24
          });
        }
        currentX += coinCount * 40 + 80;
      } else if (roll < 0.35) {
        // Star Gem or Heart
        const isHeart = Math.random() < 0.3;
        this.obstacles.push({
          id: Math.random(),
          type: isHeart ? 'HEART_PICKUP' : 'STAR_GEM',
          x: currentX,
          y: this.GROUND_Y - 60 - Math.random() * 80,
          width: 28,
          height: 28
        });
        currentX += 160;
      } else if (roll < 0.42 && Math.random() < 0.25) {
        // Shield Orb
        this.obstacles.push({
          id: Math.random(),
          type: 'SHIELD_ORB',
          x: currentX,
          y: this.GROUND_Y - 80,
          width: 32,
          height: 32
        });
        currentX += 200;
      } else {
        // Hazard hurdle
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        switch (type) {
          case 'SPIKE_LOW':
            this.obstacles.push({
              id: Math.random(),
              type: 'SPIKE_LOW',
              x: currentX,
              y: this.GROUND_Y - 36,
              width: 44,
              height: 36,
              color: '#ef4444'
            });
            currentX += 300 + Math.random() * (1 / density);
            break;

          case 'GAP':
            this.obstacles.push({
              id: Math.random(),
              type: 'GAP',
              x: currentX,
              y: this.GROUND_Y,
              width: 100 + Math.min(60, this.currentLevelConfig.levelNumber * 0.8),
              height: 100
            });
            currentX += 340 + Math.random() * (1 / density);
            break;

          case 'HIGH_BEAM':
            // Suspended beam requiring DUCK / SIT
            this.obstacles.push({
              id: Math.random(),
              type: 'HIGH_BEAM',
              x: currentX,
              y: this.GROUND_Y - 95,
              width: 110,
              height: 48,
              color: '#f59e0b'
            });
            currentX += 320 + Math.random() * (1 / density);
            break;

          case 'HANGING_SAW':
            // Rotating saw hanging at mid-height (requires DUCK)
            this.obstacles.push({
              id: Math.random(),
              type: 'HANGING_SAW',
              x: currentX,
              y: this.GROUND_Y - 90,
              width: 52,
              height: 52,
              angle: 0,
              color: '#cbd5e1'
            });
            currentX += 310 + Math.random() * (1 / density);
            break;

          case 'LOW_LASER':
            // Ultra-low red laser traversing at y: GROUND_Y - 28 (requires LIE DOWN / PRONE SLIDE)
            this.obstacles.push({
              id: Math.random(),
              type: 'LOW_LASER',
              x: currentX,
              y: this.GROUND_Y - 32,
              width: 120,
              height: 16,
              color: '#f43f5e'
            });
            currentX += 340 + Math.random() * (1 / density);
            break;

          case 'SWOOPING_BAT':
            // Swooping shadow creature hovering low (requires PRONE SLIDE)
            this.obstacles.push({
              id: Math.random(),
              type: 'SWOOPING_BAT',
              x: currentX,
              y: this.GROUND_Y - 36,
              targetY: this.GROUND_Y - 36,
              width: 48,
              height: 32,
              color: '#a855f7'
            });
            currentX += 330 + Math.random() * (1 / density);
            break;

          case 'SWINGING_PENDULUM':
            // Pendulum trap requiring Move Forward / Backward speed management
            this.obstacles.push({
              id: Math.random(),
              type: 'SWINGING_PENDULUM',
              x: currentX,
              y: 120,
              width: 36,
              height: 220,
              angle: 0,
              color: '#64748b'
            });
            currentX += 360 + Math.random() * (1 / density);
            break;

          case 'BARRIER_WALL':
            // Destructible forcefield wall (can attack to shatter)
            this.obstacles.push({
              id: Math.random(),
              type: 'BARRIER_WALL',
              x: currentX,
              y: this.GROUND_Y - 75,
              width: 36,
              height: 75,
              hp: 1,
              color: '#38bdf8'
            });
            currentX += 300 + Math.random() * (1 / density);
            break;

          default:
            currentX += 300;
        }
      }
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.startMusic();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    soundManager.stopMusic();
  }

  public pause() {
    this.isPaused = true;
    soundManager.stopMusic();
  }

  public resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundManager.startMusic();
    this.loop(this.lastTime);
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning || this.isPaused) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Action trigger methods from keyboard or touch controls
   */
  public triggerJump() {
    if (this.player.jumpCount < this.player.maxJumps) {
      const isSecond = this.player.jumpCount === 1;
      const jumpPower = 14.2 * this.selectedCharacter.jumpForce * (isSecond ? 0.92 : 1.0);

      this.player.vy = -jumpPower;
      this.player.isGrounded = false;
      this.player.jumpCount++;

      if (isSecond) {
        soundManager.playDoubleJump();
        // Emit somersault sparks
        this.emitParticles(this.player.x + 17, this.player.y + 36, 12, '#38bdf8', 'spark');
      } else {
        soundManager.playJump();
        // Ground jump dust
        this.emitParticles(this.player.x + 17, this.GROUND_Y, 8, '#94a3b8', 'circle');
      }
    }
  }

  public triggerDuck(isDucking: boolean) {
    this.inputs.down = isDucking;
    if (isDucking && this.player.isGrounded && this.player.actionState !== 'PRONE') {
      soundManager.playDuck();
    }
  }

  public triggerProne(isProne: boolean) {
    this.inputs.prone = isProne;
    if (isProne && this.player.isGrounded) {
      soundManager.playProneSlide();
      // Sparks on slide start
      this.emitParticles(this.player.x + 10, this.GROUND_Y, 6, '#fbbf24', 'spark');
    }
  }

  public triggerMove(direction: 'left' | 'right' | 'stop') {
    if (direction === 'left') {
      this.inputs.left = true;
      this.inputs.right = false;
    } else if (direction === 'right') {
      this.inputs.right = true;
      this.inputs.left = false;
    } else {
      this.inputs.left = false;
      this.inputs.right = false;
    }
  }

  public triggerAttack() {
    if (this.player.attackTimer > 0) return;
    this.player.attackTimer = 0.32; // cooldown
    soundManager.playAttack();

    // Weapon slash particle arc
    const arcColor = this.equippedWeapon ? this.equippedWeapon.color : '#38bdf8';
    this.emitParticles(this.player.x + 45, this.player.y + 25, 10, arcColor, 'spark');

    // Ranged Blaster Projectile if Photon Blaster equipped
    if (this.equippedWeapon?.id === 'weapon_photon_blaster') {
      this.projectiles.push({
        x: this.player.x + 40,
        y: this.player.y + 25,
        vx: 14,
        radius: 8,
        color: '#f43f5e',
        isBoss: false
      });
    }

    // Check hit on near obstacles (e.g. Barrier walls)
    const attackRange = this.equippedWeapon?.id === 'weapon_shadow_katana' ? 110 : 80;
    this.obstacles.forEach(obs => {
      if (obs.type === 'BARRIER_WALL' && !obs.destroyed) {
        const dist = obs.x - this.player.x;
        if (dist > -20 && dist < attackRange) {
          obs.destroyed = true;
          this.score += 250;
          this.emitParticles(obs.x + 16, obs.y + 36, 18, '#38bdf8', 'square');
        }
      }
    });

    // Damage Boss if near
    if (this.inBossBattle && this.currentBoss && !this.currentBoss.isDefeated) {
      const bossDist = this.currentBoss.x - this.player.x;
      if (bossDist > -30 && bossDist < attackRange + 30) {
        const damage = this.equippedWeapon?.id === 'weapon_excalibur_blade' ? 2 : 1;
        this.currentBoss.hp = Math.max(0, this.currentBoss.hp - damage);
        soundManager.playBossHit();
        this.emitParticles(this.currentBoss.x + 40, this.currentBoss.y + 60, 24, '#fbbf24', 'spark');
        this.triggerScreenShake(6, 0.25);

        if (this.currentBoss.hp <= 0) {
          this.currentBoss.isDefeated = true;
          this.handleBossDefeated();
        }
        this.callbacks.onBossStateChange(this.currentBoss);
      }
    }
  }

  private handleBossDefeated() {
    this.score += 5000;
    this.coins += 200;
    this.callbacks.onScoreUpdate(this.score, this.coins);
    soundManager.playVictory();
    this.triggerScreenShake(12, 0.6);

    // Big explosion of stars and confetti
    for (let i = 0; i < 60; i++) {
      this.emitParticles(
        this.currentBoss!.x + Math.random() * this.currentBoss!.width,
        this.currentBoss!.y + Math.random() * this.currentBoss!.height,
        1,
        ['#fbbf24', '#f59e0b', '#38bdf8', '#a855f7'][Math.floor(Math.random() * 4)],
        'spark'
      );
    }

    setTimeout(() => {
      this.finishLevel();
    }, 1500);
  }

  private update(dt: number) {
    if (this.isFinished) return;

    // Advance Level Distance & Boss Arrival
    if (!this.inBossBattle) {
      this.distanceTraveled += this.scrollSpeed;
      const progress = Math.min(1.0, this.distanceTraveled / this.targetLength);
      this.callbacks.onLevelProgress(progress);

      // Check if Boss appears
      if (this.currentLevelConfig.hasBoss && this.currentBoss && progress >= 0.88) {
        this.inBossBattle = true;
        this.currentBoss.x = this.V_WIDTH - 200;
        this.callbacks.onBossStateChange(this.currentBoss);
      } else if (progress >= 1.0 && !this.currentLevelConfig.hasBoss) {
        this.finishLevel();
        return;
      }
    }

    // Update screen shake
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
    }

    // Update attack cooldown
    if (this.player.attackTimer > 0) {
      this.player.attackTimer -= dt;
    }

    // Update invulnerability
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer -= dt;
    }

    // Update shield timer
    if (this.player.shieldTimer > 0 && this.player.shieldTimer < 999) {
      this.player.shieldTimer -= dt;
      if (this.player.shieldTimer <= 0) {
        this.player.shieldActive = false;
      }
    }

    // Update Player Horizontal Movement
    const moveSpeed = 6.2 * this.selectedCharacter.speed;
    if (this.inputs.left) {
      this.player.x = Math.max(60, this.player.x - moveSpeed);
    }
    if (this.inputs.right) {
      this.player.x = Math.min(420, this.player.x + moveSpeed);
    }

    // Action State Logic: PRONE vs DUCK vs JUMP vs RUN
    if (!this.player.isGrounded) {
      this.player.actionState = 'JUMP';
      this.player.height = 54;
    } else if (this.inputs.prone) {
      // LIE DOWN / PRONE SLIDE: Height = 18px (flat on ground!)
      this.player.actionState = 'PRONE';
      this.player.height = 18;
      // Emit slide sparks continuously
      if (Math.random() < 0.4) {
        this.emitParticles(this.player.x + 5, this.GROUND_Y - 2, 2, '#fbbf24', 'spark');
      }
    } else if (this.inputs.down) {
      // DUCK / SIT / CROUCH: Height = 38px
      this.player.actionState = 'DUCK';
      this.player.height = 38;
    } else if (this.player.attackTimer > 0.15) {
      this.player.actionState = 'ATTACK';
      this.player.height = this.player.baseHeight;
    } else {
      this.player.actionState = 'RUN';
      this.player.height = this.player.baseHeight;
    }
    this.callbacks.onActionStateChange(this.player.actionState);

    // Gravity & Vertical Physics
    if (!this.player.isGrounded) {
      this.player.vy += 0.65; // gravity
      this.player.y += this.player.vy;

      if (this.player.y + this.player.height >= this.GROUND_Y) {
        this.player.y = this.GROUND_Y - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.jumpCount = 0;
        // Landing dust
        this.emitParticles(this.player.x + 17, this.GROUND_Y, 5, '#94a3b8', 'circle');
      }
    } else {
      this.player.y = this.GROUND_Y - this.player.height;
    }

    // Companion Auto-Perk (Sparky magnet, Ignis fire, etc.)
    this.updateCompanionPerks(dt);

    // Update Obstacles position & collision
    this.updateObstacles(dt);

    // Update Boss actions
    if (this.inBossBattle && this.currentBoss && !this.currentBoss.isDefeated) {
      this.updateBoss(dt);
    }

    // Update Projectiles
    this.updateProjectiles();

    // Update Particles
    this.updateParticles(dt);

    // Passive score accumulation while running
    this.score += Math.round(this.scrollSpeed * 0.12 * this.combo);
    this.callbacks.onScoreUpdate(this.score, this.coins);
  }

  private updateCompanionPerks(dt: number) {
    if (!this.equippedCompanion) return;

    // Sparky Robo-Drone: Magnets coins in 140px range
    if (this.equippedCompanion.id === 'companion_sparky') {
      this.obstacles.forEach(obs => {
        if (obs.type === 'COIN_ROW' && !obs.collected) {
          const dx = this.player.x - obs.x;
          const dy = this.player.y - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            obs.x += (this.player.x - obs.x) * 0.12;
            obs.y += (this.player.y - obs.y) * 0.12;
          }
        }
      });
    }

    // Ignis Fire Dragon: Shoots flying bats automatically
    if (this.equippedCompanion.id === 'companion_ignis') {
      const bat = this.obstacles.find(o => o.type === 'SWOOPING_BAT' && !o.destroyed && o.x > this.player.x && o.x < this.player.x + 280);
      if (bat && Math.random() < 0.05) {
        this.projectiles.push({
          x: this.player.x + 20,
          y: this.player.y - 15,
          vx: 12,
          radius: 6,
          color: '#f97316',
          isBoss: false
        });
      }
    }
  }

  private updateObstacles(dt: number) {
    // Player Hitbox
    const px = this.player.x + 4;
    const py = this.player.y;
    const pw = this.player.width - 8;
    const ph = this.player.height;

    // Titan Mech perk: Destroys low spikes when sliding
    const canDemolishSpikes = this.selectedCharacter.id === 'char_titan' && this.player.actionState === 'PRONE';

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Scroll with world unless in fixed boss arena
      if (!this.inBossBattle) {
        obs.x -= this.scrollSpeed;
      }

      // Check offscreen cleanup
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
        continue;
      }

      // Dynamic Trap Motions
      if (obs.type === 'HANGING_SAW') {
        obs.angle = (obs.angle || 0) + 0.12;
      } else if (obs.type === 'SWINGING_PENDULUM') {
        obs.angle = Math.sin(performance.now() * 0.003) * 0.8;
      } else if (obs.type === 'SWOOPING_BAT') {
        obs.y += Math.sin(performance.now() * 0.006) * 1.5;
      }

      // Collision Detection with Player
      let isColliding = false;

      if (obs.type === 'GAP') {
        // Gap is a pitfall. Player falls in if grounded and completely inside gap width!
        if (this.player.isGrounded && this.player.x + 10 > obs.x && this.player.x + this.player.width - 10 < obs.x + obs.width) {
          isColliding = true;
        }
      } else if (obs.type === 'SWINGING_PENDULUM') {
        // Pendulum bob collision
        const bobX = obs.x + Math.sin(obs.angle || 0) * 180;
        const bobY = obs.y + Math.cos(obs.angle || 0) * 180;
        const dist = Math.hypot(bobX - (px + pw / 2), bobY - (py + ph / 2));
        if (dist < 32) {
          isColliding = true;
        }
      } else {
        // AABB Box overlap
        isColliding = (
          px < obs.x + obs.width &&
          px + pw > obs.x &&
          py < obs.y + obs.height &&
          py + ph > obs.y
        );
      }

      if (isColliding) {
        // Collectibles
        if (obs.type === 'COIN_ROW' && !obs.collected) {
          obs.collected = true;
          this.coins += 10;
          this.levelCoinsCollected++;
          this.score += 100 * this.combo;
          soundManager.playCoin();
          this.emitParticles(obs.x + 12, obs.y + 12, 6, '#fbbf24', 'circle');
          this.obstacles.splice(i, 1);
          continue;
        } else if (obs.type === 'STAR_GEM' && !obs.collected) {
          obs.collected = true;
          this.score += 1000;
          this.combo = Math.min(5, this.combo + 1);
          soundManager.playCoin();
          this.emitParticles(obs.x + 14, obs.y + 14, 14, '#38bdf8', 'spark');
          this.obstacles.splice(i, 1);
          continue;
        } else if (obs.type === 'HEART_PICKUP' && !obs.collected) {
          obs.collected = true;
          this.player.lives = Math.min(this.player.maxLives, this.player.lives + 1);
          this.callbacks.onLivesUpdate(this.player.lives, this.player.maxLives);
          soundManager.playCoin();
          this.emitParticles(obs.x + 14, obs.y + 14, 12, '#ec4899', 'circle');
          this.obstacles.splice(i, 1);
          continue;
        } else if (obs.type === 'SHIELD_ORB' && !obs.collected) {
          obs.collected = true;
          this.player.shieldActive = true;
          this.player.shieldTimer = 7.0; // 7 seconds invulnerability
          soundManager.playCoin();
          this.emitParticles(obs.x + 16, obs.y + 16, 16, '#60a5fa', 'spark');
          this.obstacles.splice(i, 1);
          continue;
        }

        // Titan Mech demolishing spikes
        if (canDemolishSpikes && obs.type === 'SPIKE_LOW') {
          obs.destroyed = true;
          this.score += 150;
          this.emitParticles(obs.x + 20, obs.y + 18, 12, '#f97316', 'spark');
          this.obstacles.splice(i, 1);
          continue;
        }

        // Barrier Wall destroyed by attack
        if (obs.type === 'BARRIER_WALL' && obs.destroyed) {
          continue;
        }

        // HAZARD HIT ON PLAYER!
        this.handlePlayerHit(obs);
      }
    }
  }

  private handlePlayerHit(obs?: Obstacle) {
    if (this.player.invincibleTimer > 0) return;

    // Shield check
    if (this.player.shieldActive) {
      this.player.shieldActive = false;
      this.player.invincibleTimer = 1.2;
      soundManager.playHit();
      this.triggerScreenShake(5, 0.2);
      this.emitParticles(this.player.x + 17, this.player.y + 36, 16, '#60a5fa', 'spark');
      return;
    }

    // Valkyrie Knight Perk: Absorbs 1 hit per level
    if (this.selectedCharacter.id === 'char_aria' && !this.player.hasAbsorbedHit) {
      this.player.hasAbsorbedHit = true;
      this.player.invincibleTimer = 1.4;
      soundManager.playHit();
      this.triggerScreenShake(4, 0.18);
      this.emitParticles(this.player.x + 17, this.player.y + 36, 20, '#f59e0b', 'spark');
      return;
    }

    // Lumi Starlight Wisp: Absorbs 1 pit fall
    if (obs?.type === 'GAP' && this.equippedCompanion?.id === 'companion_lumi' && !this.player.hasAbsorbedPit) {
      this.player.hasAbsorbedPit = true;
      this.player.vy = -13; // Spring bounce out of pit!
      this.player.isGrounded = false;
      this.player.invincibleTimer = 1.5;
      soundManager.playDoubleJump();
      this.emitParticles(this.player.x + 17, this.GROUND_Y, 20, '#34d399', 'spark');
      return;
    }

    // Standard Hit
    this.player.lives--;
    this.hitsTaken++;
    this.combo = 1;
    this.player.invincibleTimer = 1.5; // invulnerability frames
    soundManager.playHit();
    this.triggerScreenShake(8, 0.3);
    this.emitParticles(this.player.x + 17, this.player.y + 36, 20, '#ef4444', 'spark');

    this.callbacks.onLivesUpdate(this.player.lives, this.player.maxLives);

    if (this.player.lives <= 0) {
      this.handleGameOver();
    }
  }

  private updateBoss(dt: number) {
    if (!this.currentBoss) return;
    this.currentBoss.attackTimer += dt;

    // Boss float animation
    this.currentBoss.y = this.GROUND_Y - this.currentBoss.height + Math.sin(performance.now() * 0.003) * 12;

    // Attack cycle every 3.2 seconds
    if (this.currentBoss.attackTimer > 3.2) {
      this.currentBoss.attackTimer = 0;
      this.currentBoss.currentPhase = (this.currentBoss.currentPhase + 1) % 3;

      if (this.currentBoss.currentPhase === 0) {
        // High projectile beam (requires DUCK)
        this.projectiles.push({
          x: this.currentBoss.x - 20,
          y: this.GROUND_Y - 80,
          vx: -9,
          radius: 14,
          color: this.currentBoss.color,
          isBoss: true
        });
      } else if (this.currentBoss.currentPhase === 1) {
        // Low ground wave (requires JUMP)
        this.projectiles.push({
          x: this.currentBoss.x - 20,
          y: this.GROUND_Y - 20,
          vx: -8,
          radius: 18,
          color: '#f97316',
          isBoss: true
        });
      } else {
        // Sweeping mid-height laser (requires PRONE SLIDE)
        this.projectiles.push({
          x: this.currentBoss.x - 20,
          y: this.GROUND_Y - 42,
          vx: -11,
          radius: 12,
          color: '#ec4899',
          isBoss: true
        });
      }
    }
  }

  private updateProjectiles() {
    const px = this.player.x;
    const py = this.player.y;
    const pw = this.player.width;
    const ph = this.player.height;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;

      // Check collision with player
      if (p.isBoss) {
        const dist = Math.hypot(p.x - (px + pw / 2), p.y - (py + ph / 2));
        if (dist < p.radius + 16) {
          this.handlePlayerHit();
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Player projectile hitting boss
        if (this.inBossBattle && this.currentBoss && !this.currentBoss.isDefeated) {
          const bossDist = Math.hypot(p.x - (this.currentBoss.x + 40), p.y - (this.currentBoss.y + 60));
          if (bossDist < 60) {
            this.currentBoss.hp = Math.max(0, this.currentBoss.hp - 1);
            soundManager.playBossHit();
            this.emitParticles(p.x, p.y, 10, p.color, 'spark');
            this.projectiles.splice(i, 1);

            if (this.currentBoss.hp <= 0) {
              this.currentBoss.isDefeated = true;
              this.handleBossDefeated();
            }
            this.callbacks.onBossStateChange(this.currentBoss);
            continue;
          }
        }
      }

      // Cleanup
      if (p.x < -100 || p.x > this.V_WIDTH + 100) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life += dt;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public emitParticles(x: number, y: number, count: number, color: string, shape: 'circle' | 'square' | 'spark' = 'circle') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (shape === 'circle' ? 1.5 : 0),
        size: 3 + Math.random() * 5,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.45,
        shape
      });
    }
  }

  public triggerScreenShake(intensity: number, duration: number) {
    this.screenShakeIntensity = intensity;
    this.screenShakeTimer = duration;
  }

  private finishLevel() {
    this.isFinished = true;
    soundManager.playVictory();

    // Calculate stars: 3 = 0 hits taken, 2 = 1-2 hits taken, 1 = completed
    let stars = 1;
    if (this.hitsTaken === 0) {
      stars = 3;
    } else if (this.hitsTaken <= 2) {
      stars = 2;
    }

    // Level completion bonus
    this.coins += this.currentLevelConfig.rewardCoins;
    this.score += 2000 * stars;
    this.callbacks.onScoreUpdate(this.score, this.coins);

    // Reward Item if any
    let rewardItem: GameItem | undefined;
    if (this.currentLevelConfig.rewardItemId) {
      rewardItem = ITEMS_DATABASE.find(item => item.id === this.currentLevelConfig.rewardItemId);
    }

    this.callbacks.onLevelComplete(this.currentLevelConfig.levelNumber, stars, rewardItem);
  }

  private handleGameOver() {
    this.isFinished = true;
    this.callbacks.onGameOver(this.currentLevelConfig.levelNumber, this.score);
  }

  /**
   * High-Performance Canvas Rendering
   */
  private render() {
    const ctx = this.ctx;
    const w = this.V_WIDTH;
    const h = this.V_HEIGHT;

    // Apply Screen Shake
    ctx.save();
    if (this.screenShakeTimer > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.GROUND_Y);
    skyGrad.addColorStop(0, this.currentWorld.skyTop);
    skyGrad.addColorStop(1, this.currentWorld.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Parallax Background Layer: Distant Horizons & Skylines
    this.renderParallaxBackground(ctx);

    // 3. Ground Plane with 2.5D Perspective Grid & Vanishing Lines
    this.renderGroundGrid(ctx);

    // 4. Render Obstacles
    this.renderObstacles(ctx);

    // 5. Render Projectiles
    this.renderProjectiles(ctx);

    // 6. Render Boss
    if (this.currentBoss) {
      this.renderBoss(ctx);
    }

    // 7. Render Player & Equipped Items
    this.renderPlayer(ctx);

    // 8. Render Companion Pet
    if (this.equippedCompanion) {
      this.renderCompanion(ctx);
    }

    // 9. Render Particles
    this.renderParticles(ctx);

    ctx.restore();
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D) {
    const dist = this.distanceTraveled;
    const theme = this.currentWorld;

    // Distant mountain or skyline silhouette (Layer 1 - slow scroll)
    const p1Offset = (dist * 0.15) % 400;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, this.GROUND_Y);
    for (let x = -400; x <= this.V_WIDTH + 400; x += 100) {
      const peakHeight = Math.sin((x + p1Offset) * 0.015) * 80 + 130;
      ctx.lineTo(x - p1Offset, this.GROUND_Y - peakHeight);
    }
    ctx.lineTo(this.V_WIDTH, this.GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Midground structures (Layer 2 - medium scroll)
    const p2Offset = (dist * 0.4) % 300;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    for (let x = -300; x < this.V_WIDTH + 300; x += 150) {
      const blockX = x - p2Offset;
      const blockW = 60;
      const blockH = 140 + Math.abs(Math.sin(x) * 90);
      ctx.fillRect(blockX, this.GROUND_Y - blockH, blockW, blockH);

      // Cyber or world accent glow on midground structures
      ctx.fillStyle = theme.accentColor + '22';
      ctx.fillRect(blockX + 8, this.GROUND_Y - blockH + 12, 14, 20);
      ctx.fillRect(blockX + 8, this.GROUND_Y - blockH + 40, 14, 20);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    }

    // Ambient floating sparks/particles in background
    ctx.fillStyle = theme.accentColor + '88';
    for (let i = 0; i < 20; i++) {
      const px = ((i * 53 + dist * 0.2) % this.V_WIDTH);
      const py = 60 + ((i * 41) % (this.GROUND_Y - 120));
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderGroundGrid(ctx: CanvasRenderingContext2D) {
    const gy = this.GROUND_Y;
    const gh = this.V_HEIGHT - gy;
    const theme = this.currentWorld;

    // Ground Base
    ctx.fillStyle = theme.groundColor;
    ctx.fillRect(0, gy, this.V_WIDTH, gh);

    // Glowing Top Border of Ground
    ctx.strokeStyle = theme.gridLineColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = theme.gridLineColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(this.V_WIDTH, gy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2.5D Perspective Grid Lines
    const gridOffset = (this.distanceTraveled * 1.5) % 40;
    ctx.strokeStyle = theme.gridLineColor + '44';
    ctx.lineWidth = 1.5;

    // Vertical running lines (moving towards screen)
    for (let x = -40; x < this.V_WIDTH + 80; x += 40) {
      const lineX = x - gridOffset;
      ctx.beginPath();
      ctx.moveTo(lineX, gy);
      ctx.lineTo(lineX - 30, this.V_HEIGHT);
      ctx.stroke();
    }

    // Horizontal depth lines
    for (let y = gy + 15; y < this.V_HEIGHT; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.V_WIDTH, y);
      ctx.stroke();
    }
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    for (const obs of this.obstacles) {
      if (obs.x + obs.width < -50 || obs.x > this.V_WIDTH + 50) continue;

      ctx.save();

      switch (obs.type) {
        case 'SPIKE_LOW': {
          // Low ground spikes (requires JUMP)
          ctx.fillStyle = obs.color || '#ef4444';
          ctx.beginPath();
          const toothCount = 3;
          const toothW = obs.width / toothCount;
          for (let t = 0; t < toothCount; t++) {
            const tx = obs.x + t * toothW;
            ctx.moveTo(tx, obs.y + obs.height);
            ctx.lineTo(tx + toothW / 2, obs.y);
            ctx.lineTo(tx + toothW, obs.y + obs.height);
          }
          ctx.fill();

          // Spike metallic sheen
          ctx.strokeStyle = '#fee2e2';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          break;
        }

        case 'GAP': {
          // Pit gap in ground (requires JUMP)
          ctx.fillStyle = '#020617';
          ctx.fillRect(obs.x, this.GROUND_Y, obs.width, this.V_HEIGHT - this.GROUND_Y);
          
          // Gap edges
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obs.x, this.GROUND_Y);
          ctx.lineTo(obs.x, this.GROUND_Y + 40);
          ctx.moveTo(obs.x + obs.width, this.GROUND_Y);
          ctx.lineTo(obs.x + obs.width, this.GROUND_Y + 40);
          ctx.stroke();
          break;
        }

        case 'HIGH_BEAM': {
          // Suspended barrier requiring DUCK / SIT
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Hazard caution stripes
          ctx.fillStyle = '#1e293b';
          for (let s = 0; s < obs.width; s += 20) {
            ctx.beginPath();
            ctx.moveTo(obs.x + s, obs.y);
            ctx.lineTo(obs.x + s + 10, obs.y);
            ctx.lineTo(obs.x + s - 10, obs.y + obs.height);
            ctx.lineTo(obs.x + s - 20, obs.y + obs.height);
            ctx.fill();
          }

          // Ceiling support cable
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obs.x + 10, 0);
          ctx.lineTo(obs.x + 10, obs.y);
          ctx.moveTo(obs.x + obs.width - 10, 0);
          ctx.lineTo(obs.x + obs.width - 10, obs.y);
          ctx.stroke();
          break;
        }

        case 'HANGING_SAW': {
          // Rotating buzz saw requiring DUCK
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2;
          const radius = obs.width / 2;

          // Hanging rod
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, 0);
          ctx.lineTo(cx, cy);
          ctx.stroke();

          // Spiked circular blade
          ctx.translate(cx, cy);
          ctx.rotate(obs.angle || 0);

          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          const blades = 8;
          for (let b = 0; b < blades; b++) {
            const a1 = (b / blades) * Math.PI * 2;
            const a2 = ((b + 0.5) / blades) * Math.PI * 2;
            ctx.lineTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
            ctx.lineTo(Math.cos(a2) * (radius * 0.7), Math.sin(a2) * (radius * 0.7));
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'LOW_LASER': {
          // Ultra-low red laser traversing close to floor (requires PRONE SLIDE)
          const emitterW = 16;
          // Left emitter
          ctx.fillStyle = '#334155';
          ctx.fillRect(obs.x, obs.y - 12, emitterW, 26);
          // Laser beam
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 12;
          ctx.fillRect(obs.x + emitterW, obs.y, obs.width - emitterW * 2, 8);
          // Right emitter
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#334155';
          ctx.fillRect(obs.x + obs.width - emitterW, obs.y - 12, emitterW, 26);
          break;
        }

        case 'SWOOPING_BAT': {
          // Swooping shadow creature requiring PRONE SLIDE
          ctx.fillStyle = obs.color || '#a855f7';
          ctx.beginPath();
          const bx = obs.x + obs.width / 2;
          const by = obs.y + obs.height / 2;
          ctx.arc(bx, by, 12, 0, Math.PI * 2);
          // Wings
          const wingSpread = Math.sin(performance.now() * 0.015) * 14;
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - 22, by - wingSpread);
          ctx.lineTo(bx - 10, by + 4);
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + 22, by - wingSpread);
          ctx.lineTo(bx + 10, by + 4);
          ctx.fill();
          // Eyes
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(bx - 6, by - 3, 3, 3);
          ctx.fillRect(bx + 3, by - 3, 3, 3);
          break;
        }

        case 'SWINGING_PENDULUM': {
          // Pendulum with weight
          const px = obs.x;
          const py = obs.y;
          const angle = obs.angle || 0;
          const bobX = px + Math.sin(angle) * 180;
          const bobY = py + Math.cos(angle) * 180;

          // Rope
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(bobX, bobY);
          ctx.stroke();

          // Spiked Mace Bob
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        case 'BARRIER_WALL': {
          // Destructible forcefield wall (requires ATTACK)
          if (!obs.destroyed) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

            // Forcefield grid scanlines
            ctx.beginPath();
            for (let y = obs.y + 12; y < obs.y + obs.height; y += 14) {
              ctx.moveTo(obs.x, y);
              ctx.lineTo(obs.x + obs.width, y);
            }
            ctx.stroke();
          }
          break;
        }

        case 'COIN_ROW': {
          // Gold coin with spinning shine
          if (!obs.collected) {
            const cx = obs.x + obs.width / 2;
            const cy = obs.y + obs.height / 2;
            const r = obs.width / 2;

            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Dollar or star shine inside
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(cx - 2, cy - 6, 4, 12);
          }
          break;
        }

        case 'STAR_GEM': {
          // Shimmering star diamond
          if (!obs.collected) {
            const cx = obs.x + obs.width / 2;
            const cy = obs.y + obs.height / 2;
            const r = obs.width / 2;

            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r, cy);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'HEART_PICKUP': {
          // Heart health restore
          if (!obs.collected) {
            const cx = obs.x + obs.width / 2;
            const cy = obs.y + obs.height / 2;
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx - 5, cy - 3, 7, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy - 3, 7, 0, Math.PI * 2);
            ctx.moveTo(cx - 12, cy - 2);
            ctx.lineTo(cx, cy + 12);
            ctx.lineTo(cx + 12, cy - 2);
            ctx.fill();
          }
          break;
        }

        case 'SHIELD_ORB': {
          // Invulnerability Shield Pickup
          if (!obs.collected) {
            const cx = obs.x + obs.width / 2;
            const cy = obs.y + obs.height / 2;
            ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#60a5fa';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(cx, cy, obs.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          break;
        }
      }

      ctx.restore();
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Energy core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderBoss(ctx: CanvasRenderingContext2D) {
    const boss = this.currentBoss!;
    if (boss.x > this.V_WIDTH + 50) return;

    ctx.save();
    // Shadow under boss
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(boss.x + boss.width / 2, this.GROUND_Y - 4, boss.width * 0.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Boss Body Hull
    ctx.fillStyle = boss.color;
    ctx.shadowColor = boss.color;
    ctx.shadowBlur = 14;
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

    // Boss Core Eye / Glowing Rune
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(boss.x + boss.width * 0.35, boss.y + boss.height * 0.35, 14, 0, Math.PI * 2);
    ctx.fill();

    // Health Bar directly above boss in canvas
    const barW = boss.width + 20;
    const barH = 10;
    const barX = boss.x - 10;
    const barY = boss.y - 24;

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barX, barY, barW, barH);

    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = hpRatio > 0.4 ? '#ef4444' : '#dc2626';
    ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpRatio, barH - 2);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Boss Name Tag
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, boss.x + boss.width / 2, barY - 6);

    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const char = this.selectedCharacter;

    ctx.save();

    // Dynamic Floor Shadow
    const shadowDist = Math.max(0, this.GROUND_Y - (p.y + p.height));
    const shadowScale = Math.max(0.4, 1 - shadowDist / 200);
    ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, this.GROUND_Y - 2, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Invulnerability Flashing
    if (p.invincibleTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Shield Bubble if active
    if (p.shieldActive) {
      ctx.strokeStyle = '#60a5fa';
      ctx.fillStyle = 'rgba(96, 165, 250, 0.25)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, Math.max(p.width, p.height) * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // DRAW PROCEDURAL CHARACTER SPRITE ACCORDING TO ACTION STATE
    if (p.actionState === 'PRONE') {
      // 1. LIE DOWN / PRONE SLIDE (Flat horizontal posture, height = 18, width = 64)
      const slideW = 58;
      const slideH = 16;
      const slideX = p.x - 10;
      const slideY = p.y;

      // Torso / Legs sliding flat
      ctx.fillStyle = char.color;
      ctx.beginPath();
      ctx.roundRect(slideX, slideY, slideW, slideH, 6);
      ctx.fill();

      // Head tucked forward
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(slideX + slideW - 4, slideY + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor / Eye
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(slideX + slideW - 2, slideY + 5, 5, 4);

      // Render Hat / Crown on prone head
      this.renderEquippedHat(ctx, slideX + slideW - 4, slideY + 2, true);

    } else if (p.actionState === 'DUCK') {
      // 2. DUCK / SIT / CROUCH (Compact squat posture, height = 38)
      const crouchW = 34;
      const crouchH = 36;
      const crouchY = p.y;

      // Squatted Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x + 2, crouchY + 20, 12, 16);
      ctx.fillRect(p.x + 18, crouchY + 20, 12, 16);

      // Torso
      ctx.fillStyle = char.color;
      ctx.beginPath();
      ctx.roundRect(p.x, crouchY + 8, crouchW, 18, 4);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(p.x + crouchW / 2 + 4, crouchY + 6, 11, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(p.x + crouchW / 2 + 8, crouchY + 4, 5, 4);

      // Render Hat / Crown
      this.renderEquippedHat(ctx, p.x + crouchW / 2 + 4, crouchY - 2, false);

    } else {
      // 3. STAND / RUN / JUMP / ATTACK (Upright posture, height = 72)
      const strideCycle = (performance.now() * 0.012) * (p.actionState === 'RUN' ? 1.4 : 0);
      const legOffset1 = Math.sin(strideCycle) * 12;
      const legOffset2 = Math.sin(strideCycle + Math.PI) * 12;

      // Legs
      ctx.fillStyle = '#0f172a';
      if (p.actionState === 'JUMP') {
        // Tucked jump legs
        ctx.fillRect(p.x + 4, p.y + 44, 10, 18);
        ctx.fillRect(p.x + 18, p.y + 42, 10, 16);
      } else {
        // Running legs
        ctx.fillRect(p.x + 4 + legOffset1 * 0.5, p.y + 44, 9, 26);
        ctx.fillRect(p.x + 19 + legOffset2 * 0.5, p.y + 44, 9, 26);
      }

      // Torso Suit
      ctx.fillStyle = char.color;
      ctx.beginPath();
      ctx.roundRect(p.x + 3, p.y + 18, 26, 28, 5);
      ctx.fill();

      // Chest Accent Armor / Crest
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(p.x + 9, p.y + 24, 14, 10);

      // Head & Visor
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(p.x + 16, p.y + 11, 12, 0, Math.PI * 2);
      ctx.fill();

      // Eye visor looking forward
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(p.x + 20, p.y + 8, 8, 5);

      // Render Equipped Hat / Crown
      this.renderEquippedHat(ctx, p.x + 16, p.y + 1, false);

      // Arms & Equipped Weapon
      this.renderEquippedWeapon(ctx, p.x + 22, p.y + 28, p.actionState === 'ATTACK');
    }

    ctx.restore();
  }

  private renderEquippedHat(ctx: CanvasRenderingContext2D, headX: number, headY: number, isProne: boolean) {
    if (!this.equippedHat) return;

    ctx.save();
    ctx.translate(headX, headY);

    if (this.equippedHat.type === 'CROWN') {
      // Render Crown / Taj (Imperial Gold or Ruby Sovereign or Astral)
      ctx.fillStyle = this.equippedHat.color;
      ctx.shadowColor = this.equippedHat.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-8, -12);
      ctx.lineTo(-3, -5);
      ctx.lineTo(0, -15); // center jewel peak
      ctx.lineTo(3, -5);
      ctx.lineTo(8, -12);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();

      // Crown jewels
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -7, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.equippedHat.id === 'hat_cyber_visor') {
      // Neon Cyber Visor
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(-2, 3, 14, 6);

    } else if (this.equippedHat.id === 'hat_shinobi_hood') {
      // Ninja Hood
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 13, Math.PI, 0);
      ctx.fill();
      // Headband ribbon
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(13, 0);
      ctx.stroke();

    } else if (this.equippedHat.id === 'hat_archmage_pointed') {
      // Wizard Pointed Hat
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.lineTo(4, -22);
      ctx.closePath();
      ctx.fill();

    } else if (this.equippedHat.id === 'hat_spartan_crest') {
      // Spartan Helmet Crest
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, -5, 12, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderEquippedWeapon(ctx: CanvasRenderingContext2D, handX: number, handY: number, isAttacking: boolean) {
    ctx.save();
    ctx.translate(handX, handY);

    const weaponColor = this.equippedWeapon ? this.equippedWeapon.color : '#38bdf8';
    const angle = isAttacking ? 0.8 : -0.2;
    ctx.rotate(angle);

    if (this.equippedWeapon?.id === 'weapon_shadow_katana') {
      // Katana Blade
      ctx.strokeStyle = weaponColor;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = weaponColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(34, -14);
      ctx.stroke();

    } else if (this.equippedWeapon?.id === 'weapon_photon_blaster') {
      // Laser Gun
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(0, -4, 20, 8);
      ctx.fillRect(0, 2, 6, 8); // handle

    } else if (this.equippedWeapon?.id === 'weapon_thunder_hammer') {
      // Thunder Hammer
      ctx.fillStyle = '#78716c';
      ctx.fillRect(0, -2, 24, 4); // haft
      ctx.fillStyle = '#eab308';
      ctx.fillRect(20, -10, 14, 20); // head

    } else if (this.equippedWeapon?.id === 'weapon_excalibur_blade') {
      // Excalibur Golden Blade
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(38, -3);
      ctx.lineTo(44, 0);
      ctx.lineTo(38, 3);
      ctx.lineTo(0, 3);
      ctx.fill();

    } else {
      // Default Plasma Dagger / Blade
      ctx.strokeStyle = weaponColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(20, -8);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderCompanion(ctx: CanvasRenderingContext2D) {
    const comp = this.equippedCompanion!;
    const t = performance.now() * 0.005;
    const compX = this.player.x - 32;
    const compY = this.player.y - 20 + Math.sin(t) * 9;

    ctx.save();
    ctx.translate(compX, compY);

    // Companion Glow
    ctx.shadowColor = comp.color;
    ctx.shadowBlur = 12;

    if (comp.id === 'companion_sparky') {
      // Robo Drone
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Spinning rotor
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      const rAngle = t * 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rAngle) * 16, -12);
      ctx.lineTo(-Math.cos(rAngle) * 16, -12);
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(3, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (comp.id === 'companion_ignis') {
      // Fire Dragon
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Flapping wings
      const wingY = Math.sin(t * 3) * 8;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, -10 + wingY);
      ctx.lineTo(-4, 4);
      ctx.fill();

    } else if (comp.id === 'companion_lumi') {
      // Starlight Wisp
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

    } else if (comp.id === 'companion_kitsune') {
      // Cyber Fox
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(-10, -18);
      ctx.lineTo(-2, -10);
      ctx.moveTo(2, -10);
      ctx.lineTo(8, -18);
      ctx.lineTo(6, -8);
      ctx.fill();

    } else {
      // Chronos Time Sprite
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
