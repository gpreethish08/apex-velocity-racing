import * as THREE from 'three';

/**
 * Track.js
 * Builds a realistic Grand Prix race circuit with procedural asphalt,
 * red-and-white apex kerbs, guardrails, tire barriers, and starting gantry.
 */
export class Track {
  constructor(scene) {
    this.scene = scene;
    this.trackWidth = 22.0; // Wide realistic Grand Prix track
    this.curve = null;
    this.samples = 400;
    this.length = 0;
    
    // Road boundaries for collision / off-road detection
    this.points = [];
    this.tangents = [];
    this.normals = [];
    this.binormals = [];

    this.roadMesh = null;
    this.kerbsMesh = null;
    this.barriersMesh = null;
    this.gantryGroup = null;
    this.startingLights = [];

    this.buildTrackSpline();
    this.generateTrackGeometry();
    this.buildStartingGantry();
  }

  buildTrackSpline() {
    // 3D control points for an exciting Grand Prix circuit with elevation and high-speed turns
    const rawPoints = [
      new THREE.Vector3(0, 0, 0),         // Start / Finish straight
      new THREE.Vector3(0, 0, 140),       // Main straight full throttle
      new THREE.Vector3(20, 1.5, 260),    // Gentle rise into braking zone
      new THREE.Vector3(80, 2.0, 340),    // Turn 1 sweeping right
      new THREE.Vector3(180, 1.5, 380),   // High speed arc
      new THREE.Vector3(280, 0.5, 340),   // Turn 2 exit
      new THREE.Vector3(340, 0, 240),     // Short straight
      new THREE.Vector3(380, -1.0, 140),  // Dip into chicane
      new THREE.Vector3(340, -1.5, 60),   // Left chicane apex
      new THREE.Vector3(360, -1.0, -40),  // Right chicane exit
      new THREE.Vector3(420, 0, -140),    // Accelerating toward hairpin
      new THREE.Vector3(430, 1.0, -260),  // Heavy braking zone
      new THREE.Vector3(370, 1.5, -360),  // Hairpin entry
      new THREE.Vector3(270, 2.0, -390),  // Hairpin apex
      new THREE.Vector3(180, 1.5, -340),  // Hairpin exit
      new THREE.Vector3(130, 0.5, -240),  // S-curve 1
      new THREE.Vector3(70, 0, -170),     // S-curve 2
      new THREE.Vector3(20, -0.5, -110),  // S-curve exit
      new THREE.Vector3(-40, 0, -180),    // Sweeping technical left
      new THREE.Vector3(-140, 1.0, -220), // Mid-turn
      new THREE.Vector3(-240, 1.5, -180), // High banking turn
      new THREE.Vector3(-280, 1.0, -80),  // Banked arc
      new THREE.Vector3(-250, 0.5, 30),   // Back into infield
      new THREE.Vector3(-170, 0, 110),    // Fast left-hander
      new THREE.Vector3(-90, 0, 60),      // Final corner approach
      new THREE.Vector3(-30, 0, -40),     // Final corner apex into main straight
    ];

    this.curve = new THREE.CatmullRomCurve3(rawPoints, true, 'centripetal', 0.5);
    this.length = this.curve.getLength();

    // Precompute sample frames
    const step = 1 / this.samples;
    for (let i = 0; i < this.samples; i++) {
      const u = i * step;
      const pt = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();
      
      // Up vector
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      this.points.push(pt);
      this.tangents.push(tangent);
      this.normals.push(normal);
      this.binormals.push(binormal);
    }
  }

