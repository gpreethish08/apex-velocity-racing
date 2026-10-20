import * as THREE from 'three';

/**
 * CoinManager.js
 * Generates rotating 3D gold coins along the race circuit, handles proximity collection,
 * coin bounce animation, and coin respawning each lap.
 */
export class CoinManager {
  constructor(scene, track) {
    this.scene = scene;
    this.track = track;
    this.coins = [];
    this.coinCount = 90;
    this.coinMeshGroup = new THREE.Group();
    this.scene.add(this.coinMeshGroup);

    this.setupCoins();
  }

  setupCoins() {
    // 3D Gold Coin Geometry (Cylinder with beveled look)
    const coinGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.16, 18);
    coinGeo.rotateX(Math.PI * 0.5); // Face forward initially

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0xffaa00,
      emissiveIntensity: 0.35
    });

    // Inner coin star/symbol relief
    const innerGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.19, 6);
    innerGeo.rotateX(Math.PI * 0.5);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      metalness: 0.98,
      roughness: 0.1,
      emissive: 0xffbb00,
      emissiveIntensity: 0.4
    });

    // Distribute coins in lines and racing curves around the track
    const totalSamples = this.track.samples;
    const interval = Math.floor(totalSamples / this.coinCount);

    for (let i = 0; i < this.coinCount; i++) {
      const sampleIdx = (i * interval + 10) % totalSamples;
      const pt = this.track.points[sampleIdx];
      const norm = this.track.normals[sampleIdx];

      // Place in slight sinusoidal weaving racing line
      const offset = Math.sin(i * 0.6) * 3.5;
      const coinPos = pt.clone().addScaledVector(norm, offset);
      coinPos.y += 0.85;

      const singleCoinGroup = new THREE.Group();
      const outerMesh = new THREE.Mesh(coinGeo, goldMat);
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      outerMesh.castShadow = true;
      singleCoinGroup.add(outerMesh);
      singleCoinGroup.add(innerMesh);

      singleCoinGroup.position.copy(coinPos);
      this.coinMeshGroup.add(singleCoinGroup);

      this.coins.push({
        group: singleCoinGroup,
        basePos: coinPos.clone(),
        active: true,
        rotationSpeed: 3.5 + (i % 3) * 0.5,
        bobOffset: i * 0.2
      });
    }
  }

  update(delta, playerCar, onCoinCollected) {
    const time = performance.now() * 0.001;
    const playerPos = playerCar ? playerCar.physics.position : null;

    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      if (!c.active) continue;

      // Animate: spin continuously & bob up and down
      c.group.rotation.y += c.rotationSpeed * delta;
      c.group.position.y = c.basePos.y + Math.sin(time * 3.5 + c.bobOffset) * 0.15;

      // Check collision with player car
      if (playerPos) {
        const dist = playerPos.distanceTo(c.group.position);
        if (dist < 2.6) {
          // Collect coin!
          c.active = false;
          c.group.visible = false;
          if (onCoinCollected) {
            onCoinCollected(c.group.position.clone());
          }
        }
      }
    }
  }

  resetLapCoins() {
    // Respawn collected coins when starting a new lap
    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i];
      c.active = true;
      c.group.visible = true;
    }
  }
}
