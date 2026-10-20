import * as THREE from 'three';

/**
 * NitroManager.js
 * Generates glowing 3D Nitro (NOS) gas canisters along the race track.
 * Collecting a canister instantly refills the player's Nitro tank to 100%
 * and provides an immediate high-speed acceleration boost.
 */
export class NitroManager {
  constructor(scene, track) {
    this.scene = scene;
    this.track = track;
    this.canisters = [];
    this.canisterCount = 28;
    this.canisterGroup = new THREE.Group();
    this.scene.add(this.canisterGroup);

    this.setupCanisters();
  }

  setupCanisters() {
    // NOS Bottle Geometry (Cylinder + Domed Top + Valve)
    const bottleBodyGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.9, 16);
    const bottleDomeGeo = new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const bottleValveGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
    const haloRingGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 24);
    haloRingGeo.rotateX(Math.PI * 0.5);

    // Glowing Cyan Neon Materials
    const nosBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.6
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.1
    });

    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    const totalSamples = this.track.samples;
    const interval = Math.floor(totalSamples / this.canisterCount);

    for (let i = 0; i < this.canisterCount; i++) {
      const sampleIdx = (i * interval + Math.floor(interval * 0.5)) % totalSamples;
      const pt = this.track.points[sampleIdx];
      const norm = this.track.normals[sampleIdx];

      // Alternate left, center, right
      const side = (i % 3 === 0) ? 0 : (i % 3 === 1) ? 3.8 : -3.8;
      const pos = pt.clone().addScaledVector(norm, side);
      pos.y += 0.95;

      const singleGroup = new THREE.Group();

      const body = new THREE.Mesh(bottleBodyGeo, nosBodyMat);
      body.castShadow = true;
      singleGroup.add(body);

      const dome = new THREE.Mesh(bottleDomeGeo, nosBodyMat);
      dome.position.y = 0.45;
      singleGroup.add(dome);

      const valve = new THREE.Mesh(bottleValveGeo, chromeMat);
      valve.position.y = 0.85;
      singleGroup.add(valve);

      const halo = new THREE.Mesh(haloRingGeo, haloMat);
      halo.position.y = 0.1;
      singleGroup.add(halo);

      // Light glow
      const glowLight = new THREE.PointLight(0x0ea5e9, 1.8, 4.0);
      glowLight.position.y = 0.5;
      singleGroup.add(glowLight);

      singleGroup.position.copy(pos);
      this.canisterGroup.add(singleGroup);

      this.canisters.push({
        group: singleGroup,
        basePos: pos.clone(),
        haloMesh: halo,
        active: true,
        rotationSpeed: 3.0 + (i % 2) * 0.5,
        bobOffset: i * 0.3
      });
    }
  }

  update(delta, playerCar, onNitroCollected) {
    const time = performance.now() * 0.001;
    const playerPos = playerCar ? playerCar.physics.position : null;

    for (let i = 0; i < this.canisters.length; i++) {
      const c = this.canisters[i];
      if (!c.active) continue;

      // Animate rotation & bobbing
      c.group.rotation.y += c.rotationSpeed * delta;
      c.group.position.y = c.basePos.y + Math.sin(time * 4.0 + c.bobOffset) * 0.18;
      c.haloMesh.rotation.z += 2.0 * delta;

      // Collision check with player
      if (playerPos) {
        const dist = playerPos.distanceTo(c.group.position);
        if (dist < 2.8) {
          c.active = false;
          c.group.visible = false;
          if (onNitroCollected) {
            onNitroCollected(c.group.position.clone());
          }
        }
      }
    }
  }

  resetLapNitro() {
    for (let i = 0; i < this.canisters.length; i++) {
      const c = this.canisters[i];
      c.active = true;
      c.group.visible = true;
    }
  }
}
