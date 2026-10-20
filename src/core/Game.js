import * as THREE from 'three';
import { InputManager } from './InputManager.js';
import { SoundManager } from './SoundManager.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { Track } from '../world/Track.js';
import { TrackDecorations } from '../world/TrackDecorations.js';
import { EffectsManager } from '../world/Effects.js';
import { PlayerCar } from '../entities/PlayerCar.js';
import { AICar } from '../entities/AICar.js';
import { HUD } from '../ui/HUD.js';
import { MenuManager } from '../ui/Menu.js';

/**
 * Game.js
 * Master game engine coordinating Three.js rendering, physics simulation,
 * AI rivals, audio synthesis, HUD telemetry, and race events.
 */
export class Game {
  constructor(canvasContainer, uiContainer) {
    this.canvasContainer = canvasContainer;
    this.uiContainer = uiContainer;

    // Core Three.js
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Subsystems
    this.input = null;
    this.sound = null;
    this.env = null;
    this.track = null;
    this.decorations = null;
    this.effects = null;
    this.hud = null;
    this.menu = null;

    // Entities
    this.playerCar = null;
    this.aiCars = [];

    // Race State
    this.isPaused = false;
    this.isRaceActive = false;
    this.countdownStage = -1; // -1: not started, 0-5: red lights, 6: go!
    this.countdownTimer = 0;

    this.totalLaps = 3;
    this.currentLap = 1;
    this.currentLapTime = 0;
    this.bestLapTime = Infinity;
    this.totalRaceTime = 0;
    this.racePosition = 1;
    this.playerTopSpeed = 0;
    this.lastPlayerProgress = 0;

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 1600);

    // 2. WebGL Renderer with High Quality Graphics
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvasContainer.appendChild(this.renderer.domElement);

    // 3. Subsystems
    this.input = new InputManager();
    this.sound = new SoundManager();
    this.env = new EnvironmentManager(this.scene, this.renderer);
    this.track = new Track(this.scene);
    this.decorations = new TrackDecorations(this.scene, this.track);
    this.effects = new EffectsManager(this.scene);

    // 4. Player & AI Setup
    this.setupCars();

    // 5. HUD & Menu UI
    this.hud = new HUD(this.uiContainer, this.track);
    this.menu = new MenuManager(document.getElementById('menu-container'), {
      onStart: (options) => this.startRaceCountdown(options),
      onResume: () => this.resumeRace(),
      onRestart: () => this.restartRace(),
      onToggleSound: () => this.toggleSound(),
      onColorChange: (col) => {
        if (this.playerCar) this.playerCar.setCarColor(col);
      }
    });

    this.bindUIButtons();
    this.bindResize();

    // Start rendering preview loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupCars() {
    // Starting grid layout
    const p0 = this.track.points[0];
    const norm0 = this.track.normals[0];
    const tang0 = this.track.tangents[0];
    const heading0 = Math.atan2(tang0.x, tang0.z);

    // 1. Player Car (Grid slot 4, challenging starting position from the back)
    this.playerCar = new PlayerCar(this.scene, {
      color: 0xd90429,
      rimColor: 0xc5a059
    });

    const playerStart = p0.clone()
      .addScaledVector(tang0, -18.0)
      .addScaledVector(norm0, -3.0);
    this.playerCar.physics.reset(playerStart, heading0);

    // 2. AI Rival Cars
    const aiConfigs = [
      { name: 'VORTEX GT', color: 0x0284c7, rimColor: 0xffffff, offset: 3.2, dist: 0.0, maxSpeed: 305 },
      { name: 'SOLARIS', color: 0xf97316, rimColor: 0x1f2937, offset: -3.2, dist: -6.0, maxSpeed: 315 },
      { name: 'SHADOW VIPER', color: 0x18181b, rimColor: 0xeab308, offset: 3.0, dist: -12.0, maxSpeed: 320 }
    ];

