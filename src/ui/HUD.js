/**
 * HUD.js
 * Modern, bright, high-visibility racing HUD.
 * Clean 3-2-1-GO countdown (no blocking dots), live coins counter,
 * Nitro meter, speedometer, minimap radar, and dedicated on-screen NITRO button!
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
        <!-- Top Info Header (Bright, Crisp Frosted Glass Theme) -->
        <div class="hud-top-bar">
          <div class="hud-panel race-pos-panel">
            <span class="hud-label">POSITION</span>
            <div class="pos-value"><span id="hud-position">1</span><span class="pos-total">/ 4</span></div>
          </div>

          <div class="hud-panel lap-panel">
            <span class="hud-label">LAP</span>
            <div class="lap-value" id="hud-lap">1 <span class="pos-total">/ 3</span></div>
          </div>

          <!-- Gold Coin Balance Pill in HUD -->
          <div class="hud-panel coins-panel">
            <span class="hud-label">GOLD COINS</span>
            <div class="hud-coins-val"><span class="coin-spin">🪙</span> <span id="hud-coins-count">0</span></div>
          </div>

          <div class="hud-panel timer-panel">
            <div class="timer-row"><span class="hud-label">TIME</span> <span class="timer-value" id="hud-current-time">00:00.000</span></div>
            <div class="timer-row best-row"><span class="hud-label">BEST</span> <span class="timer-value best" id="hud-best-time">--:--.---</span></div>
          </div>

          <!-- Utility quick controls -->
          <div class="hud-panel quick-controls">
            <button id="btn-camera" class="hud-btn" title="Toggle Camera (C)">🎥 <span id="cam-name">CHASE</span></button>
            <button id="btn-tod" class="hud-btn" title="Day/Sunset/Night (V)">☀️ <span id="tod-name">DAY</span></button>
            <button id="btn-sound" class="hud-btn" title="Toggle Audio">🔊</button>
            <button id="btn-pause" class="hud-btn" title="Pause (ESC)">⏸️</button>
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

        <!-- Clean 3-2-1 Countdown (No obstructive dots or bulky black boxes) -->
        <div id="countdown-overlay" class="countdown-overlay hidden">
          <div class="countdown-number" id="countdown-text">3</div>
        </div>

        <!-- Bottom Layout: Minimap (Left), Nitro Button (Center), & Speedometer (Right) -->
        <div class="hud-bottom-bar">
          <!-- 2D Minimap Radar -->
          <div class="minimap-wrapper">
            <canvas id="minimap-canvas" width="180" height="180"></canvas>
          </div>

          <!-- On-Screen Dedicated NITRO BOOST Button (Desktop & Mobile) -->
          <div class="hud-center-actions">
            <button id="btn-hud-nitro" class="hud-nitro-btn">
              <span class="nitro-btn-icon">⚡</span>
              <div class="nitro-btn-col">
                <span class="nitro-btn-main">NITRO BOOST</span>
                <span class="nitro-btn-sub">PRESS OR HOLD SHIFT</span>
              </div>
            </button>
          </div>

          <!-- Speedometer & Tachometer Cluster -->
          <div class="speedo-cluster">
            <!-- Nitro Meter -->
            <div class="nitro-gauge-wrap">
              <div class="nitro-fill" id="nitro-bar"></div>
              <span class="nitro-label">NOS TANK</span>
            </div>

            <!-- Digital Speed & Gear -->
            <div class="speedo-dial">
              <svg class="tacho-svg" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="82" class="tacho-bg" />
                <circle cx="100" cy="100" r="82" class="tacho-fg" id="tacho-arc" />
              </svg>

              <div class="speedo-content">
                <div class="gear-indicator" id="hud-gear">1</div>
                <div class="speed-number" id="hud-speed">0</div>
                <div class="speed-unit">KM/H</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Touch Controls -->
        <div class="touch-controls-layer">
          <div class="touch-left-cluster">
            <button id="touch-left" class="touch-btn">◀</button>
            <button id="touch-right" class="touch-btn">▶</button>
          </div>
          <div class="touch-right-cluster">
            <button id="touch-handbrake" class="touch-btn touch-btn-alt">DRIFT</button>
            <button id="touch-nitro" class="touch-btn touch-btn-nitro">NOS</button>
            <button id="touch-brake" class="touch-btn touch-btn-brake">BRAKE</button>
            <button id="touch-gas" class="touch-btn touch-btn-gas">GAS</button>
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

    const padding = 25;
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

    // 2. Tachometer Arc
    const tachoArc = document.getElementById('tacho-arc');
    if (tachoArc) {
      const rpmPercent = Math.min(1.0, (physics.rpm - 800) / (8500 - 800));
      const maxDash = 386;
      const offset = maxDash - (rpmPercent * maxDash);
      tachoArc.style.strokeDashoffset = offset;

      if (rpmPercent > 0.9) {
        tachoArc.style.stroke = '#ef4444';
      } else if (rpmPercent > 0.7) {
        tachoArc.style.stroke = '#f59e0b';
      } else {
        tachoArc.style.stroke = '#0284c7';
      }
    }

    // 3. Nitro Bar
    const nitroBar = document.getElementById('nitro-bar');
    if (nitroBar) {
      nitroBar.style.width = `${Math.max(0, Math.min(100, physics.nitroFuel))}%`;
      if (physics.isNitroActive) {
        nitroBar.classList.add('nitro-pulsing');
      } else {
        nitroBar.classList.remove('nitro-pulsing');
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
    if (bestElem && raceState.bestLapTime > 0) bestElem.innerText = this.formatTime(raceState.bestLapTime);
    if (posElem) posElem.innerText = raceState.position;

    // Coins counter
    const coinsElem = document.getElementById('hud-coins-count');
    if (coinsElem && raceState.coins !== undefined) {
      coinsElem.innerText = raceState.coins.toLocaleString();
    }

    // 6. Draw Minimap Radar
    this.renderMinimap(playerCar, aiCars);
  }

  renderMinimap(playerCar, aiCars) {
    if (!this.minimapCtx || !this.cachedMinimapPoints.length) return;

    const ctx = this.minimapCtx;
    ctx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < this.cachedMinimapPoints.length; i++) {
      const p = this.cachedMinimapPoints[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    const startPt = this.cachedMinimapPoints[0];
    ctx.fillStyle = '#facc15';
    ctx.fillRect(startPt.x - 3, startPt.y - 3, 6, 6);

    const transform = this.minimapTransform;

    aiCars.forEach(ai => {
      const x = (ai.position.x - transform.minX) * transform.scale + transform.offsetX;
      const y = (ai.position.z - transform.minZ) * transform.scale + transform.offsetZ;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 4;
      ctx.fill();
    });

    const pPos = playerCar.physics.position;
    const px = (pPos.x - transform.minX) * transform.scale + transform.offsetX;
    const py = (pPos.z - transform.minZ) * transform.scale + transform.offsetZ;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerCar.physics.yaw);

    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#8b5cf6';

    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 5);
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
    if (overlay) overlay.classList.add('hidden');
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
