/**
 * Menu.js
 * Manages start screen, car selector, pause overlay, controls guide,
 * and victory race results screen.
 */
export class MenuManager {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.selectedCarColor = 0xd90429;
    this.selectedCarIndex = 0;

    this.carOptions = [
      { name: 'APEX PHANTOM GT', color: 0xd90429, desc: 'Aerodynamic twin-turbo hypercar. High top speed and laser precision.' },
      { name: 'VIPER GTS TRACK', color: 0x171717, desc: 'V10 powerhouse with aggressive acceleration and massive rear downforce.' },
      { name: 'KAGURA R-35 NEO', color: 0xf97316, desc: 'AWD cornering beast with ultra-high lateral grip and effortless drift control.' },
      { name: 'CYBER HORIZON', color: 0x0284c7, desc: 'Next-gen hybrid with instantaneous electric torque and extended NOS.' }
    ];

    this.setupElements();
  }

  setupElements() {
    this.container.innerHTML = `
      <div id="ui-screens-wrapper">
        <!-- START / CAR SELECTION SCREEN -->
        <div id="start-screen" class="menu-screen active">
          <div class="menu-backdrop"></div>
          <div class="menu-content">
            <div class="menu-header">
              <h1 class="game-title">APEX <span class="accent-text">VELOCITY</span></h1>
              <p class="game-tagline">ULTRA HIGH-FIDELITY 3D RACING SIMULATOR</p>
            </div>

            <!-- Car Selector Card -->
            <div class="car-selector-box">
              <div class="selector-controls">
                <button id="car-prev-btn" class="nav-arrow-btn">◀</button>
                <div class="car-info-display">
                  <h2 id="car-display-name">APEX PHANTOM GT</h2>
                  <p id="car-display-desc">Aerodynamic twin-turbo hypercar. High top speed and laser precision.</p>
                </div>
                <button id="car-next-btn" class="nav-arrow-btn">▶</button>
              </div>

              <!-- Color Swatches -->
              <div class="color-palette">
                <span class="palette-title">CUSTOMIZE PAINT:</span>
                <div class="swatches-container">
                  <button class="color-swatch active" data-color="0xd90429" style="background:#d90429;" title="Rosso Corsa"></button>
                  <button class="color-swatch" data-color="0x171717" style="background:#171717;" title="Midnight Carbon"></button>
                  <button class="color-swatch" data-color="0x0284c7" style="background:#0284c7;" title="Electric Cyan"></button>
                  <button class="color-swatch" data-color="0xf97316" style="background:#f97316;" title="Solar Pearl"></button>
                  <button class="color-swatch" data-color="0x10b981" style="background:#10b981;" title="Emerald GT"></button>
                  <button class="color-swatch" data-color="0x8b5cf6" style="background:#8b5cf6;" title="Ultraviolet"></button>
                </div>
              </div>
            </div>

            <!-- Controls Quick Guide -->
            <div class="controls-cheat-sheet">
              <div class="control-key-item"><kbd>W</kbd> / <kbd>▲</kbd> <span>ACCELERATE</span></div>
              <div class="control-key-item"><kbd>S</kbd> / <kbd>▼</kbd> <span>BRAKE / REV</span></div>
              <div class="control-key-item"><kbd>A</kbd> <kbd>D</kbd> / <kbd>◀</kbd> <kbd>▶</kbd> <span>STEER</span></div>
              <div class="control-key-item"><kbd>SPACE</kbd> <span>HANDBRAKE (DRIFT)</span></div>
              <div class="control-key-item"><kbd>SHIFT</kbd> <span>NITRO BOOST</span></div>
              <div class="control-key-item"><kbd>C</kbd> <span>CAMERA VIEW</span></div>
              <div class="control-key-item"><kbd>V</kbd> <span>DAY / NIGHT</span></div>
            </div>

            <button id="btn-start-game" class="btn-primary-large">START RACE</button>
          </div>
        </div>

        <!-- PAUSE SCREEN -->
        <div id="pause-screen" class="menu-screen hidden">
          <div class="menu-backdrop blur"></div>
          <div class="menu-content modal-content">
            <h2 class="modal-title">RACE PAUSED</h2>
            <div class="modal-btn-list">
              <button id="btn-resume" class="btn-modal btn-primary">RESUME RACE</button>
              <button id="btn-restart" class="btn-modal btn-secondary">RESTART RACE</button>
              <button id="btn-pause-sound" class="btn-modal btn-secondary">TOGGLE AUDIO</button>
            </div>
            <div class="pause-controls-reminder">
              <p>Press <kbd>ESC</kbd> or <kbd>P</kbd> to resume at any time</p>
            </div>
          </div>
        </div>

        <!-- FINISH RESULTS SCREEN -->
        <div id="finish-screen" class="menu-screen hidden">
          <div class="menu-backdrop blur"></div>
          <div class="menu-content modal-content results-modal">
            <div class="finish-badge" id="finish-badge">PODIUM FINISH!</div>
            <h1 class="finish-position" id="finish-pos">1ST PLACE</h1>

            <div class="results-stats-grid">
              <div class="stat-card">
                <span class="stat-lbl">TOTAL TIME</span>
                <span class="stat-val" id="stat-total-time">02:45.320</span>
              </div>
              <div class="stat-card">
                <span class="stat-lbl">BEST LAP</span>
                <span class="stat-val stat-gold" id="stat-best-lap">01:12.840</span>
              </div>
              <div class="stat-card">
                <span class="stat-lbl">TOP SPEED</span>
                <span class="stat-val" id="stat-top-speed">324 KM/H</span>
              </div>
              <div class="stat-card">
                <span class="stat-lbl">DRIFT SCORE</span>
                <span class="stat-val stat-cyan" id="stat-drift-score">18,400 PTS</span>
              </div>
            </div>

            <div class="modal-btn-list">
              <button id="btn-race-again" class="btn-primary-large">RACE AGAIN</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Car Selector Prev / Next
    document.getElementById('car-prev-btn')?.addEventListener('click', () => {
      this.selectedCarIndex = (this.selectedCarIndex - 1 + this.carOptions.length) % this.carOptions.length;
      this.updateCarDisplay();
    });

    document.getElementById('car-next-btn')?.addEventListener('click', () => {
      this.selectedCarIndex = (this.selectedCarIndex + 1) % this.carOptions.length;
      this.updateCarDisplay();
    });

    // Color swatches
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const hex = parseInt(swatch.dataset.color, 16);
        this.selectedCarColor = hex;
        if (this.callbacks.onColorChange) {
          this.callbacks.onColorChange(hex);
        }
      });
    });

    // Start Button
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('start-screen').classList.add('hidden');
      if (this.callbacks.onStart) {
        this.callbacks.onStart({
          carIndex: this.selectedCarIndex,
          color: this.selectedCarColor
        });
      }
    });

    // Resume Button
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.hidePause();
      if (this.callbacks.onResume) this.callbacks.onResume();
    });

    // Restart Button
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.hidePause();
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });

    // Sound toggle in pause
    document.getElementById('btn-pause-sound')?.addEventListener('click', () => {
      if (this.callbacks.onToggleSound) this.callbacks.onToggleSound();
    });

    // Race Again Button
    document.getElementById('btn-race-again')?.addEventListener('click', () => {
      document.getElementById('finish-screen').classList.add('hidden');
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });
  }

  updateCarDisplay() {
    const car = this.carOptions[this.selectedCarIndex];
    document.getElementById('car-display-name').innerText = car.name;
    document.getElementById('car-display-desc').innerText = car.desc;
    this.selectedCarColor = car.color;

    // Update active swatch
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(s => {
      const col = parseInt(s.dataset.color, 16);
      if (col === car.color) s.classList.add('active');
      else s.classList.remove('active');
    });

    if (this.callbacks.onColorChange) {
      this.callbacks.onColorChange(car.color);
    }
  }

  showPause() {
    const pauseEl = document.getElementById('pause-screen');
    if (pauseEl) {
      pauseEl.classList.remove('hidden');
      pauseEl.classList.add('active');
    }
  }

  hidePause() {
    const pauseEl = document.getElementById('pause-screen');
    if (pauseEl) {
      pauseEl.classList.remove('active');
      pauseEl.classList.add('hidden');
    }
  }

  showFinish(stats) {
    const finishEl = document.getElementById('finish-screen');
    if (!finishEl) return;

    finishEl.classList.remove('hidden');
    finishEl.classList.add('active');

    const pos = stats.position || 1;
    const posText = pos === 1 ? '1ST PLACE' : pos === 2 ? '2ND PLACE' : pos === 3 ? '3RD PLACE' : `${pos}TH PLACE`;
    document.getElementById('finish-pos').innerText = posText;
    document.getElementById('finish-badge').innerText = pos === 1 ? '🏆 RACE CHAMPION!' : 'PODIUM FINISH!';

    document.getElementById('stat-total-time').innerText = stats.totalTimeFormatted || '00:00.000';
    document.getElementById('stat-best-lap').innerText = stats.bestLapFormatted || '00:00.000';
    document.getElementById('stat-top-speed').innerText = `${Math.round(stats.topSpeedKmh || 0)} KM/H`;
    document.getElementById('stat-drift-score').innerText = `${(stats.driftPoints || 0).toLocaleString()} PTS`;
  }
}
