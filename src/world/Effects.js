import * as THREE from 'three';

/**
 * Effects.js
 * High-performance visual effects: dynamic tire skid marks, volumetric tire smoke,
 * exhaust backfire / nitro flames, and collision sparks.
 */
export class EffectsManager {
  constructor(scene) {
    this.scene = scene;

    // 1. Tire Smoke Particle System
    this.smokeParticles = [];
    this.maxSmoke = 160;
    this.smokeMesh = null;
    this.smokeData = [];
    this.setupTireSmoke();

    // 2. Dynamic Skid Marks
    this.maxSkidSegments = 600;
    this.skidMesh = null;
    this.skidPositions = new Float32Array(this.maxSkidSegments * 6 * 3);
    this.skidAlphas = new Float32Array(this.maxSkidSegments * 6);
    this.skidIndex = 0;
    this.lastWheelPositions = { left: null, right: null };
    this.setupSkidMarks();

    // 3. Exhaust Flames
    this.flameParticles = [];
    this.maxFlames = 40;
    this.flameMesh = null;
    this.flameData = [];
    this.setupExhaustFlames();

    // 4. Collision Sparks
    this.sparks = [];
    this.maxSparks = 80;
    this.sparkMesh = null;
    this.sparkData = [];
    this.setupSparks();
  }

  setupTireSmoke() {
    const smokeGeo = new THREE.PlaneGeometry(0.8, 0.8);
    
    // Create smoke puff texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(235, 240, 245, 0.75)');
    grad.addColorStop(0.5, 'rgba(210, 220, 230, 0.35)');
    grad.addColorStop(1, 'rgba(200, 210, 220, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const smokeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, this.maxSmoke);
    this.smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Matrix4();
    dummy.makeScale(0, 0, 0);

    for (let i = 0; i < this.maxSmoke; i++) {
      this.smokeMesh.setMatrixAt(i, dummy);
      this.smokeData.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 0.1,
        life: 0,
        maxLife: 1.0,
        opacity: 0.7
      });
    }

