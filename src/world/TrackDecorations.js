import * as THREE from 'three';

/**
 * TrackDecorations.js
 * Generates grandstands, trees, streetlamps, distance brake markers,
 * mountain backdrops, and sponsor boards.
 */
export class TrackDecorations {
  constructor(scene, track) {
    this.scene = scene;
    this.track = track;
    this.streetlights = [];

    this.buildGrandstands();
    this.buildBrakeMarkers();
    this.buildStreetLamps();
    this.buildFoliage();
    this.buildMountains();
    this.buildBillboards();
  }

  buildGrandstands() {
    // Grandstand on the right side of the main straight
    const p0 = this.track.points[20];
    const norm = this.track.normals[20];
    const tangent = this.track.tangents[20];

    const standGroup = new THREE.Group();
    const width = 80;
    const depth = 16;
    const tiers = 8;

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x88929e, roughness: 0.8 });
    const seatMatA = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 }); // Blue seats
    const seatMatB = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Amber seats
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x222a35, metalness: 0.8, roughness: 0.3 });

    // Tiered seating steps
    for (let i = 0; i < tiers; i++) {
      const stepGeo = new THREE.BoxGeometry(width, 1.2, depth / tiers);
      const stepMesh = new THREE.Mesh(stepGeo, concreteMat);
      stepMesh.position.set(0, i * 1.0 + 0.6, i * (depth / tiers) - depth * 0.5);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      standGroup.add(stepMesh);

      // Seats on step
      const seatGeo = new THREE.BoxGeometry(width - 2, 0.4, (depth / tiers) * 0.7);
      const seatMesh = new THREE.Mesh(seatGeo, i % 2 === 0 ? seatMatA : seatMatB);
      seatMesh.position.set(0, i * 1.0 + 1.3, i * (depth / tiers) - depth * 0.5);
      standGroup.add(seatMesh);
    }

    // Slanted Roof
    const roofGeo = new THREE.BoxGeometry(width + 4, 0.6, depth + 6);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, tiers * 1.0 + 5.5, 0);
    roof.rotation.x = 0.15;
    roof.castShadow = true;
    standGroup.add(roof);

    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, tiers * 1.0 + 6, 8);
    for (let x = -width * 0.45; x <= width * 0.45; x += width * 0.45) {
      const pillar = new THREE.Mesh(pillarGeo, roofMat);
      pillar.position.set(x, (tiers * 1.0 + 6) * 0.5, depth * 0.4);
      standGroup.add(pillar);
    }

    // Position alongside track
    standGroup.position.copy(p0).addScaledVector(norm, this.track.trackWidth * 0.5 + 16);
    standGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    standGroup.rotateY(-Math.PI * 0.5);

    this.scene.add(standGroup);
  }

  buildBrakeMarkers() {
    // 200m, 150m, 100m, 50m boards before major hairpin (around point 120-130)
    const markerIndex = 110;
    const distances = ['200', '150', '100', '50'];

    distances.forEach((dist, idx) => {
      const ptIdx = markerIndex + idx * 3;
      const pt = this.track.points[ptIdx % this.track.samples];
      const norm = this.track.normals[ptIdx % this.track.samples];
      const tang = this.track.tangents[ptIdx % this.track.samples];

      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 256);
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, 8, 112, 240);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dist, 64, 140);

      const tex = new THREE.CanvasTexture(canvas);
      const boardGeo = new THREE.BoxGeometry(0.1, 1.8, 1.0);
      const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
      const board = new THREE.Mesh(boardGeo, boardMat);

      board.position.copy(pt).addScaledVector(norm, -(this.track.trackWidth * 0.5 + 2.5));
      board.position.y += 1.2;
      board.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tang);
      board.castShadow = true;
      this.scene.add(board);
    });
  }

  buildStreetLamps() {
    const lampSpacing = 25; // every 25 track steps
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2b303a, metalness: 0.85, roughness: 0.3 });
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfff4db,
      emissive: 0xffe2a3,
      emissiveIntensity: 2.5,
      roughness: 0.2
    });

    const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 9.0, 8);
    const armGeo = new THREE.BoxGeometry(0.15, 0.15, 3.2);
    const headGeo = new THREE.ConeGeometry(0.45, 0.5, 8);

    for (let i = 0; i < this.track.samples; i += lampSpacing) {
      const pt = this.track.points[i];
      const norm = this.track.normals[i];
      const side = (i % (lampSpacing * 2) === 0) ? 1 : -1;

      const group = new THREE.Group();

      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 4.5;
      pole.castShadow = true;
      group.add(pole);

      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0, 8.8, side * 1.2);
      arm.rotation.x = side * 0.2;
      group.add(arm);

      const bulb = new THREE.Mesh(headGeo, bulbMat);
      bulb.position.set(0, 8.6, side * 2.5);
      group.add(bulb);

      group.position.copy(pt).addScaledVector(norm, side * (this.track.trackWidth * 0.5 + 3.5));
      group.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), norm);

      this.scene.add(group);
      this.streetlights.push(bulb);
    }
  }

  buildFoliage() {
    // Instanced Mesh for High Performance (hundreds of trees running butter-smooth at 60+ FPS)
    const treeCount = 280;

    // Pine tree foliage geometry (cone) + trunk (cylinder)
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 2.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
    const foliageGeo = new THREE.ConeGeometry(2.8, 6.5, 6);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b4317, roughness: 0.85, flatShading: true });

    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const foliageMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);

    trunkMesh.castShadow = true;
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();

    let placed = 0;
    for (let i = 0; i < treeCount; i++) {
      // Pick random track point and place tree outside track boundaries
      const idx = Math.floor(Math.random() * this.track.samples);
      const pt = this.track.points[idx];
      const norm = this.track.normals[idx];
      const side = Math.random() > 0.5 ? 1 : -1;
      const dist = this.track.trackWidth * 0.5 + 12 + Math.random() * 65;

      const posX = pt.x + norm.x * side * dist + (Math.random() - 0.5) * 15;
      const posZ = pt.z + norm.z * side * dist + (Math.random() - 0.5) * 15;
      const posY = pt.y;

      const scale = 0.75 + Math.random() * 0.7;

      // Trunk
      dummy.position.set(posX, posY + 1.25 * scale, posZ);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(placed, dummy.matrix);

      // Foliage
      dummy.position.set(posX, posY + (2.5 + 3.0) * scale, posZ);
      dummy.updateMatrix();
      foliageMesh.setMatrixAt(placed, dummy.matrix);

      placed++;
    }

    this.scene.add(trunkMesh);
    this.scene.add(foliageMesh);
  }

  buildMountains() {
    // Distant dramatic mountain peaks encircling the horizon
    const peakCount = 18;
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x2d3a4b,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });

    for (let i = 0; i < peakCount; i++) {
      const angle = (i / peakCount) * Math.PI * 2;
      const radius = 680 + (Math.sin(i * 3) * 60);
      const height = 90 + Math.random() * 110;
      const baseRadius = 140 + Math.random() * 60;

      const mountainGeo = new THREE.ConeGeometry(baseRadius, height, 7);
      const mountain = new THREE.Mesh(mountainGeo, mountainMat);

      mountain.position.set(
        Math.cos(angle) * radius,
        height * 0.45 - 20,
        Math.sin(angle) * radius
      );
      mountain.rotation.y = Math.random() * Math.PI;
      this.scene.add(mountain);
    }
  }

  buildBillboards() {
    // Dynamic racing sponsor billboards overlooking high-speed turns
    const billboardIndices = [50, 160, 220, 310];
    const sponsors = ['REDLINE PERFORMANCE', 'TURBO VORTEX', 'APEX GT TIRES', 'CARBON RACING'];
    const colors = ['#e63946', '#0284c7', '#10b981', '#f59e0b'];

    billboardIndices.forEach((trackIdx, idx) => {
      const pt = this.track.points[trackIdx];
      const norm = this.track.normals[trackIdx];
      const tang = this.track.tangents[trackIdx];

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 512, 128);

      // Top color stripe
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillRect(0, 0, 512, 12);
      ctx.fillRect(0, 116, 512, 12);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sponsors[idx], 256, 75);

      const tex = new THREE.CanvasTexture(canvas);
      const boardGeo = new THREE.BoxGeometry(18, 5, 0.4);
      const boardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
      const board = new THREE.Mesh(boardGeo, boardMat);

      // Support legs
      const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8 });
      const leg1 = new THREE.Mesh(legGeo, legMat);
      leg1.position.set(-6, -3.5, 0);
      const leg2 = new THREE.Mesh(legGeo, legMat);
      leg2.position.set(6, -3.5, 0);
      board.add(leg1);
      board.add(leg2);

      board.position.copy(pt).addScaledVector(norm, 18);
      board.position.y += 6.5;
      board.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tang);
      board.rotateY(Math.PI * 0.15);
      board.castShadow = true;

      this.scene.add(board);
    });
  }
}
