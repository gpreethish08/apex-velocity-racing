/**
 * HUD.js
 * High-visibility Racing Master HUD overlay.
 * Features:
 * - Translucent curved steering chevrons 《 》 on bottom-left
 * - Translucent DRIFT pedal, ⚡ NITRO boost button, and pedals on bottom-right
 * - Center digital instrument cluster with Gear, KM/H, throttle/RPM bar, TCS/ABS indicators
 * - Clean 3-2-1 countdown that hides immediately upon race start
 * - Live Gold Coin pickup counter & Nitro gauge
 */
export class HUD {
  constructor(container, track) {
    this.container = container;
    this.track = track;

    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.cachedMinimapPoints = [];

    this.setupElements();
    this.precomputeMinimap();
  }

  setupElements() {
    this.container.innerHTML = `
      <div id="hud-overlay" class="hud-container">
        <!-- Top Info Header -->
        <div class="hud-top-bar">
          <!-- Top Left: Race Progress & Coins -->
          <div class="hud-left-meta">
            <div class="hud-panel race-pos-panel">
              <span class="hud-label">POSITION</span>
              <div class="pos-value"><span id="hud-position">1</span><span class="pos-total">st</span></div>
            </div>

            <div class="hud-panel lap-panel">
              <span class="hud-label">LAP</span>
              <div class="lap-value" id="hud-lap">1 <span class="pos-total">/ 3</span></div>
            </div>

            <div class="hud-panel coins-panel">
              <span class="hud-label">GOLD COINS</span>
              <div class="hud-coins-val"><span class="coin-spin">🪙</span> <span id="hud-coins-count">0</span></div>
            </div>
          </div>

          <!-- Top Center: Racing Master Digital Telemetry Cluster -->
          <div class="hud-center-cluster">
            <div class="cluster-shell">
              <div class="cluster-gear-wrap">
                <span class="cluster-sublabel">GEAR</span>
                <span class="cluster-gear" id="hud-gear">1</span>
              </div>

              <div class="cluster-speed-wrap">
                <span class="cluster-speed" id="hud-speed">0</span>
                <span class="cluster-unit">KM/H</span>
              </div>

              <div class="cluster-meters">
                <!-- Linear RPM / Throttle Bar -->
                <div class="cluster-rpm-track">
                  <div id="cluster-rpm-fill" class="cluster-rpm-fill"></div>
                </div>
                <!-- Nitro Bar -->
                <div class="cluster-nitro-track">
                  <div id="nitro-bar" class="cluster-nitro-fill"></div>
                  <span class="cluster-nitro-label">⚡ NOS</span>
                </div>
                <!-- Active Assist Indicators -->
                <div class="cluster-indicators">
                  <span id="ind-abs" class="ind-pill active">ABS</span>
                  <span id="ind-tcs" class="ind-pill active">TCS</span>
                  <span id="ind-nos" class="ind-pill">NITRO</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Right: Lap Times & Utility Buttons -->
          <div class="hud-right-meta">
            <div class="hud-panel timer-panel">
              <div class="timer-row"><span class="hud-label">LAP TIME</span> <span class="timer-value" id="hud-current-time">00:00.000</span></div>
              <div class="timer-row best-row"><span class="hud-label">BEST</span> <span class="timer-value best" id="hud-best-time">--:--.---</span></div>
            </div>

            <div class="hud-panel quick-controls">
              <button id="btn-camera" class="hud-btn" title="Toggle Camera (C)">🎥 <span id="cam-name">CHASE</span></button>
              <button id="btn-tod" class="hud-btn" title="Day/Sunset/Night (V)">☀️ <span id="tod-name">DAY</span></button>
              <button id="btn-sound" class="hud-btn" title="Toggle Audio">🔊</button>
              <button id="btn-pause" class="hud-btn" title="Pause (ESC)">⏸️</button>
            </div>
          </div>
        </div>

        <!-- Floating Coin Pickup Popup -->
        <div id="coin-pickup-popup" class="coin-pickup-popup hidden">
          +1 🪙
        </div>

        <!-- Floating Nitro Refill Popup -->
        <div id="nitro-pickup-popup" class="nitro-pickup-popup hidden">
          ⚡ 100% NITRO REFILLED!
        </div>

        <!-- Drift Banner Overlay -->
        <div id="drift-banner" class="drift-banner hidden">
          <div class="drift-title">DRIFT</div>
          <div class="drift-points" id="drift-points">+0 PTS</div>
          <div class="drift-multiplier" id="drift-mult">x 1.0</div>
        </div>

        <!-- Clean 3-2-1 Countdown (Hides completely once race begins, no dots blocking car) -->
        <div id="countdown-overlay" class="countdown-overlay hidden">
          <div class="countdown-number" id="countdown-text">3</div>
        </div>

        <!-- Bottom Layout: Minimap Radar on Bottom Left -->
        <div class="hud-bottom-bar">
          <div class="minimap-wrapper">
            <canvas id="minimap-canvas" width="160" height="160"></canvas>
          </div>

          <!-- Dedicated Desktop Nitro Boost Button (also active for mouse clickers) -->
          <div class="hud-center-actions">
            <button id="btn-hud-nitro" class="hud-nitro-btn">
              <span class="nitro-btn-icon">⚡</span>
              <div class="nitro-btn-col">
                <span class="nitro-btn-main">NITRO BOOST</span>
                <span class="nitro-btn-sub">PRESS [SHIFT] OR TAP</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Mobile & Tablet Translucent Touch Controls (Matching Racing Master) -->
        <div class="touch-controls-layer">
          <!-- Left: Translucent Steering Chevrons -->
          <div class="touch-left-cluster">
            <button id="touch-left" class="touch-btn touch-btn-steer" aria-label="Steer Left">《</button>
            <button id="touch-right" class="touch-btn touch-btn-steer" aria-label="Steer Right">》</button>
          </div>

          <!-- Right: Translucent DRIFT Pedal, NITRO button, & Gas/Brake -->
          <div class="touch-right-cluster">
            <button id="touch-handbrake" class="touch-btn touch-btn-drift" aria-label="Drift Handbrake">
              <span class="touch-btn-subicon">🛞</span>
              <span class="touch-btn-label">DRIFT</span>
            </button>
            <button id="touch-nitro" class="touch-btn touch-btn-nitro" aria-label="Nitro Boost">
              <span class="touch-btn-subicon">⚡</span>
              <span class="touch-btn-label">NITRO</span>
            </button>
            <button id="touch-brake" class="touch-btn touch-btn-pedal touch-btn-brake" aria-label="Brake Pedal">
              <span class="touch-btn-label">BRAKE</span>
            </button>
            <button id="touch-gas" class="touch-btn touch-btn-pedal touch-btn-gas" aria-label="Gas Accelerator">
              <span class="touch-btn-label">GAS</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  precomputeMinimap() {
    if (!this.track || !this.track.points.length) return;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    this.track.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    const padding = 20;
    const w = this.minimapCanvas.width - padding * 2;
    const h = this.minimapCanvas.height - padding * 2;

    const spanX = maxX - minX || 1;
    const spanZ = maxZ - minZ || 1;
    const scale = Math.min(w / spanX, h / spanZ);

    this.minimapTransform = {
      minX, minZ, scale,
      offsetX: padding + (w - spanX * scale) * 0.5,
      offsetZ: padding + (h - spanZ * scale) * 0.5
    };

    this.cachedMinimapPoints = this.track.points.map(p => ({
      x: (p.x - minX) * scale + this.minimapTransform.offsetX,
      y: (p.z - minZ) * scale + this.minimapTransform.offsetZ
    }));
  }

  update(playerCar, aiCars, raceState) {
    const physics = playerCar.physics;

    // 1. Digital Speed & Gear
    const speedElem = document.getElementById('hud-speed');
    const gearElem = document.getElementById('hud-gear');
    if (speedElem) speedElem.innerText = Math.round(physics.speedKmh);
    if (gearElem) {
      if (physics.signedSpeed < -0.5) {
        gearElem.innerText = 'R';
      } else if (physics.speedKmh < 1.0) {
        gearElem.innerText = 'N';
      } else {
        gearElem.innerText = physics.gear;
      }
    }

    // 2. RPM / Throttle Linear Gauge
    const rpmFill = document.getElementById('cluster-rpm-fill');
    if (rpmFill) {
      const rpmPercent = Math.min(1.0, Math.max(0, (physics.rpm - 950) / (8500 - 950)));
      rpmFill.style.width = `${rpmPercent * 100}%`;
      if (rpmPercent > 0.9) {
        rpmFill.style.background = 'linear-gradient(90deg, #facc15 0%, #ef4444 100%)';
      } else {
        rpmFill.style.background = 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)';
      }
    }

    // 3. Nitro Bar
    const nitroBar = document.getElementById('nitro-bar');
    const indNos = document.getElementById('ind-nos');
    if (nitroBar) {
      const fuelPct = Math.max(0, Math.min(100, physics.nitroFuel));
      nitroBar.style.width = `${fuelPct}%`;
      if (physics.isNitroActive) {
        nitroBar.classList.add('nitro-pulsing');
        if (indNos) indNos.className = 'ind-pill active active-nos';
      } else {
        nitroBar.classList.remove('nitro-pulsing');
        if (indNos) indNos.className = fuelPct > 20 ? 'ind-pill ready-nos' : 'ind-pill';
      }
    }

    // 4. Drift Banner
    const driftBanner = document.getElementById('drift-banner');
    if (driftBanner) {
      if (physics.isDrifting && physics.speedKmh > 30) {
        driftBanner.classList.remove('hidden');
        document.getElementById('drift-points').innerText = `+${physics.driftPoints.toLocaleString()} PTS`;
        document.getElementById('drift-mult').innerText = `x ${physics.driftMultiplier.toFixed(1)}`;
      } else {
        driftBanner.classList.add('hidden');
      }
    }

    // 5. Timers & Lap
    const lapElem = document.getElementById('hud-lap');
    const timeElem = document.getElementById('hud-current-time');
    const bestElem = document.getElementById('hud-best-time');
    const posElem = document.getElementById('hud-position');

    if (lapElem) lapElem.innerHTML = `${raceState.currentLap} <span class="pos-total">/ ${raceState.totalLaps}</span>`;
    if (timeElem) timeElem.innerText = this.formatTime(raceState.currentLapTime);
    if (bestElem && raceState.bestLapTime > 0 && isFinite(raceState.bestLapTime)) {
      bestElem.innerText = this.formatTime(raceState.bestLapTime);
    }
    if (posElem) posElem.innerText = raceState.position || 1;

    // Coins counter
    const coinsElem = document.getElementById('hud-coins-count');
    if (coinsElem && raceState.coins !== undefined) {
      coinsElem.innerText = raceState.coins;
    }

    // 6. 2D Minimap
    this.renderMinimap(playerCar, aiCars);
  }

  renderMinimap(playerCar, aiCars) {
    if (!this.minimapCtx || !this.cachedMinimapPoints.length) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Track Path
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.cachedMinimapPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Start / Finish Checkered line indicator
    const startPt = this.cachedMinimapPoints[0];
    ctx.fillStyle = '#facc15';
    ctx.fillRect(startPt.x - 3, startPt.y - 3, 6, 6);

    const transform = this.minimapTransform;

    // AI Cars (if any)
    if (aiCars && aiCars.length) {
      aiCars.forEach(ai => {
        const x = (ai.position.x - transform.minX) * transform.scale + transform.offsetX;
        const y = (ai.position.z - transform.minZ) * transform.scale + transform.offsetZ;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      });
    }

    // Player Hero Car Indicator (Sharp triangle pointer)
    const pPos = playerCar.physics.position;
    const px = (pPos.x - transform.minX) * transform.scale + transform.offsetX;
    const py = (pPos.z - transform.minZ) * transform.scale + transform.offsetZ;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerCar.physics.yaw);

    ctx.shadowColor = '#df1020';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#df1020';

    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  showCountdown(stage, countText) {
    const overlay = document.getElementById('countdown-overlay');
    const textElem = document.getElementById('countdown-text');
    if (!overlay || !textElem) return;

    if (stage === -1) {
      overlay.classList.add('hidden');
      return;
    }

    overlay.classList.remove('hidden');
    textElem.innerText = countText;

    if (stage === 1) {
      textElem.className = 'countdown-number count-red';
    } else if (stage === 2) {
      textElem.className = 'countdown-number count-amber';
    } else if (stage === 3) {
      textElem.className = 'countdown-number count-yellow';
    } else if (stage === 4) {
      textElem.className = 'countdown-number count-green';
    }
  }

  hideCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
  }

  showCoinPickup(amount = 1) {
    const pop = document.getElementById('coin-pickup-popup');
    if (!pop) return;
    pop.innerText = `+${amount} 🪙`;
    pop.classList.remove('hidden');
    pop.classList.remove('pop-animate');
    void pop.offsetWidth;
    pop.classList.add('pop-animate');
  }

  showNitroPickup() {
    const pop = document.getElementById('nitro-pickup-popup');
    if (!pop) return;
    pop.classList.remove('hidden');
    pop.classList.remove('pop-animate');
    void pop.offsetWidth;
    pop.classList.add('pop-animate');
  }

  formatTime(seconds) {
    if (seconds <= 0 || !isFinite(seconds)) return '00:00.000';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
}
