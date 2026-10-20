import * as THREE from 'three';

/**
 * EnvironmentManager.js
 * High-fidelity environment lighting with PMREM procedural reflections (fixing dark metallic materials),
 * soft PCF shadows, atmospheric sky dome, and realistic daytime lighting.
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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Soft atmospheric distance fog
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0012);

    // Hemispheric Light (bright sky light + warm ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x384a32, 1.2);
    this.hemiLight.position.set(0, 200, 0);
    this.scene.add(this.hemiLight);

    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    // Main Directional Sun
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    this.dirLight.position.set(160, 260, 120);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 900;
    
    const d = 140;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0002;
    this.dirLight.shadow.normalBias = 0.02;

    this.scene.add(this.dirLight);

    // Build Sky Dome & Environment Map
    this.buildSkyDome();
    this.buildStarField();
    this.setupEnvironmentMap();

    this.applyPreset('day');
  }

  setupEnvironmentMap() {
    // Generate reflection map for all metallic & physical materials
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      
      // Skybox gradient inside envScene
      const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const fragmentShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          vec3 sky = mix(vec3(0.5, 0.75, 1.0), vec3(0.15, 0.45, 0.9), max(dir.y, 0.0));
          vec3 ground = mix(vec3(0.3, 0.35, 0.3), vec3(0.1, 0.15, 0.1), -min(dir.y, 0.0));
          vec3 col = dir.y >= 0.0 ? sky : ground;
          // Sun highlight
          float sun = max(dot(dir, normalize(vec3(1.0, 1.5, 0.8))), 0.0);
          col += vec3(1.0, 0.95, 0.8) * pow(sun, 64.0) * 4.0;
          gl_FragColor = vec4(col, 1.0);
        }
      `;

      const sphereGeo = new THREE.SphereGeometry(100, 16, 16);
      const sphereMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      envScene.add(mesh);

      const renderTarget = pmremGenerator.fromScene(envScene);
      this.scene.environment = renderTarget.texture;
    } catch (e) {
      console.warn('Could not generate PMREM envMap:', e);
    }
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
      topColor: { value: new THREE.Color(0x1d4ed8) },
      bottomColor: { value: new THREE.Color(0xbae6fd) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    const skyGeo = new THREE.SphereGeometry(950, 32, 20);
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
      positions[i + 1] = Math.abs(r * Math.cos(phi)) + 50;
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
      this.renderer.toneMappingExposure = 1.28;
      this.skyUniforms.topColor.value.setHex(0x1d4ed8); // Bright azure blue
      this.skyUniforms.bottomColor.value.setHex(0xe0f2fe); // Pale sky horizon
      this.scene.fog.color.setHex(0xbfe0fe);
      this.scene.fog.density = 0.0010;

      this.dirLight.color.setHex(0xfffaed);
      this.dirLight.intensity = 3.0;
      this.dirLight.position.set(160, 260, 120);

      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0x384a32);
      this.hemiLight.intensity = 1.2;

      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.85;

      this.stars.material.opacity = 0.0;
    } else if (presetName === 'sunset') {
      this.renderer.toneMappingExposure = 1.25;
      this.skyUniforms.topColor.value.setHex(0x4a154b);
      this.skyUniforms.bottomColor.value.setHex(0xf97316);
      this.scene.fog.color.setHex(0xe87a38);
      this.scene.fog.density = 0.0016;

      this.dirLight.color.setHex(0xffaa5e);
      this.dirLight.intensity = 3.2;
      this.dirLight.position.set(220, 80, 160);

      this.hemiLight.color.setHex(0xfda4af);
      this.hemiLight.groundColor.setHex(0x381926);
      this.hemiLight.intensity = 0.9;

      this.ambientLight.color.setHex(0xffa166);
      this.ambientLight.intensity = 0.6;

      this.stars.material.opacity = 0.2;
    } else if (presetName === 'night') {
      this.renderer.toneMappingExposure = 1.35;
      this.skyUniforms.topColor.value.setHex(0x060919);
      this.skyUniforms.bottomColor.value.setHex(0x0f172a);
      this.scene.fog.color.setHex(0x0d1527);
      this.scene.fog.density = 0.0022;

      this.dirLight.color.setHex(0x93c5fd);
      this.dirLight.intensity = 1.2;
      this.dirLight.position.set(120, 220, 100);

      this.hemiLight.color.setHex(0x38bdf8);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.hemiLight.intensity = 0.6;

      this.ambientLight.color.setHex(0x334155);
      this.ambientLight.intensity = 0.55;

      this.stars.material.opacity = 0.95;
    }
  }

  cyclePreset() {
    this.currentPresetIndex = (this.currentPresetIndex + 1) % this.presets.length;
    const name = this.presets[this.currentPresetIndex];
    this.applyPreset(name);
    return name;
  }

  update(focusPosition) {
    if (focusPosition) {
      this.dirLight.target.position.copy(focusPosition);
      this.dirLight.target.updateMatrixWorld();
      
      const offset = this.dirLight.position.clone().sub(this.dirLight.target.position).normalize().multiplyScalar(280);
      this.dirLight.position.copy(focusPosition).add(offset);
      
      if (this.skyDome) this.skyDome.position.copy(focusPosition);
      if (this.stars) this.stars.position.copy(focusPosition);
    }
  }
}
