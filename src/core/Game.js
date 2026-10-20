import * as THREE from 'three';
import { InputManager } from './InputManager.js';
import { SoundManager } from './SoundManager.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { GarageManager } from './GarageManager.js';
import { Track } from '../world/Track.js';
import { TrackDecorations } from '../world/TrackDecorations.js';
import { EffectsManager } from '../world/Effects.js';
import { CoinManager } from '../world/CoinManager.js';
import { PlayerCar } from '../entities/PlayerCar.js';
import { AICar } from '../entities/AICar.js';
import { HUD } from '../ui/HUD.js';
import { GarageUI } from '../ui/GarageUI.js';
import { MenuManager } from '../ui/Menu.js';
import {
  CARS_DATABASE,
  getPlayerCoins,
  savePlayerCoins,
  getSelectedCarId,
  setSelectedCarId
} from '../data/cars.js';

/**
 * Game.js
 * Master game engine coordinating 3D Showroom Garage, Track racing,
 * Gold coin collection system, AI rivals, audio synthesis, and HUD telemetry.
 */
export class Game {
  constructor(canvasContainer, uiContainer) {
    this.canvasContainer = canvasContainer;
    this.uiContainer = uiContainer;

    // Three.js Core
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
    this.coins = null;
    this.garage = null;
    this.garageUI = null;
    this.hud = null;
    this.menu = null;

    // Entities
    this.playerCar = null;
    this.aiCars = [];
    this.activeCarConfig = null;

    // Game Mode State: 'GARAGE' | 'RACING' | 'FINISHED'
    this.gameState = 'GARAGE';
    this.isPaused = false;
    this.isRaceActive = false;
    this.countdownStage = -1;
    this.countdownTimer = 0;

    // Race Progress & Coins
    this.totalLaps = 3;
    this.currentLap = 1;
    this.currentLapTime = 0;
    this.bestLapTime = Infinity;
    this.totalRaceTime = 0;
    this.racePosition = 1;
    this.playerTopSpeed = 0;
    this.lastPlayerProgress = 0;
    this.raceCoinsCollected = 0;

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 1600);

    // 2. High-Fidelity WebGL Renderer
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
    this.coins = new CoinManager(this.scene, this.track);
    this.garage = new GarageManager(this.scene);

    // 4. Initial Selected Car Setup
    const selectedId = getSelectedCarId();
    this.activeCarConfig = CARS_DATABASE.find(c => c.id === selectedId) || CARS_DATABASE[0];

    // Setup 3D showroom with selected car
    this.garage.setCar(this.activeCarConfig);

    // Setup Track Player Car & AI Rivals
    this.setupCars();

    // 5. UI Layers: GarageUI (Showroom & Inventory), HUD, and Modals
    const garageContainer = document.getElementById('garage-container') || this.createGarageContainer();

    this.garageUI = new GarageUI(garageContainer, {
      onCarChanged: (car) => {
        this.activeCarConfig = car;
        this.garage.setCar(car);
      },
      onCarPurchased: (car) => {
        this.sound.init();
        this.sound.playLapComplete(); // celebratory chime
      },
      onPlayRace: (car) => {
        this.activeCarConfig = car;
        this.startRaceFromGarage();
      },
      onToggleSound: () => this.toggleSound()
    });

    this.hud = new HUD(this.uiContainer, this.track);
    this.menu = new MenuManager(document.getElementById('menu-container'), {
      onResume: () => this.resumeRace(),
      onRestart: () => this.restartRace(),
      onToggleSound: () => this.toggleSound(),
      onReturnToGarage: () => this.returnToGarage()
    });

    this.bindUIButtons();
    this.bindResize();

    // Set initial Garage Mode view
    this.enterGarageMode();

