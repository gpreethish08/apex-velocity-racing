/**
 * Menu.js
 * Controls pause overlay, controls reminder, and race podium results screen.
 */
export class MenuManager {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.setupElements();
    this.bindEvents();
  }

  setupElements() {
    this.container.innerHTML = `
      <div id="ui-screens-wrapper">
        <!-- PAUSE SCREEN -->
        <div id="pause-screen" class="menu-screen hidden">
          <div class="menu-backdrop blur"></div>
          <div class="menu-content modal-content">
            <h2 class="modal-title">RACE PAUSED</h2>
            <div class="modal-btn-list">
              <button id="btn-resume" class="btn-modal btn-primary">RESUME RACE</button>
              <button id="btn-pause-garage" class="btn-modal btn-accent">🚗 RETURN TO GARAGE</button>
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
                <span class="stat-lbl">COINS COLLECTED</span>
                <span class="stat-val stat-gold" id="stat-coins-earned">+25 🪙</span>
              </div>
            </div>

            <div class="modal-btn-list">
              <button id="btn-race-again" class="btn-primary-large">RACE AGAIN</button>
              <button id="btn-finish-garage" class="btn-modal btn-accent">RETURN TO GARAGE</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
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

    // Return to Garage from Pause
    document.getElementById('btn-pause-garage')?.addEventListener('click', () => {
      this.hidePause();
      if (this.callbacks.onReturnToGarage) this.callbacks.onReturnToGarage();
    });

    // Race Again Button
    document.getElementById('btn-race-again')?.addEventListener('click', () => {
      document.getElementById('finish-screen').classList.add('hidden');
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });

    // Return to Garage from Finish
    document.getElementById('btn-finish-garage')?.addEventListener('click', () => {
      document.getElementById('finish-screen').classList.add('hidden');
      if (this.callbacks.onReturnToGarage) this.callbacks.onReturnToGarage();
    });
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
    document.getElementById('stat-coins-earned').innerText = `+${stats.coinsEarned || 0} 🪙`;
  }
}