    this.aiCars = [];
    aiConfigs.forEach((cfg) => {
      const initialProgress = ((cfg.dist / this.track.length) % 1.0 + 1.0) % 1.0;
      const ai = new AICar(this.scene, this.track, {
        name: cfg.name,
        color: cfg.color,
        rimColor: cfg.rimColor,
        lateralOffset: cfg.offset,
        initialProgress: initialProgress,
        maxSpeed: cfg.maxSpeed
      });
      this.aiCars.push(ai);
    });
  }

  bindUIButtons() {
    // Camera switch
    const camBtn = document.getElementById('btn-camera');
    camBtn?.addEventListener('click', () => {
      this.cycleCamera();
    });

    // Time of day switch
    const todBtn = document.getElementById('btn-tod');
    todBtn?.addEventListener('click', () => {
      this.cycleTimeOfDay();
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound');
    soundBtn?.addEventListener('click', () => {
      this.toggleSound();
    });

    // Pause button
    const pauseBtn = document.getElementById('btn-pause');
    pauseBtn?.addEventListener('click', () => {
      this.togglePause();
    });

    // Mobile / Touch controls
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
      el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
    };

    bindTouch('touch-gas', () => { this.input.touchThrottle = 1.0; }, () => { this.input.touchThrottle = 0; });
    bindTouch('touch-brake', () => { this.input.touchBrake = 1.0; }, () => { this.input.touchBrake = 0; });
    bindTouch('touch-left', () => { this.input.touchSteer = -1.0; }, () => { this.input.touchSteer = 0; });
    bindTouch('touch-right', () => { this.input.touchSteer = 1.0; }, () => { this.input.touchSteer = 0; });
    bindTouch('touch-handbrake', () => { this.input.touchHandbrake = true; }, () => { this.input.touchHandbrake = false; });
    bindTouch('touch-nitro', () => { this.input.touchNitro = true; }, () => { this.input.touchNitro = false; });
  }

  bindResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  startRaceCountdown(options) {
    this.sound.init();
    this.sound.resume();

    if (options && options.color && this.playerCar) {
      this.playerCar.setCarColor(options.color);
    }

    this.countdownStage = 0;
    this.countdownTimer = 0.8;
    this.isRaceActive = false;
    this.currentLap = 1;
    this.currentLapTime = 0;
    this.bestLapTime = Infinity;
    this.totalRaceTime = 0;

    this.hud.showCountdown(0, 'GET READY');
    this.track.setStartingLights(0);
  }

  updateCountdown(delta) {
    if (this.countdownStage === -1 || this.isRaceActive) return;

    this.countdownTimer -= delta;
    if (this.countdownTimer <= 0) {
      this.countdownStage++;

      if (this.countdownStage >= 1 && this.countdownStage <= 5) {
        this.countdownTimer = 0.75;
        this.hud.showCountdown(this.countdownStage, `${this.countdownStage}`);
        this.track.setStartingLights(this.countdownStage);
        this.sound.playBeep(false);
      } else if (this.countdownStage === 6) {
        // GO!
        this.countdownTimer = 1.2;
        this.hud.showCountdown(6, 'GO! GO! GO!');
        this.track.setStartingLights(6);
        this.sound.playBeep(true);
        this.isRaceActive = true;
      } else if (this.countdownStage > 6) {
        this.hud.showCountdown(-1, '');
        this.track.setStartingLights(0);
        this.countdownStage = -1;
      }
    }
  }

  cycleCamera() {
    const name = this.playerCar.cycleCamera();
    const btn = document.getElementById('cam-name');
    if (btn) btn.innerText = name.split(' ')[0];
  }

  cycleTimeOfDay() {
    const name = this.env.cyclePreset();
    const btn = document.getElementById('tod-name');
    if (btn) btn.innerText = name.toUpperCase();
  }

  toggleSound() {
    const muted = this.sound.toggleMute();
    const btn = document.getElementById('btn-sound');
    if (btn) btn.innerText = muted ? '🔇' : '🔊';
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.menu.showPause();
    } else {
      this.menu.hidePause();
    }
  }

  resumeRace() {
    this.isPaused = false;
  }

  restartRace() {
    this.isPaused = false;
    this.setupCars();
    this.startRaceCountdown();
  }

  resetCarToTrack() {
    // Reset player car to centerline facing forward
    const pPos = this.playerCar.physics.position;
    const info = this.track.getTrackProgress(pPos);
    const heading = Math.atan2(info.tangent.x, info.tangent.z);
    this.playerCar.physics.reset(info.centerPoint, heading);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05); // Clamp against frame hitch

    // Handle single key action triggers
    if (this.input.consumeCameraTrigger()) this.cycleCamera();
    if (this.input.consumeViewModeTrigger()) this.cycleTimeOfDay();
    if (this.input.consumePauseTrigger()) this.togglePause();
    if (this.input.consumeResetTrigger()) this.resetCarToTrack();

    if (!this.isPaused) {
      // 1. Process Countdown
      this.updateCountdown(delta);

      // 2. Update Input (disabled before green light GO)
      const effectiveInput = this.isRaceActive ? this.input : {
        throttle: 0, brake: 0, steer: 0, handbrake: true, nitro: false
      };
      this.input.update(delta);

      // 3. Update Player Car
      this.playerCar.update(delta, effectiveInput, this.track, this.effects, this.sound);
      this.playerCar.updateCamera(this.camera, delta);

      // Track top speed
      if (this.playerCar.physics.speedKmh > this.playerTopSpeed) {
        this.playerTopSpeed = this.playerCar.physics.speedKmh;
      }

      // 4. Update AI Cars
      this.aiCars.forEach(ai => {
        if (this.isRaceActive) {
          ai.update(delta, this.playerCar, this.aiCars);
        }
      });

      // 5. Update Visual Effects & Sky Sun tracking
      this.effects.update(delta, this.camera);
      this.env.update(this.playerCar.physics.position);

      // 6. Update Race Timings & Lap Counting
      if (this.isRaceActive) {
        this.currentLapTime += delta;
        this.totalRaceTime += delta;

        // Player Track Progress
        const playerTrackInfo = this.track.getTrackProgress(this.playerCar.physics.position);
        const playerProg = playerTrackInfo.t;

        // Lap crossing check (passed point 0 from near end)
        if (this.lastPlayerProgress > 0.85 && playerProg < 0.15) {
          // Completed a lap!
          if (this.currentLapTime < this.bestLapTime) {
            this.bestLapTime = this.currentLapTime;
          }
          this.sound.playLapComplete();

          if (this.currentLap >= this.totalLaps) {
            // Race Finished!
            this.finishRace();
          } else {
            this.currentLap++;
            this.currentLapTime = 0;
          }
        }
        this.lastPlayerProgress = playerProg;

        // Calculate Real-Time Race Standings
        const playerOverall = (this.currentLap - 1) + playerProg;
        let rank = 1;
        this.aiCars.forEach(ai => {
          if (ai.getOverallProgress() > playerOverall) {
            rank++;
          }
        });
        this.racePosition = rank;
      }

      // 7. Update HUD Telemetry
      this.hud.update(this.playerCar, this.aiCars, {
        currentLap: this.currentLap,
        totalLaps: this.totalLaps,
        currentLapTime: this.currentLapTime,
        bestLapTime: this.bestLapTime,
        position: this.racePosition
      });
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  finishRace() {
    this.isRaceActive = false;
    this.menu.showFinish({
      position: this.racePosition,
      totalTimeFormatted: this.hud.formatTime(this.totalRaceTime),
      bestLapFormatted: this.hud.formatTime(this.bestLapTime),
      topSpeedKmh: this.playerTopSpeed,
      driftPoints: this.playerCar.physics.driftPoints
    });
  }
}