    // Main animation loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createGarageContainer() {
    const el = document.createElement('div');
    el.id = 'garage-container';
    document.body.appendChild(el);
    return el;
  }

  setupCars() {
    // Starting grid layout
    const p0 = this.track.points[0];
    const norm0 = this.track.normals[0];
    const tang0 = this.track.tangents[0];
    const heading0 = Math.atan2(tang0.x, tang0.z);

    // 1. Player Car
    this.playerCar = new PlayerCar(this.scene, {
      color: this.activeCarConfig.color,
      accentColor: this.activeCarConfig.accentColor,
      rimColor: this.activeCarConfig.rimColor,
      caliperColor: this.activeCarConfig.caliperColor,
      bodyType: this.activeCarConfig.bodyType
    });

    const playerStart = p0.clone()
      .addScaledVector(tang0, -18.0)
      .addScaledVector(norm0, -3.0);
    this.playerCar.physics.reset(playerStart, heading0);

    // 2. AI Rival Cars (distinct supercars from database)
    const aiSpecs = [
      { car: CARS_DATABASE[1], offset: 3.2, dist: 0.0 },   // GR35
      { car: CARS_DATABASE[2], offset: -3.2, dist: -6.0 },  // DRIVEZA
      { car: CARS_DATABASE[4], offset: 3.0, dist: -12.0 }   // DRIVON
    ];

    this.aiCars = [];
    aiSpecs.forEach(cfg => {
      const initialProgress = ((cfg.dist / this.track.length) % 1.0 + 1.0) % 1.0;
      const ai = new AICar(this.scene, this.track, {
        name: cfg.car.name,
        color: cfg.car.color,
        rimColor: cfg.car.rimColor,
        caliperColor: cfg.car.caliperColor,
        lateralOffset: cfg.offset,
        initialProgress: initialProgress,
        maxSpeed: cfg.car.physics.topSpeedKmh
      });
      this.aiCars.push(ai);
    });
  }

  enterGarageMode() {
    this.gameState = 'GARAGE';
    this.isRaceActive = false;
    this.isPaused = false;
    this.garage.active = true;

    // Show garage UI, hide HUD
    this.garageUI.showGarage();
    const hudOverlay = document.getElementById('hud-overlay');
    if (hudOverlay) hudOverlay.style.display = 'none';

    // Position camera in 3D showroom
    const camTrans = this.garage.getShowroomCameraTransform();
    this.camera.position.copy(camTrans.camPos);
    this.camera.lookAt(camTrans.targetPos);
  }

  startRaceFromGarage() {
    this.sound.init();
    this.sound.resume();

    this.gameState = 'RACING';
    this.garage.active = false;
    this.garageUI.hideGarage();

    // Show HUD
    const hudOverlay = document.getElementById('hud-overlay');
    if (hudOverlay) hudOverlay.style.display = 'flex';

    // Update Player Car model & physics to selected car
    this.playerCar.setCarConfig(this.activeCarConfig);

    // Reset player car to start line
    const p0 = this.track.points[0];
    const norm0 = this.track.normals[0];
    const tang0 = this.track.tangents[0];
    const heading0 = Math.atan2(tang0.x, tang0.z);
    const playerStart = p0.clone()
      .addScaledVector(tang0, -18.0)
      .addScaledVector(norm0, -3.0);
    this.playerCar.physics.reset(playerStart, heading0);

    // Reset race coins & timer
    this.raceCoinsCollected = 0;
    this.coins.resetLapCoins();

    this.startRaceCountdown();
  }

  startRaceCountdown() {
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

  bindUIButtons() {
    document.getElementById('btn-camera')?.addEventListener('click', () => {
      this.cycleCamera();
    });

    document.getElementById('btn-tod')?.addEventListener('click', () => {
      this.cycleTimeOfDay();
    });

    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.toggleSound();
    });

    document.getElementById('btn-pause')?.addEventListener('click', () => {
      this.togglePause();
    });

    // Touch Controls
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
    const btn1 = document.getElementById('btn-sound');
    const btn2 = document.getElementById('btn-garage-sound');
    if (btn1) btn1.innerText = muted ? '🔇' : '🔊';
    if (btn2) btn2.innerText = muted ? '🔇' : '🔊';
    return muted;
  }

  togglePause() {
    if (this.gameState !== 'RACING') return;
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
    this.startRaceFromGarage();
  }

  returnToGarage() {
    this.menu.hidePause();
    const finishEl = document.getElementById('finish-screen');
    if (finishEl) finishEl.classList.add('hidden');
    this.enterGarageMode();
  }

  resetCarToTrack() {
    if (this.gameState !== 'RACING') return;
    const pPos = this.playerCar.physics.position;
    const info = this.track.getTrackProgress(pPos);
    const heading = Math.atan2(info.tangent.x, info.tangent.z);
    this.playerCar.physics.reset(info.centerPoint, heading);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);

    // Keyboard action triggers
    if (this.input.consumeCameraTrigger()) this.cycleCamera();
    if (this.input.consumeViewModeTrigger()) this.cycleTimeOfDay();
    if (this.input.consumePauseTrigger()) this.togglePause();
    if (this.input.consumeResetTrigger()) this.resetCarToTrack();

    if (this.gameState === 'GARAGE') {
      // 3D Garage Showroom Mode
      this.garage.update(delta);
      const camTrans = this.garage.getShowroomCameraTransform();
      this.camera.position.copy(camTrans.camPos);
      this.camera.lookAt(camTrans.targetPos);
    } else if (this.gameState === 'RACING' && !this.isPaused) {
      // Race Mode
      this.updateCountdown(delta);

      const effectiveInput = this.isRaceActive ? this.input : {
        throttle: 0, brake: 0, steer: 0, handbrake: true, nitro: false
      };
      this.input.update(delta);

      // Player Car Update
      this.playerCar.update(delta, effectiveInput, this.track, this.effects, this.sound);
      this.playerCar.updateCamera(this.camera, delta);

      if (this.playerCar.physics.speedKmh > this.playerTopSpeed) {
        this.playerTopSpeed = this.playerCar.physics.speedKmh;
      }

      // Update AI Cars
      this.aiCars.forEach(ai => {
        if (this.isRaceActive) {
          ai.update(delta, this.playerCar, this.aiCars);
        }
      });

      // Update 3D Gold Coins on Track
      if (this.isRaceActive) {
        this.coins.update(delta, this.playerCar, (coinPos) => {
          // Coin collected callback!
          this.raceCoinsCollected++;
          const currentTotal = getPlayerCoins();
          savePlayerCoins(currentTotal + 1);

          this.sound.playCoinSound();
          this.effects.emitCoinSparkles(coinPos);
          this.hud.showCoinPickup(1);
        });
      }

      // Update Visual FX & Atmospheric Sun
      this.effects.update(delta, this.camera);
      this.env.update(this.playerCar.physics.position);

      // Lap Progression & Timing
      if (this.isRaceActive) {
        this.currentLapTime += delta;
        this.totalRaceTime += delta;

        const playerTrackInfo = this.track.getTrackProgress(this.playerCar.physics.position);
        const playerProg = playerTrackInfo.t;

        if (this.lastPlayerProgress > 0.85 && playerProg < 0.15) {
          if (this.currentLapTime < this.bestLapTime) {
            this.bestLapTime = this.currentLapTime;
          }
          this.sound.playLapComplete();

          if (this.currentLap >= this.totalLaps) {
            this.finishRace();
          } else {
            this.currentLap++;
            this.currentLapTime = 0;
            // Respawn track coins for next lap
            this.coins.resetLapCoins();
          }
        }
        this.lastPlayerProgress = playerProg;

        // Position ranking
        const playerOverall = (this.currentLap - 1) + playerProg;
        let rank = 1;
        this.aiCars.forEach(ai => {
          if (ai.getOverallProgress() > playerOverall) rank++;
        });
        this.racePosition = rank;
      }

      // Update HUD
      this.hud.update(this.playerCar, this.aiCars, {
        currentLap: this.currentLap,
        totalLaps: this.totalLaps,
        currentLapTime: this.currentLapTime,
        bestLapTime: this.bestLapTime,
        position: this.racePosition,
        coins: getPlayerCoins()
      });
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  finishRace() {
    this.isRaceActive = false;
    this.gameState = 'FINISHED';

    // Bonus completion reward based on position
    const finishBonus = this.racePosition === 1 ? 25 : this.racePosition === 2 ? 15 : 10;
    savePlayerCoins(getPlayerCoins() + finishBonus);

    this.menu.showFinish({
      position: this.racePosition,
      totalTimeFormatted: this.hud.formatTime(this.totalRaceTime),
      bestLapFormatted: this.hud.formatTime(this.bestLapTime),
      topSpeedKmh: this.playerTopSpeed,
      driftPoints: this.playerCar.physics.driftPoints,
      coinsEarned: this.raceCoinsCollected + finishBonus
    });
  }
}