  generateTrackGeometry() {
    const halfWidth = this.trackWidth * 0.5;
    const kerbWidth = 2.0;
    const runoffWidth = 12.0;

    // 1. Asphalt Road Geometry
    const roadPositions = [];
    const roadNormals = [];
    const roadUvs = [];
    const roadIndices = [];

    // 2. Kerbs (Apex rumble strips)
    const kerbPositions = [];
    const kerbNormals = [];
    const kerbUvs = [];
    const kerbIndices = [];

    // 3. Grass / Runoff terrain
    const grassPositions = [];
    const grassNormals = [];
    const grassUvs = [];
    const grassIndices = [];

    // 4. Armco Barriers
    const barrierPositions = [];
    const barrierNormals = [];
    const barrierUvs = [];
    const barrierIndices = [];

    const n = this.samples;

    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const pt = this.points[idx];
      const norm = this.normals[idx];
      const up = this.binormals[idx];
      const u = i / n;

      // Road left and right
      const leftPt = pt.clone().addScaledVector(norm, -halfWidth);
      const rightPt = pt.clone().addScaledVector(norm, halfWidth);

      // Road vertices (2 per cross section)
      roadPositions.push(leftPt.x, leftPt.y + 0.05, leftPt.z);
      roadPositions.push(rightPt.x, rightPt.y + 0.05, rightPt.z);

      roadNormals.push(up.x, up.y, up.z);
      roadNormals.push(up.x, up.y, up.z);

      roadUvs.push(0, u * 50);
      roadUvs.push(1, u * 50);

      // Kerb vertices (Inner left kerb, Outer right kerb)
      const kerbLeftOuter = leftPt.clone().addScaledVector(norm, -kerbWidth);
      const kerbRightOuter = rightPt.clone().addScaledVector(norm, kerbWidth);

      kerbPositions.push(kerbLeftOuter.x, kerbLeftOuter.y + 0.12, kerbLeftOuter.z);
      kerbPositions.push(leftPt.x, leftPt.y + 0.06, leftPt.z);
      kerbPositions.push(rightPt.x, rightPt.y + 0.06, rightPt.z);
      kerbPositions.push(kerbRightOuter.x, kerbRightOuter.y + 0.12, kerbRightOuter.z);

      for (let k = 0; k < 4; k++) {
        kerbNormals.push(up.x, up.y, up.z);
      }
      kerbUvs.push(0, u * 120);
      kerbUvs.push(1, u * 120);
      kerbUvs.push(0, u * 120);
      kerbUvs.push(1, u * 120);

      // Grass Runoff
      const grassLeft = kerbLeftOuter.clone().addScaledVector(norm, -runoffWidth);
      const grassRight = kerbRightOuter.clone().addScaledVector(norm, runoffWidth);

      grassPositions.push(grassLeft.x, grassLeft.y - 0.2, grassLeft.z);
      grassPositions.push(kerbLeftOuter.x, kerbLeftOuter.y, kerbLeftOuter.z);
      grassPositions.push(kerbRightOuter.x, kerbRightOuter.y, kerbRightOuter.z);
      grassPositions.push(grassRight.x, grassRight.y - 0.2, grassRight.z);

      for (let g = 0; g < 4; g++) {
        grassNormals.push(0, 1, 0);
      }
      grassUvs.push(0, u * 30);
      grassUvs.push(0.3, u * 30);
      grassUvs.push(0.7, u * 30);
      grassUvs.push(1.0, u * 30);

      // Barriers at outer perimeter
      const barrierBaseLeft = kerbLeftOuter.clone().addScaledVector(norm, -1.2);
      const barrierTopLeft = barrierBaseLeft.clone().add(new THREE.Vector3(0, 1.2, 0));
      const barrierBaseRight = kerbRightOuter.clone().addScaledVector(norm, 1.2);
      const barrierTopRight = barrierBaseRight.clone().add(new THREE.Vector3(0, 1.2, 0));

      barrierPositions.push(barrierBaseLeft.x, barrierBaseLeft.y, barrierBaseLeft.z);
      barrierPositions.push(barrierTopLeft.x, barrierTopLeft.y, barrierTopLeft.z);
      barrierPositions.push(barrierBaseRight.x, barrierBaseRight.y, barrierBaseRight.z);
      barrierPositions.push(barrierTopRight.x, barrierTopRight.y, barrierTopRight.z);

      barrierNormals.push(norm.x, 0, norm.z);
      barrierNormals.push(norm.x, 0, norm.z);
      barrierNormals.push(-norm.x, 0, -norm.z);
      barrierNormals.push(-norm.x, 0, -norm.z);

      barrierUvs.push(0, u * 60);
      barrierUvs.push(1, u * 60);
      barrierUvs.push(0, u * 60);
      barrierUvs.push(1, u * 60);

      // Triangles (indices)
      if (i < n) {
        // Road quads
        const r1 = i * 2;
        const r2 = (i + 1) * 2;
        roadIndices.push(r1, r2, r1 + 1);
        roadIndices.push(r1 + 1, r2, r2 + 1);

        // Kerb left quads
        const k1 = i * 4;
        const k2 = (i + 1) * 4;
        kerbIndices.push(k1, k2, k1 + 1);
        kerbIndices.push(k1 + 1, k2, k2 + 1);
        // Kerb right quads
        kerbIndices.push(k1 + 2, k2 + 2, k1 + 3);
        kerbIndices.push(k1 + 3, k2 + 2, k2 + 3);

        // Grass quads
        const g1 = i * 4;
        const g2 = (i + 1) * 4;
        grassIndices.push(g1, g2, g1 + 1);
        grassIndices.push(g1 + 1, g2, g2 + 1);
        grassIndices.push(g1 + 2, g2 + 2, g1 + 3);
        grassIndices.push(g1 + 3, g2 + 2, g2 + 3);

        // Barrier quads
        const b1 = i * 4;
        const b2 = (i + 1) * 4;
        // Left barrier facing inward
        barrierIndices.push(b1, b1 + 1, b2);
        barrierIndices.push(b1 + 1, b2 + 1, b2);
        // Right barrier facing inward
        barrierIndices.push(b2 + 2, b2 + 3, b1 + 2);
        barrierIndices.push(b2 + 3, b1 + 3, b1 + 2);
      }
    }

