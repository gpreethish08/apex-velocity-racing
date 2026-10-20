# 🏎️ APEX VELOCITY 3D — Realistic Grand Prix Racing

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite)](https://vitejs.dev/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-blue)](https://khronos.org/webgl/)

> A next-generation 3D arcade-realistic car racing simulator built with Three.js, WebGL, and Web Audio API. Features physically based materials (PBR clearcoat paint), dynamic suspension physics (body roll & pitch), 6-speed transmission, tire smoke, dynamic skid marks, realistic AI opponents, and multi-camera perspectives.

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
