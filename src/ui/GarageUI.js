import { CARS_DATABASE, getPlayerCoins, savePlayerCoins, getOwnedCarIds, addOwnedCarId, getSelectedCarId, setSelectedCarId } from '../data/cars.js';

/**
 * GarageUI.js
 * Controls the 3D Showroom HUD (Image 2) and the full-screen Inventory / Car Catalog (Image 1).
 */
export class GarageUI {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.currentCarIndex = 0;
    this.activeFilter = 'ALL';

    // Find initial selected car index
    const savedId = getSelectedCarId();
    const idx = CARS_DATABASE.findIndex(c => c.id === savedId);
    if (idx !== -1) this.currentCarIndex = idx;

    this.setupElements();
    this.bindEvents();
    this.renderCurrentCar();
  }

  setupElements() {
    this.container.innerHTML = `
      <!-- 1. 3D SHOWROOM / GARAGE OVERLAY (Matching User Image 2) -->
      <div id="garage-view" class="garage-overlay active">
        <!-- Top Navigation Bar -->
        <div class="garage-top-bar">
          <div class="garage-title-badge">
            <span class="back-arrow-icon">◀</span>
            <span class="garage-title-text">GARAGE</span>
          </div>

          <div class="garage-top-actions">
            <button id="btn-open-inventory" class="nav-pill-btn">
              <span class="nav-icon">🚗</span> CARS & INVENTORY
            </button>
            <button id="btn-garage-sound" class="nav-pill-btn" title="Toggle Sound">
              🔊
            </button>
            <div class="currency-pill gold-pill">
              <span class="coin-icon">🪙</span>
              <span id="garage-coin-balance" class="coin-amount">0</span>
              <span class="plus-btn">+</span>
            </div>
            <div class="currency-pill cash-pill">
              <span class="cash-icon">💳</span>
              <span class="cash-amount">3 491 200</span>
              <span class="plus-btn">+</span>
            </div>
          </div>
        </div>

        <!-- Left Specifications Panel -->
        <div class="garage-specs-panel">
          <div class="specs-header-badge">
            <span class="stripes">///</span>
            <span>SPECIFICATIONS</span>
          </div>

          <div class="specs-car-header">
            <div>
              <span id="specs-car-brand" class="specs-car-brand">Mercedes-Benz</span>
              <h2 id="specs-car-name" class="specs-car-title">MERCEDES-BENZ AMG Z4</h2>
            </div>
            <div id="specs-car-rating" class="specs-car-badge">GT 940</div>
          </div>
          <p id="specs-car-desc" class="specs-car-desc">Legendary twin-turbo Japanese GT coupe.</p>

          <div class="specs-bars-list">
            <div class="spec-bar-row">
              <span class="spec-label">SPEED</span>
              <div class="spec-progress-track">
                <div id="bar-speed" class="spec-progress-fill" style="width: 78%;"></div>
              </div>
            </div>
            <div class="spec-bar-row">
              <span class="spec-label">GRIP</span>
              <div class="spec-progress-track">
                <div id="bar-grip" class="spec-progress-fill" style="width: 75%;"></div>
              </div>
            </div>
            <div class="spec-bar-row">
              <span class="spec-label">BREAK</span>
              <div class="spec-progress-track">
                <div id="bar-break" class="spec-progress-fill" style="width: 72%;"></div>
              </div>
            </div>
            <div class="spec-bar-row">
              <span class="spec-label">HANDLING</span>
              <div class="spec-progress-track">
                <div id="bar-handling" class="spec-progress-fill" style="width: 80%;"></div>
              </div>
            </div>
          </div>

          <!-- Action Button: OWNED or BUY FOR COINS -->
          <div class="specs-action-wrap">
            <button id="btn-car-action" class="btn-owned">
              <span class="check-icon">☑</span> <span id="action-btn-text">OWNED</span>
            </button>
            <div id="purchase-msg" class="purchase-msg hidden"></div>
          </div>
        </div>

        <!-- Carousel Arrows (Left & Right) -->
        <button id="btn-carousel-prev" class="carousel-nav-btn carousel-left" title="Previous Car">
          <span class="double-chevron">❮❮</span>
        </button>
        <button id="btn-carousel-next" class="carousel-nav-btn carousel-right" title="Next Car">
          <span class="double-chevron">❯❯</span>
        </button>

        <!-- Bottom Right PLAY Button -->
        <div class="garage-bottom-right">
          <button id="btn-garage-play" class="btn-play-race">
            <span>PLAY</span>
            <span class="play-arrow">▶</span>
          </button>
        </div>
      </div>

      <!-- 2. FULL INVENTORY / CAR CATALOG MODAL (Matching User Image 1) -->
      <div id="inventory-view" class="inventory-modal hidden">
        <div class="inventory-backdrop"></div>
        <div class="inventory-shell">
          <!-- Inventory Top Bar -->
          <div class="inventory-header">
            <button id="btn-close-inventory" class="inv-back-btn">
              <span class="inv-arrow">◀</span> BACK
            </button>
            <h1 class="inv-title">INVENTORY</h1>

            <div class="inv-currencies">
              <div class="currency-pill cash-pill">
                <span class="cash-icon">💳</span>
                <span>3 491 200</span>
                <span class="plus-btn">+</span>
              </div>
              <div class="currency-pill gold-pill">
                <span class="coin-icon">🪙</span>
                <span id="inv-coin-balance">0</span>
                <span class="plus-btn">+</span>
              </div>
            </div>
          </div>

          <div class="inventory-body">
            <!-- Left Category Sidebar -->
            <div class="inv-sidebar">
              <button class="inv-side-btn active"><span class="side-icon">🚗</span> CARS</button>
              <button class="inv-side-btn"><span class="side-icon">⚙️</span> RIMS</button>
              <button class="inv-side-btn"><span class="side-icon">📦</span> CONTAINERS</button>
              <button class="inv-side-btn"><span class="side-icon">💨</span> TUNING</button>
              <button class="inv-side-btn"><span class="side-icon">🎛️</span> ITEMS</button>
              <button class="inv-side-btn"><span class="side-icon">👤</span> CHARACTER</button>
              <button class="inv-side-btn"><span class="side-icon">🥋</span> WARDROBE</button>
              <button class="inv-side-btn"><span class="side-icon">🕺</span> ANIMATIONS</button>
            </div>

            <!-- Main Content Area -->
            <div class="inv-content-area">
              <!-- Class Filter Tabs -->
              <div class="inv-filters-bar">
                <div class="filter-tabs">
                  <button class="filter-tab active" data-filter="ALL">ALL</button>
                  <button class="filter-tab" data-filter="D">D</button>
                  <button class="filter-tab" data-filter="C">C</button>
                  <button class="filter-tab" data-filter="B">B</button>
                  <button class="filter-tab" data-filter="A">A</button>
                  <button class="filter-tab" data-filter="S">S</button>
                  <button class="filter-tab" data-filter="GT">GT</button>
                </div>

                <div class="sort-selector">
                  <span>SORT BY:</span> <strong>NEW</strong> ▼
                </div>
              </div>

              <!-- 8 Cars Grid Cards -->
              <div class="inv-cars-grid" id="inv-cars-grid">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Carousel navigation
    document.getElementById('btn-carousel-prev')?.addEventListener('click', () => {
      this.currentCarIndex = (this.currentCarIndex - 1 + CARS_DATABASE.length) % CARS_DATABASE.length;
      this.renderCurrentCar();
    });

    document.getElementById('btn-carousel-next')?.addEventListener('click', () => {
      this.currentCarIndex = (this.currentCarIndex + 1) % CARS_DATABASE.length;
      this.renderCurrentCar();
    });

    // Action button (OWNED / SELECT / BUY)
    document.getElementById('btn-car-action')?.addEventListener('click', () => {
      this.handleActionClick();
    });

    // PLAY button: jump into race with selected car!
    document.getElementById('btn-garage-play')?.addEventListener('click', () => {
      const car = CARS_DATABASE[this.currentCarIndex];
      const owned = getOwnedCarIds();
      if (!owned.includes(car.id)) {
        this.showPurchaseMsg('BUY THIS CAR FIRST OR CHOOSE AN OWNED CAR!', true);
        return;
      }
      setSelectedCarId(car.id);
      this.hideGarage();
      if (this.callbacks.onPlayRace) {
        this.callbacks.onPlayRace(car);
      }
    });

    // Open/Close Inventory modal
    document.getElementById('btn-open-inventory')?.addEventListener('click', () => {
      this.openInventory();
    });

    document.getElementById('btn-close-inventory')?.addEventListener('click', () => {
      this.closeInventory();
    });

    // Sound toggle
    document.getElementById('btn-garage-sound')?.addEventListener('click', () => {
      if (this.callbacks.onToggleSound) {
        const muted = this.callbacks.onToggleSound();
        const btn = document.getElementById('btn-garage-sound');
        if (btn) btn.innerText = muted ? '🔇' : '🔊';
      }
    });

    // Class filters in Inventory
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        this.renderInventoryGrid();
      });
    });
  }

  renderCurrentCar() {
    const car = CARS_DATABASE[this.currentCarIndex];
    if (!car) return;

    const coins = getPlayerCoins();
    const ownedIds = getOwnedCarIds();
    const isOwned = ownedIds.includes(car.id);
    const isSelected = getSelectedCarId() === car.id;

    // Update Coin Displays
    const coinEl = document.getElementById('garage-coin-balance');
    const invCoinEl = document.getElementById('inv-coin-balance');
    if (coinEl) coinEl.innerText = coins.toLocaleString();
    if (invCoinEl) invCoinEl.innerText = coins.toLocaleString();

    // Update Car Details
    const brandEl = document.getElementById('specs-car-brand');
    const nameEl = document.getElementById('specs-car-name');
    const ratingEl = document.getElementById('specs-car-rating');
    const descEl = document.getElementById('specs-car-desc');
    if (brandEl) brandEl.innerText = car.brand || 'OFFICIAL';
    if (nameEl) nameEl.innerText = car.name;
    if (ratingEl) ratingEl.innerText = car.rating;
    if (descEl) descEl.innerText = car.description;

    // Update Specs Progress Bars
    const barSpeed = document.getElementById('bar-speed');
    const barGrip = document.getElementById('bar-grip');
    const barBreak = document.getElementById('bar-break');
    const barHandling = document.getElementById('bar-handling');
    if (barSpeed) barSpeed.style.width = `${car.specs.speed}%`;
    if (barGrip) barGrip.style.width = `${car.specs.grip}%`;
    if (barBreak) barBreak.style.width = `${car.specs.break}%`;
    if (barHandling) barHandling.style.width = `${car.specs.handling}%`;

    // Update Action Button
    const actionBtn = document.getElementById('btn-car-action');
    const actionText = document.getElementById('action-btn-text');
    if (actionBtn && actionText) {
      if (isSelected) {
        actionBtn.className = 'btn-owned active-selected';
        actionBtn.innerHTML = `<span class="check-icon">✓</span> <span>SELECTED</span>`;
      } else if (isOwned) {
        actionBtn.className = 'btn-owned';
        actionBtn.innerHTML = `<span class="check-icon">☑</span> <span>EQUIP CAR</span>`;
      } else {
        actionBtn.className = 'btn-buy-coins';
        actionBtn.innerHTML = `<span class="coin-icon">🪙</span> <span>BUY FOR ${car.price} COINS</span>`;
      }
    }

    // Notify 3D Showroom scene to swap car model
    if (this.callbacks.onCarChanged) {
      this.callbacks.onCarChanged(car);
    }
  }

  handleActionClick() {
    const car = CARS_DATABASE[this.currentCarIndex];
    const ownedIds = getOwnedCarIds();
    const isOwned = ownedIds.includes(car.id);

    if (isOwned) {
      // Equip car
      setSelectedCarId(car.id);
      this.renderCurrentCar();
      this.showPurchaseMsg(`EQUIPPED ${car.name}!`, false);
    } else {
      // Attempt to purchase
      const coins = getPlayerCoins();
      if (coins >= car.price) {
        // Purchase successful!
        savePlayerCoins(coins - car.price);
        addOwnedCarId(car.id);
        setSelectedCarId(car.id);
        this.renderCurrentCar();
        this.showPurchaseMsg(`🎉 UNLOCKED ${car.name}!`, false);

        if (this.callbacks.onCarPurchased) {
          this.callbacks.onCarPurchased(car);
        }
      } else {
        // Not enough coins
        const needed = car.price - coins;
        this.showPurchaseMsg(`NOT ENOUGH COINS! NEED ${needed} MORE 🪙`, true);
      }
    }
  }

  openInventory() {
    const inv = document.getElementById('inventory-view');
    if (inv) {
      inv.classList.remove('hidden');
      inv.classList.add('active');
      this.renderInventoryGrid();
    }
  }

  closeInventory() {
    const inv = document.getElementById('inventory-view');
    if (inv) {
      inv.classList.remove('active');
      inv.classList.add('hidden');
    }
  }

  renderInventoryGrid() {
    const grid = document.getElementById('inv-cars-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const ownedIds = getOwnedCarIds();
    const selectedId = getSelectedCarId();

    const filtered = CARS_DATABASE.filter(c => {
      if (this.activeFilter === 'ALL') return true;
      return c.class === this.activeFilter;
    });

    filtered.forEach((car, idx) => {
      const isOwned = ownedIds.includes(car.id);
      const isSelected = selectedId === car.id;

      const card = document.createElement('div');
      card.className = `inv-car-card ${isSelected ? 'selected' : ''} ${isOwned ? 'owned' : 'locked'}`;

      // Car card header
      const headerBar = document.createElement('div');
      headerBar.className = 'card-top-strip';
      headerBar.innerHTML = `
        <div>
          <span class="card-brand-label">${car.brand}</span>
          <span class="card-car-name">${car.name}</span>
        </div>
        <span class="card-price-badge">${isOwned ? 'OWNED' : `${car.price} 🪙`}</span>
      `;
      card.appendChild(headerBar);

      // Car side silhouette preview container
      const previewArea = document.createElement('div');
      previewArea.className = 'card-preview-area';
      
      // Dynamic SVG Side Silhouette of the car with correct color
      const hexColor = '#' + car.color.toString(16).padStart(6, '0');
      const accentHex = '#' + (car.accentColor || 0x111111).toString(16).padStart(6, '0');
      const rimHex = '#' + (car.rimColor || 0xd1d5db).toString(16).padStart(6, '0');

      previewArea.innerHTML = `
        <svg class="car-svg-preview" viewBox="0 0 320 120">
          <defs>
            <linearGradient id="bodyGrad-${car.id}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="${hexColor}" stop-opacity="1" />
              <stop offset="60%" stop-color="${hexColor}" stop-opacity="0.9" />
              <stop offset="100%" stop-color="${accentHex}" stop-opacity="1" />
            </linearGradient>
            <filter id="carGlow-${car.id}">
              <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.7"/>
            </filter>
          </defs>
          <!-- Ground Pedestal Shadow -->
          <ellipse cx="160" cy="98" rx="135" ry="10" fill="rgba(0,0,0,0.55)" />
          
          <!-- Car Silhouette Outline -->
          <g filter="url(#carGlow-${car.id})">
            <!-- Main Body -->
            <path d="M 25 82 
                     C 30 70, 50 68, 75 66 
                     C 105 65, 118 45, 145 36 
                     C 175 28, 225 32, 245 52 
                     C 268 58, 290 68, 295 82 
                     L 290 88 L 25 88 Z" 
                  fill="url(#bodyGrad-${car.id})" />
            <!-- Cockpit Windows -->
            <path d="M 125 62 
                     C 135 48, 150 40, 175 36 
                     C 205 32, 225 40, 235 62 Z" 
                  fill="#0c121e" stroke="#2a3547" stroke-width="1.5" />
            <!-- Aerodynamic Wing -->
            <path d="M 25 58 L 15 54 L 18 64 L 32 64 Z" fill="${accentHex}" />
            <path d="M 12 52 L 38 52 L 35 56 L 10 56 Z" fill="${hexColor}" />
            <!-- Front Splitter -->
            <path d="M 285 86 L 305 86 L 302 90 L 285 90 Z" fill="${accentHex}" />
          </g>

          <!-- Front Wheel -->
          <circle cx="240" cy="88" r="18" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
          <circle cx="240" cy="88" r="12" fill="none" stroke="${rimHex}" stroke-width="3.5"/>
          <circle cx="240" cy="88" r="4" fill="${rimHex}"/>

          <!-- Rear Wheel -->
          <circle cx="75" cy="88" r="18" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
          <circle cx="75" cy="88" r="12" fill="none" stroke="${rimHex}" stroke-width="3.5"/>
          <circle cx="75" cy="88" r="4" fill="${rimHex}"/>
        </svg>
      `;
      card.appendChild(previewArea);

      // Rating footer
      const footerBar = document.createElement('div');
      footerBar.className = 'card-footer-strip';
      footerBar.innerHTML = `
        <span class="card-rating-tag">${car.rating}</span>
        <button class="card-select-btn">${isSelected ? 'IN USE' : (isOwned ? 'SELECT' : `BUY 🪙`)}</button>
      `;
      card.appendChild(footerBar);

      // Click to select car and view in 3D showroom
      card.addEventListener('click', () => {
        const fullIdx = CARS_DATABASE.findIndex(c => c.id === car.id);
        if (fullIdx !== -1) {
          this.currentCarIndex = fullIdx;
          this.renderCurrentCar();
          this.closeInventory();
        }
      });

      grid.appendChild(card);
    });
  }

  showPurchaseMsg(text, isError) {
    const el = document.getElementById('purchase-msg');
    if (!el) return;
    el.innerText = text;
    el.className = `purchase-msg ${isError ? 'msg-error' : 'msg-success'}`;
    el.classList.remove('hidden');
    clearTimeout(this.msgTimeout);
    this.msgTimeout = setTimeout(() => {
      el.classList.add('hidden');
    }, 2800);
  }

  showGarage() {
    const el = document.getElementById('garage-view');
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('active');
      this.renderCurrentCar();
    }
  }

  hideGarage() {
    const el = document.getElementById('garage-view');
    if (el) {
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  }
}