    // --- Build Road Mesh ---
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);

    const roadTexture = this.createRoadTexture();
    const roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.75,
      metalness: 0.1,
    });
    this.roadMesh = new THREE.Mesh(roadGeo, roadMaterial);
    this.roadMesh.receiveShadow = true;
    this.scene.add(this.roadMesh);

    // --- Build Kerb Mesh ---
    const kerbGeo = new THREE.BufferGeometry();
    kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbPositions, 3));
    kerbGeo.setAttribute('normal', new THREE.Float32BufferAttribute(kerbNormals, 3));
    kerbGeo.setAttribute('uv', new THREE.Float32BufferAttribute(kerbUvs, 2));
    kerbGeo.setIndex(kerbIndices);

    const kerbTexture = this.createKerbTexture();
    const kerbMaterial = new THREE.MeshStandardMaterial({
      map: kerbTexture,
      roughness: 0.6,
      metalness: 0.05,
    });
    this.kerbsMesh = new THREE.Mesh(kerbGeo, kerbMaterial);
    this.kerbsMesh.receiveShadow = true;
    this.scene.add(this.kerbsMesh);

    // --- Build Grass / Runoff Mesh ---
    const grassGeo = new THREE.BufferGeometry();
    grassGeo.setAttribute('position', new THREE.Float32BufferAttribute(grassPositions, 3));
    grassGeo.setAttribute('normal', new THREE.Float32BufferAttribute(grassNormals, 3));
    grassGeo.setAttribute('uv', new THREE.Float32BufferAttribute(grassUvs, 2));
    grassGeo.setIndex(grassIndices);

    const grassTexture = this.createGrassTexture();
    const grassMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.9,
      metalness: 0.0,
      color: 0x3d702d
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMaterial);
    grassMesh.receiveShadow = true;
    this.scene.add(grassMesh);

    // --- Build Barriers Mesh ---
    const barrierGeo = new THREE.BufferGeometry();
    barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierPositions, 3));
    barrierGeo.setAttribute('normal', new THREE.Float32BufferAttribute(barrierNormals, 3));
    barrierGeo.setAttribute('uv', new THREE.Float32BufferAttribute(barrierUvs, 2));
    barrierGeo.setIndex(barrierIndices);

    const barrierTexture = this.createBarrierTexture();
    const barrierMaterial = new THREE.MeshStandardMaterial({
      map: barrierTexture,
      roughness: 0.35,
      metalness: 0.8,
    });
    this.barriersMesh = new THREE.Mesh(barrierGeo, barrierMaterial);
    this.barriersMesh.castShadow = true;
    this.barriersMesh.receiveShadow = true;
    this.scene.add(this.barriersMesh);

    // Add large terrain plane surrounding the track
    const terrainGeo = new THREE.PlaneGeometry(2400, 2400, 64, 64);
    terrainGeo.rotateX(-Math.PI * 0.5);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x274a1e,
      roughness: 0.95,
      metalness: 0.0
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = -0.5;
    terrain.receiveShadow = true;
    this.scene.add(terrain);
  }

  createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich dark gray Grand Prix asphalt
    ctx.fillStyle = '#26292e';
    ctx.fillRect(0, 0, 512, 512);

    // Realistic aggregate gravel speckles
    for (let i = 0; i < 22000; i++) {
      const g = Math.floor(35 + Math.random() * 25);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }

    // Racing tire groove rubber lines (where high-speed tires lay rubber)
    ctx.fillStyle = 'rgba(12, 14, 18, 0.55)';
    ctx.fillRect(100, 0, 95, 512);
    ctx.fillRect(317, 0, 95, 512);

    // Solid white outer track boundaries
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 0, 14, 512);
    ctx.fillRect(482, 0, 14, 512);

    // Center double yellow dashed lines (High-visibility motorsport style)
    ctx.fillStyle = '#facc15';
    for (let y = 0; y < 512; y += 48) {
      ctx.fillRect(248, y, 7, 28);
      ctx.fillRect(257, y, 7, 28);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    return tex;
  }

  createKerbTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Red and white alternating diagonal stripes
    for (let y = 0; y < 256; y += 64) {
      ctx.fillStyle = '#d62828'; // Racing Red
      ctx.fillRect(0, y, 128, 32);
      ctx.fillStyle = '#fdfdfd'; // Pure White
      ctx.fillRect(0, y + 32, 128, 32);
    }

    // Weathering shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, 20, 256);
    ctx.fillRect(108, 0, 20, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a6627';
    ctx.fillRect(0, 0, 256, 256);

    // Grass texture variations
    for (let i = 0; i < 4000; i++) {
      const g = Math.floor(80 + Math.random() * 45);
      ctx.fillStyle = `rgb(${Math.floor(g*0.6)}, ${g}, ${Math.floor(g*0.35)})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createBarrierTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Corrugated metal guardrail gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0.0, '#78828c');
    grad.addColorStop(0.3, '#dce3eb');
    grad.addColorStop(0.5, '#5c646d');
    grad.addColorStop(0.8, '#dce3eb');
    grad.addColorStop(1.0, '#78828c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);

    // High performance sponsor logo branding
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APEX RACING', 140, 75);

    ctx.fillStyle = '#f1faee';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('HYPERDRIVE', 380, 75);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  buildStartingGantry() {
    this.gantryGroup = new THREE.Group();

    // Position at start line (point 0)
    const p0 = this.points[0];
    const norm = this.normals[0];
    const halfWidth = this.trackWidth * 0.5 + 3.0;

    // Truss pillars
    const pillarGeo = new THREE.BoxGeometry(0.8, 8.5, 0.8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e242b, metalness: 0.9, roughness: 0.2 });

    const leftPillar = new THREE.Mesh(pillarGeo, metalMat);
    leftPillar.position.copy(p0).addScaledVector(norm, -halfWidth);
    leftPillar.position.y += 4.25;
    leftPillar.castShadow = true;

    const rightPillar = new THREE.Mesh(pillarGeo, metalMat);
    rightPillar.position.copy(p0).addScaledVector(norm, halfWidth);
    rightPillar.position.y += 4.25;
    rightPillar.castShadow = true;

    // Cross beam
    const beamLength = halfWidth * 2 + 1.6;
    const beamGeo = new THREE.BoxGeometry(beamLength, 1.4, 1.2);
    const beam = new THREE.Mesh(beamGeo, metalMat);
    beam.position.copy(p0);
    beam.position.y += 7.8;
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), norm);

    // Checkered line on the road
    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = 256;
    checkCanvas.height = 64;
    const cctx = checkCanvas.getContext('2d');
    for (let x = 0; x < 256; x += 32) {
      for (let y = 0; y < 64; y += 32) {
        cctx.fillStyle = (Math.floor(x/32) + Math.floor(y/32)) % 2 === 0 ? '#ffffff' : '#111111';
        cctx.fillRect(x, y, 32, 32);
      }
    }
    const checkTex = new THREE.CanvasTexture(checkCanvas);
    const checkGeo = new THREE.PlaneGeometry(this.trackWidth, 2.5);
    checkGeo.rotateX(-Math.PI * 0.5);
    const checkMat = new THREE.MeshStandardMaterial({ map: checkTex, roughness: 0.7 });
    const checkMesh = new THREE.Mesh(checkGeo, checkMat);
    checkMesh.position.copy(p0);
    checkMesh.position.y += 0.08;
    checkMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), norm);
    checkMesh.rotateY(Math.PI * 0.5);

    // LED Starting Lights cluster
    const lightFrameGeo = new THREE.BoxGeometry(5.0, 1.0, 0.4);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const lightFrame = new THREE.Mesh(lightFrameGeo, frameMat);
    lightFrame.position.copy(p0);
    lightFrame.position.y += 6.5;
    lightFrame.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), norm);

    this.startingLights = [];
    const lightGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 16);
    lightGeo.rotateX(Math.PI * 0.5);

    for (let i = -2; i <= 2; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x220000,
        emissive: 0x000000,
        roughness: 0.2
      });
      const lightMesh = new THREE.Mesh(lightGeo, mat);
      lightMesh.position.set(i * 0.9, 0, 0.22);
      lightFrame.add(lightMesh);
      this.startingLights.push(lightMesh);
    }

    this.gantryGroup.add(leftPillar);
    this.gantryGroup.add(rightPillar);
    this.gantryGroup.add(beam);
    this.gantryGroup.add(checkMesh);
    this.gantryGroup.add(lightFrame);

    this.scene.add(this.gantryGroup);
  }

  setStartingLights(stage) {
    // stage: 0 = off, 1 = 1 red, 2 = 2 red, 3 = 3 red, 4 = 4 red, 5 = 5 red, 6 = all green (GO!)
    this.startingLights.forEach((light, idx) => {
      if (stage === 0) {
        light.material.color.setHex(0x220000);
        light.material.emissive.setHex(0x000000);
      } else if (stage >= 1 && stage <= 5) {
        if (idx < stage) {
          light.material.color.setHex(0xff1111);
          light.material.emissive.setHex(0xff0000);
          light.material.emissiveIntensity = 2.5;
        } else {
          light.material.color.setHex(0x220000);
          light.material.emissive.setHex(0x000000);
        }
      } else if (stage === 6) {
        light.material.color.setHex(0x00ff44);
        light.material.emissive.setHex(0x00ff22);
        light.material.emissiveIntensity = 3.0;
      }
    });
  }

  /**
   * Find closest progress t on track and distance from centerline.
   */
  getTrackProgress(worldPos) {
    let closestDistSq = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < this.samples; i++) {
      const dSq = this.points[i].distanceToSquared(worldPos);
      if (dSq < closestDistSq) {
        closestDistSq = dSq;
        closestIndex = i;
      }
    }

    const t = closestIndex / this.samples;
    const pt = this.points[closestIndex];
    const norm = this.normals[closestIndex];

    // Signed offset from center line: positive = right, negative = left
    const diff = new THREE.Vector3().subVectors(worldPos, pt);
    const lateralOffset = diff.dot(norm);

    return {
      t,
      index: closestIndex,
      centerPoint: pt,
      tangent: this.tangents[closestIndex],
      lateralOffset,
      isOnTrack: Math.abs(lateralOffset) <= this.trackWidth * 0.5,
      isOnKerb: Math.abs(lateralOffset) > this.trackWidth * 0.5 && Math.abs(lateralOffset) <= (this.trackWidth * 0.5 + 1.4),
      distanceToCenter: Math.abs(lateralOffset)
    };
  }

  getPointAtProgress(t) {
    return this.curve.getPointAt((t % 1 + 1) % 1);
  }

  getTangentAtProgress(t) {
    return this.curve.getTangentAt((t % 1 + 1) % 1).normalize();
  }
}