    this.scene.add(this.smokeMesh);
  }

  setupSkidMarks() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.skidPositions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(this.skidAlphas, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(0.08, 0.08, 0.09, vAlpha * 0.75);
        }
      `,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });

    this.skidMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.skidMesh);
  }

  setupExhaustFlames() {
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.flameMesh = new THREE.InstancedMesh(geo, mat, this.maxFlames);
    this.flameMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Matrix4();
    dummy.makeScale(0, 0, 0);

    for (let i = 0; i < this.maxFlames; i++) {
      this.flameMesh.setMatrixAt(i, dummy);
      this.flameData.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        scale: 0.1,
        life: 0,
        maxLife: 0.25
      });
    }

    this.scene.add(this.flameMesh);
  }

  setupSparks() {
    const geo = new THREE.BoxGeometry(0.06, 0.06, 0.2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      blending: THREE.AdditiveBlending
    });

    this.sparkMesh = new THREE.InstancedMesh(geo, mat, this.maxSparks);
    this.sparkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Matrix4();
    dummy.makeScale(0, 0, 0);

    for (let i = 0; i < this.maxSparks; i++) {
      this.sparkMesh.setMatrixAt(i, dummy);
      this.sparkData.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.4
      });
    }

    this.scene.add(this.sparkMesh);
  }

  emitTireSmoke(leftWheelPos, rightWheelPos, speedKmh) {
    [leftWheelPos, rightWheelPos].forEach(pos => {
      for (let i = 0; i < this.maxSmoke; i++) {
        if (!this.smokeData[i].active) {
          const d = this.smokeData[i];
          d.active = true;
          d.pos.copy(pos);
          d.pos.y += 0.2;
          d.pos.x += (Math.random() - 0.5) * 0.3;
          d.pos.z += (Math.random() - 0.5) * 0.3;
          d.vel.set((Math.random() - 0.5) * 0.8, 0.8 + Math.random() * 1.2, (Math.random() - 0.5) * 0.8);
          d.scale = 0.4;
          d.life = 0;
          d.maxLife = 0.7 + Math.random() * 0.5;
          d.opacity = 0.55;
          break;
        }
      }
    });
  }

  addSkidSegment(leftWheelPos, rightWheelPos, slipIntensity) {
    if (!this.lastWheelPositions.left) {
      this.lastWheelPositions.left = leftWheelPos.clone();
      this.lastWheelPositions.right = rightWheelPos.clone();
      return;
    }

    const skidWidth = 0.32;
    const p1 = this.lastWheelPositions.left;
    const p2 = leftWheelPos;
    const p3 = this.lastWheelPositions.right;
    const p4 = rightWheelPos;

    // Minimum distance moved before laying down a quad
    if (p1.distanceToSquared(p2) < 0.2) return;

    this.writeSkidQuad(p1, p2, skidWidth, slipIntensity);
    this.writeSkidQuad(p3, p4, skidWidth, slipIntensity);

    this.lastWheelPositions.left.copy(leftWheelPos);
    this.lastWheelPositions.right.copy(rightWheelPos);

    this.skidMesh.geometry.attributes.position.needsUpdate = true;
    this.skidMesh.geometry.attributes.alpha.needsUpdate = true;
  }

  writeSkidQuad(startPos, endPos, width, intensity) {
    const dir = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(width * 0.5);

    const v1 = startPos.clone().sub(perp);
    const v2 = startPos.clone().add(perp);
    const v3 = endPos.clone().sub(perp);
    const v4 = endPos.clone().add(perp);

    const yLift = 0.05;
    v1.y += yLift;
    v2.y += yLift;
    v3.y += yLift;
    v4.y += yLift;

    const base = (this.skidIndex % this.maxSkidSegments) * 6;
    const pos = this.skidPositions;
    const alpha = this.skidAlphas;

    // Triangle 1: v1, v2, v3
    pos[base * 3 + 0] = v1.x; pos[base * 3 + 1] = v1.y; pos[base * 3 + 2] = v1.z;
    pos[base * 3 + 3] = v2.x; pos[base * 3 + 4] = v2.y; pos[base * 3 + 5] = v2.z;
    pos[base * 3 + 6] = v3.x; pos[base * 3 + 7] = v3.y; pos[base * 3 + 8] = v3.z;

    // Triangle 2: v2, v4, v3
    pos[base * 3 + 9] = v2.x; pos[base * 3 + 10] = v2.y; pos[base * 3 + 11] = v2.z;
    pos[base * 3 + 12] = v4.x; pos[base * 3 + 13] = v4.y; pos[base * 3 + 14] = v4.z;
    pos[base * 3 + 15] = v3.x; pos[base * 3 + 16] = v3.y; pos[base * 3 + 17] = v3.z;

    for (let k = 0; k < 6; k++) {
      alpha[base + k] = Math.min(1.0, intensity * 0.85);
    }

    this.skidIndex++;
  }

  clearSkidAnchor() {
    this.lastWheelPositions.left = null;
    this.lastWheelPositions.right = null;
  }

  emitNitroFlames(exhaustLeftPos, exhaustRightPos, carForward, isSuperNitro) {
    [exhaustLeftPos, exhaustRightPos].forEach(pos => {
      for (let i = 0; i < this.maxFlames; i++) {
        if (!this.flameData[i].active) {
          const f = this.flameData[i];
          f.active = true;
          f.pos.copy(pos);
          f.vel.copy(carForward).multiplyScalar(-14.0).add(
            new THREE.Vector3((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5)
          );
          f.scale = 0.25 + Math.random() * 0.25;
          f.life = 0;
          f.maxLife = 0.15 + Math.random() * 0.1;
          break;
        }
      }
    });
  }

  emitSparks(impactPos, impactNormal) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < this.maxSparks; j++) {
        if (!this.sparkData[j].active) {
          const s = this.sparkData[j];
          s.active = true;
          s.pos.copy(impactPos);
          s.vel.set(
            impactNormal.x * 5 + (Math.random() - 0.5) * 8,
            Math.random() * 6 + 2,
            impactNormal.z * 5 + (Math.random() - 0.5) * 8
          );
          s.life = 0;
          s.maxLife = 0.35 + Math.random() * 0.2;
          break;
        }
      }
    }
  }

  update(delta, camera) {
    const dummy = new THREE.Object3D();

    // 1. Update Smoke
    for (let i = 0; i < this.maxSmoke; i++) {
      const d = this.smokeData[i];
      if (d.active) {
        d.life += delta;
        if (d.life >= d.maxLife) {
          d.active = false;
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        } else {
          d.pos.addScaledVector(d.vel, delta);
          d.scale += delta * 2.8;
          dummy.position.copy(d.pos);
          dummy.scale.set(d.scale, d.scale, d.scale);
          if (camera) {
            dummy.lookAt(camera.position);
          }
        }
        dummy.updateMatrix();
        this.smokeMesh.setMatrixAt(i, dummy.matrix);
      }
    }
    this.smokeMesh.instanceMatrix.needsUpdate = true;

    // 2. Update Nitro Flames
    for (let i = 0; i < this.maxFlames; i++) {
      const f = this.flameData[i];
      if (f.active) {
        f.life += delta;
        if (f.life >= f.maxLife) {
          f.active = false;
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        } else {
          f.pos.addScaledVector(f.vel, delta);
          const lifeProgress = f.life / f.maxLife;
          const curScale = f.scale * (1.0 - lifeProgress * 0.7);
          dummy.position.copy(f.pos);
          dummy.scale.set(curScale, curScale, curScale * 1.8);
        }
        dummy.updateMatrix();
        this.flameMesh.setMatrixAt(i, dummy.matrix);
      }
    }
    this.flameMesh.instanceMatrix.needsUpdate = true;

    // 3. Update Sparks
    for (let i = 0; i < this.maxSparks; i++) {
      const s = this.sparkData[i];
      if (s.active) {
        s.life += delta;
        if (s.life >= s.maxLife) {
          s.active = false;
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        } else {
          s.vel.y -= 25 * delta; // Gravity
          s.pos.addScaledVector(s.vel, delta);
          dummy.position.copy(s.pos);
          dummy.scale.set(1, 1, 1);
        }
        dummy.updateMatrix();
        this.sparkMesh.setMatrixAt(i, dummy.matrix);
      }
    }
    this.sparkMesh.instanceMatrix.needsUpdate = true;
  }
}
