import * as THREE from 'three';

/**
 * EnvironmentManager.js
 * Manages lighting, shadows, atmospheric fog, and dynamic Day/Sunset/Night presets.
 */
export class EnvironmentManager {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.currentPresetIndex = 0;
    this.presets = ['day', 'sunset', 'night'];

    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;
    this.skyDome = null;
    this.stars = null;

    this.init();
  }

  init() {
    // Enable high-quality shadows in renderer
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // Atmospheric Fog
    this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0018);

    // Hemispheric Light (sky vs ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.hemiLight.position.set(0, 200, 0);
    this.scene.add(this.hemiLight);

    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(this.ambientLight);

    // Main Directional Sun / Moon
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    this.dirLight.position.set(150, 250, 100);
    this.dirLight.castShadow = true;

    // High quality shadow camera setup
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 800;
    
    const d = 120;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0003;
    this.dirLight.shadow.normalBias = 0.02;

    this.scene.add(this.dirLight);

    // Sky Dome
    this.buildSkyDome();
    this.buildStarField();

    // Set default day mode
    this.applyPreset('day');
  }

  buildSkyDome() {
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    this.skyUniforms = {
      topColor: { value: new THREE.Color(0x3882e8) },
      bottomColor: { value: new THREE.Color(0xd6e8ff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    const skyGeo = new THREE.SphereGeometry(900, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.skyUniforms,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);
  }

  buildStarField() {
    const starCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 850;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = Math.abs(r * Math.cos(phi)) + 50; // upper hemisphere
      positions[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.0
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  applyPreset(presetName) {
    if (presetName === 'day') {
      this.renderer.toneMappingExposure = 1.05;
      this.skyUniforms.topColor.value.setHex(0x2370db);
      this.skyUniforms.bottomColor.value.setHex(0xcfe4fc);
      this.scene.fog.color.setHex(0xcfe4fc);
      this.scene.fog.density = 0.0016;

      this.dirLight.color.setHex(0xfff8ee);
      this.dirLight.intensity = 2.4;
      this.dirLight.position.set(160, 240, 120);

      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0x444444);
      this.hemiLight.intensity = 0.75;

      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.35;

      this.stars.material.opacity = 0.0;
    } else if (presetName === 'sunset') {
      this.renderer.toneMappingExposure = 1.15;
      this.skyUniforms.topColor.value.setHex(0x30184b);
      this.skyUniforms.bottomColor.value.setHex(0xff7330);
      this.scene.fog.color.setHex(0xd4683b);
      this.scene.fog.density = 0.0022;

      this.dirLight.color.setHex(0xff843d);
      this.dirLight.intensity = 2.8;
      this.dirLight.position.set(220, 70, 160);

      this.hemiLight.color.setHex(0xffa166);
      this.hemiLight.groundColor.setHex(0x381926);
      this.hemiLight.intensity = 0.65;

      this.ambientLight.color.setHex(0xff8844);
      this.ambientLight.intensity = 0.3;

      this.stars.material.opacity = 0.2;
    } else if (presetName === 'night') {
      this.renderer.toneMappingExposure = 1.25;
      this.skyUniforms.topColor.value.setHex(0x040817);
      this.skyUniforms.bottomColor.value.setHex(0x0c142e);
      this.scene.fog.color.setHex(0x080f24);
      this.scene.fog.density = 0.0028;

      this.dirLight.color.setHex(0x7c9edb);
      this.dirLight.intensity = 0.6;
      this.dirLight.position.set(120, 220, 100);

      this.hemiLight.color.setHex(0x1e3357);
      this.hemiLight.groundColor.setHex(0x0a0f1c);
      this.hemiLight.intensity = 0.35;

      this.ambientLight.color.setHex(0x192742);
      this.ambientLight.intensity = 0.25;

      this.stars.material.opacity = 0.9;
    }
  }

  cyclePreset() {
    this.currentPresetIndex = (this.currentPresetIndex + 1) % this.presets.length;
    const name = this.presets[this.currentPresetIndex];
    this.applyPreset(name);
    return name;
  }

  update(focusPosition) {
    // Keep sun shadow frustum centered around focus target (player car)
    if (focusPosition) {
      this.dirLight.target.position.copy(focusPosition);
      this.dirLight.target.updateMatrixWorld();
      
      const offset = this.dirLight.position.clone().sub(this.dirLight.target.position).normalize().multiplyScalar(280);
      this.dirLight.position.copy(focusPosition).add(offset);
      
      if (this.skyDome) {
        this.skyDome.position.copy(focusPosition);
      }
      if (this.stars) {
        this.stars.position.copy(focusPosition);
      }
    }
  }
}
