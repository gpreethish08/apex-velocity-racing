# 🏎️ APEX VELOCITY 3D — Realistic Grand Prix Racing

[![Live Website](https://img.shields.io/badge/Live_Game-apex--racing--3d.vercel.app-00dfa2?style=for-the-badge&logo=vercel)](https://apex-racing-3d.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-apex--velocity--racing-181717?style=for-the-badge&logo=github)](https://github.com/gpreethish08/apex-velocity-racing)
[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?logo=three.js)](https://threejs.org/)

🎮 **Play Live Now:** **[https://apex-racing-3d.vercel.app](https://apex-racing-3d.vercel.app)**

---

## 🌟 What's New in this Release

* **🏛️ 3D Sci-Fi Showroom Garage**: Interactive rotating turntable stage, neon circular floor rings, runway catwalk, overhead light fixtures, and real-time 360-degree car preview.
* **🚗 8 High-Performance Supercars & Inventory**:
  1. **HIDEO** (Toyota Supra MK4 - Alpine White, GT 924, Free Starter)
  2. **GR35** (Nissan GT-R Nismo - White/Carbon, GT 917, 50 🪙)
  3. **DRIVEZA** (Pagani Huayra - Sapphire Blue, GT 922, 75 🪙)
  4. **OMEN DRS** (Dodge Challenger Hellcat - Flame Orange, GT 967, 90 🪙)
  5. **DRIVON** (Bugatti Chiron W16 - Obsidian Black, GT 922, 150 🪙)
  6. **F90** (Porsche 918 Spyder - Liquid Silver, GT 938, 180 🪙)
  7. **LM900** (Ferrari SF90 Stradale - Racing Red, GT 943, 220 🪙)
  8. **SSX** (Acura NSX - Ruby Red, GT 933, 250 🪙)
* **🪙 3D Gold Coins on the Track**: Collect glowing, spinning gold coins placed all along the circuit. Each coin grants +1 🪙 with audio chime, particle sparkle FX, and floating HUD popup.
* **💰 Economy & Car Purchasing**: Persistent coin balance saved in `localStorage`. Earn coins during races and unlock new cars directly in the Showroom or Inventory!

---

## 🌟 Key Features

### 🏎️ Realistic Car Models & Graphics
* **PBR Automotive Dual-Layer Clearcoat**: High-grade `MeshPhysicalMaterial` with metallic flake, glossy clearcoat reflections, and customizable paint finishes (Rosso Corsa, Carbon Midnight, Electric Cyan, Solar Pearl).
* **Detailed Mechanical Parts**: Aerodynamic front splitter, vented hood scoops, carbon fiber side skirts, aggressive rear diffuser, GT wing with endplates, and titanium quad exhausts.
* **Working Brakes & Wheels**: Multi-spoke sports alloy rims with drilled ventilated brake discs and Brembo-style calipers that remain fixed while wheels rotate.
* **Dynamic Lighting**: Real-time directional sunlight with soft PCF shadow maps, functional LED headlights with forward road spotlights, glowing rear LED light bar with brake illumination, and customizable underglow neon.

### ⚙️ Vehicle Dynamics & Drift Physics
* **6-Speed Transmission**: Realistic gear ratios, engine RPM power band, rev limiter bounce, and automatic shifting.
* **Suspension Simulation**: Body roll during hard cornering and dive/squat pitch during heavy braking and acceleration.
* **Drifting System**: Handbrake initiation, counter-steering mechanics, slip angle tracking, and drift combo multipliers.
* **NOS Nitro Boost**: Turbocharge acceleration past 340+ KM/H with camera FOV hyperspace warp and exhaust backfire flames.
* **Dynamic Track FX**: Procedural tire smoke particle simulation, continuous rubber skid mark ribbon generator, and collision sparks.

### 🏁 Competitive AI Rivals & Circuit
* **Intelligent AI Opponents**: 3 rival hypercars with individual colorways and dynamic overtaking logic, corner braking, and collision avoidance.
* **Grand Prix Circuit**: Realistic elevation changes, chicanes, high-speed sweepers, banked turns, red/white apex kerbs, Armco barriers, grandstands, and brake marker boards.
* **Start Gantry & Race Lights**: Working 5-stage Formula-style countdown lights (Red 1-5 -> Green GO!).

### 🔊 Procedural Web Audio API Sound Engine
* 100% synthesized in real-time with zero external sound file dependencies:
  * Multi-oscillator V8/V10 engine roar modulating dynamically with RPM and throttle.
  * Turbo wastegate blow-off valve flutter on gear shifts.
  * Filtered tire screech scaling with slip angle and cornering speed.
  * Nitro boost plasma roar, wind rush, collision thuds, and countdown beeps.

### 🎥 Multi-Camera System & Day/Night Presets
* **4 Camera Modes** (Press `C`):
  1. *Chase (Far)*: High-angle cinematic follow with smooth spring lag.
  2. *Chase (Close)*: Low, aggressive arcade camera.
  3. *Cockpit (1st Person)*: Behind-the-wheel driver perspective.
  4. *Hood / Bumper*: Ultra-high-speed ground-level perspective.
* **Atmosphere Presets** (Press `V`):
  * *Daylight*: High-noon sun with crisp shadows.
  * *Golden Sunset*: Warm amber lighting and long dramatic shadows.
  * *Cyber Night*: Midnight starry sky with active streetlights and glowing headlights.

---

## 🎮 Controls

| Action | Keyboard | Gamepad | Mobile / Touch |
| :--- | :---: | :---: | :---: |
| **Accelerate** | <kbd>W</kbd> or <kbd>▲</kbd> | Right Trigger / <kbd>A</kbd> | **GAS** Button |
| **Brake / Reverse** | <kbd>S</kbd> or <kbd>▼</kbd> | Left Trigger / <kbd>B</kbd> | **BRAKE** Button |
| **Steer Left / Right** | <kbd>A</kbd> <kbd>D</kbd> or <kbd>◀</kbd> <kbd>▶</kbd> | Left Stick | **◀** **▶** Buttons |
| **Handbrake (Drift)** | <kbd>SPACE</kbd> | <kbd>X</kbd> or <kbd>RB</kbd> | **DRIFT** Button |
| **Nitro Boost** | <kbd>LEFT SHIFT</kbd> | <kbd>Y</kbd> or <kbd>LB</kbd> | **NOS** Button |
| **Change Camera** | <kbd>C</kbd> | <kbd>Select</kbd> / <kbd>D-Pad Up</kbd> | Top Camera Button |
| **Toggle Day / Night** | <kbd>V</kbd> | — | Top TOD Button |
| **Reset Car to Track** | <kbd>R</kbd> | — | — |
| **Pause / Resume** | <kbd>ESC</kbd> or <kbd>P</kbd> | <kbd>Start</kbd> | Top Pause Button |

---

## 🛠️ Project Structure

```
apex-racing-3d/
├── .github/workflows/
│   └── deploy.yml            # Automated GitHub Pages CI/CD
├── src/
│   ├── core/
│   │   ├── EnvironmentManager.js # Day/Sunset/Night lighting, sky dome & shadows
│   │   ├── Game.js               # Main game loop, race state & countdown
│   │   ├── InputManager.js       # Keyboard, Gamepad, Touch handlers
│   │   └── SoundManager.js       # Web Audio API engine sound synthesis
│   ├── entities/
│   │   ├── AICar.js              # Competitive racing rival AI
│   │   ├── CarModelBuilder.js    # Procedural PBR hypercar geometry & materials
│   │   ├── PlayerCar.js          # Player car controller & camera rig
│   │   └── VehiclePhysics.js     # Longitudinal, lateral, drift & suspension physics
│   ├── world/
│   │   ├── Effects.js            # Skid marks, tire smoke, nitro flames & sparks
│   │   ├── Track.js              # Grand Prix circuit spline, asphalt & kerbs
│   │   └── TrackDecorations.js   # Grandstands, trees, streetlamps, billboards
│   ├── ui/
│   │   ├── HUD.js                # Speedometer, tachometer, minimap radar & timers
│   │   └── Menu.js               # Start screen, car customizer & pause menu
│   └── main.js                   # Application bootstrap
├── index.html                    # Root HTML with modern HUD styling
├── vite.config.js                # Vite build config with relative paths
└── package.json                  # Dependencies and scripts
```

---

## 🚀 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [npm](https://www.npmjs.com/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gpreethish08/apex-velocity-racing.git
   cd apex-velocity-racing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` to play!

4. **Build for production:**
   ```bash
   npm run build
   ```
   Production assets will be output to the `dist/` directory.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
