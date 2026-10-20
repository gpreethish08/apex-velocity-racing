import * as THREE from 'three';

/**
 * CarModelBuilder.js
 * Dedicated High-Fidelity 3D Model of the Lamborghini Gallardo LP570-4 Superleggera:
 * - Aggressive razor-sharp wedge front nose with carbon fiber splitters
 * - Black Superleggera side carbon stripes & carbon aerodynamic side mirrors
 * - Mid-engine rear deck with visible V10 engine bay
 * - Fixed elevated carbon GT rear wing with end plates
 * - Quad titanium round exhausts and deep rear diffuser
 * - Titanium 5-spoke lightweight alloy wheels with drilled brake rotors & black calipers
 * - Ground contact shadow for solid road adhesion (no floating)
 */
export class CarModelBuilder {
  static createGallardoLP570(options = {}) {
    const {
      color = 0xdf1020, // Rosso Mars Racing Red (from user's photo)
      accentColor = 0x121316, // Carbon fiber / Matte black
      rimColor = 0x27272a, // Gunmetal / Titanium dark
      caliperColor = 0x18181b // Gloss black calipers
    } = options;

    const carGroup = new THREE.Group();

    // 1. High-Grade Automotive PBR Materials
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.48,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95
    });

    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.45,
      roughness: 0.35
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x070b14,
      metalness: 0.15,
      roughness: 0.05,
      transmission: 0.72,
      transparent: true,
      opacity: 0.88
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.98,
      roughness: 0.1
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.88,
      metalness: 0.05
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      metalness: 0.85,
      roughness: 0.22
    });

    const brakeDiscMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.88,
      roughness: 0.28
    });

    const caliperMat = new THREE.MeshStandardMaterial({
      color: caliperColor,
      metalness: 0.5,
      roughness: 0.2
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xebf8ff,
      emissiveIntensity: 3.8,
      roughness: 0.1
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xff0022,
      emissive: 0xff0022,
      emissiveIntensity: 3.0,
      roughness: 0.2
    });

    const engineBayMat = new THREE.MeshStandardMaterial({
      color: 0x22262e,
      metalness: 0.7,
      roughness: 0.4
    });

    // 2. Ground Contact Shadow (Firmly roots car to asphalt, eliminates any floating)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(64, 128, 12, 64, 128, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.6, 5.0);
    shadowGeo.rotateX(-Math.PI * 0.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.position.y = 0.02;
    carGroup.add(contactShadow);

    // 3. Chassis Container (For suspension roll & pitch)
    const chassis = new THREE.Group();
    carGroup.add(chassis);

    // Main Lower Tub
    const lowerBodyGeo = new THREE.BoxGeometry(2.08, 0.42, 4.35);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyPaintMat);
    lowerBody.position.y = 0.42;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    chassis.add(lowerBody);

    // --- LAMBORGHINI GALLARDO FRONT NOSE ---
    // Low, sharply angled triangular wedge hood
    const hoodGeo = new THREE.BoxGeometry(1.92, 0.28, 1.55);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(0, 0.52, 1.4);
    hood.rotation.x = 0.14; // Sharp wedge rake
    hood.castShadow = true;
    chassis.add(hood);

    // Dual Front Angular Air Intakes (Black Carbon Fiber)
    const intakeGeo = new THREE.BoxGeometry(0.75, 0.24, 0.35);
    const intakeL = new THREE.Mesh(intakeGeo, carbonFiberMat);
    intakeL.position.set(-0.55, 0.36, 2.12);
    intakeL.rotation.y = -0.12;
    chassis.add(intakeL);

    const intakeR = new THREE.Mesh(intakeGeo, carbonFiberMat);
    intakeR.position.set(0.55, 0.36, 2.12);
    intakeR.rotation.y = 0.12;
    chassis.add(intakeR);

    // Front Carbon Lower Splitter
    const splitterGeo = new THREE.BoxGeometry(2.12, 0.05, 0.65);
    const splitter = new THREE.Mesh(splitterGeo, carbonFiberMat);
    splitter.position.set(0, 0.22, 2.22);
    splitter.castShadow = true;
    chassis.add(splitter);

    // Center Lamborghini Gold Crest
    const crestGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 3);
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, 0.57, 2.05);
    crest.rotation.x = Math.PI * 0.45;
    chassis.add(crest);

    // --- COCKPIT & CANOPY ---
    const cabinGeo = new THREE.BoxGeometry(1.42, 0.56, 1.95);
    const cabin = new THREE.Mesh(cabinGeo, bodyPaintMat);
    cabin.position.set(0, 0.88, -0.25);
    cabin.castShadow = true;
    chassis.add(cabin);

    // Windshield (Extreme aerodynamic angle)
    const windshieldGeo = new THREE.PlaneGeometry(1.36, 0.88);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.98, 0.78);
    windshield.rotation.x = -Math.PI * 0.33;
    chassis.add(windshield);

    // Rear Slanted Engine Glass Cover
    const rearGlassGeo = new THREE.PlaneGeometry(1.28, 1.05);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(0, 0.92, -1.28);
    rearGlass.rotation.x = Math.PI * 0.36;
    chassis.add(rearGlass);

    // V10 Engine Cylinder Banks visible under glass
    const v10Geo = new THREE.BoxGeometry(0.7, 0.22, 0.75);
    const v10Block = new THREE.Mesh(v10Geo, engineBayMat);
    v10Block.position.set(0, 0.65, -1.25);
    chassis.add(v10Block);

    // Side Windows
    const sideWinGeo = new THREE.PlaneGeometry(1.65, 0.42);
    const sideWinL = new THREE.Mesh(sideWinGeo, glassMat);
    sideWinL.position.set(-0.72, 0.92, -0.25);
    sideWinL.rotation.y = -Math.PI * 0.5;
    chassis.add(sideWinL);

    const sideWinR = sideWinL.clone();
    sideWinR.position.x = 0.72;
    sideWinR.rotation.y = Math.PI * 0.5;
    chassis.add(sideWinR);

    // --- SUPERLEGGERA BLACK CARBON SIDE STRIPES ---
    const stripeGeo = new THREE.PlaneGeometry(2.6, 0.12);
    const stripeL = new THREE.Mesh(stripeGeo, carbonFiberMat);
    stripeL.position.set(-1.05, 0.35, 0.0);
    stripeL.rotation.y = -Math.PI * 0.5;
    chassis.add(stripeL);

    const stripeR = stripeL.clone();
    stripeR.position.x = 1.05;
    stripeR.rotation.y = Math.PI * 0.5;
    chassis.add(stripeR);

    // Carbon Fiber Side Mirrors
    const mirrorStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6);
    mirrorStemGeo.rotateZ(Math.PI * 0.35);
    const mirrorHousingGeo = new THREE.BoxGeometry(0.24, 0.12, 0.14);

    const mirrorL = new THREE.Group();
    const stemL = new THREE.Mesh(mirrorStemGeo, carbonFiberMat);
    const housingL = new THREE.Mesh(mirrorHousingGeo, carbonFiberMat);
    housingL.position.set(-0.16, 0.05, 0);
    mirrorL.add(stemL);
    mirrorL.add(housingL);
    mirrorL.position.set(-0.85, 0.82, 0.6);
    chassis.add(mirrorL);

    const mirrorR = new THREE.Group();
    const stemR = new THREE.Mesh(mirrorStemGeo, carbonFiberMat);
    stemR.rotation.z = -Math.PI * 0.7;
    const housingR = new THREE.Mesh(mirrorHousingGeo, carbonFiberMat);
    housingR.position.set(0.16, 0.05, 0);
    mirrorR.add(stemR);
    mirrorR.add(housingR);
    mirrorR.position.set(0.85, 0.82, 0.6);
    chassis.add(mirrorR);

    // Side Air Intakes (mid-engine V10 cooling)
    const scoopGeo = new THREE.BoxGeometry(0.18, 0.32, 0.75);
    const scoopL = new THREE.Mesh(scoopGeo, carbonFiberMat);
    scoopL.position.set(-1.05, 0.52, -0.75);
    chassis.add(scoopL);
    const scoopR = scoopL.clone();
    scoopR.position.x = 1.05;
    chassis.add(scoopR);

    // --- REAR HAUNCHES & SUPERLEGGERA GT WING ---
    const rearDeckGeo = new THREE.BoxGeometry(2.05, 0.38, 1.35);
    const rearDeck = new THREE.Mesh(rearDeckGeo, bodyPaintMat);
    rearDeck.position.set(0, 0.58, -1.55);
    rearDeck.castShadow = true;
    chassis.add(rearDeck);

    // Elevated Carbon Fiber GT Rear Wing Spoiler
    const wingGeo = new THREE.BoxGeometry(2.2, 0.06, 0.45);
    const wing = new THREE.Mesh(wingGeo, carbonFiberMat);
    wing.position.set(0, 1.28, -2.15);
    wing.rotation.x = -0.08;
    wing.castShadow = true;
    chassis.add(wing);

    // Wing End Plates
    const endPlateGeo = new THREE.BoxGeometry(0.04, 0.26, 0.5);
    const endPlateL = new THREE.Mesh(endPlateGeo, carbonFiberMat);
    endPlateL.position.set(-1.1, 1.28, -2.15);
    chassis.add(endPlateL);
    const endPlateR = endPlateL.clone();
    endPlateR.position.x = 1.1;
    chassis.add(endPlateR);

    // Dual Wing Support Pylons
    const pylonGeo = new THREE.BoxGeometry(0.05, 0.42, 0.22);
    const pylonL = new THREE.Mesh(pylonGeo, carbonFiberMat);
    pylonL.position.set(-0.55, 1.05, -2.05);
    pylonL.rotation.x = -0.22;
    chassis.add(pylonL);
    const pylonR = pylonL.clone();
    pylonR.position.x = 0.55;
    chassis.add(pylonR);

    // Deep Rear Carbon Diffuser with Strakes
    const diffuserGeo = new THREE.BoxGeometry(1.88, 0.22, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonFiberMat);
    diffuser.position.set(0, 0.28, -2.15);
    diffuser.rotation.x = -0.16;
    chassis.add(diffuser);

    // Quad Titanium Exhaust Tips
    const exhaustGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.32, 12);
    exhaustGeo.rotateX(Math.PI * 0.5);
    const exhaustPositions = [-0.42, -0.26, 0.26, 0.42];
    const exhaustMeshes = [];

    exhaustPositions.forEach(x => {
      const ex = new THREE.Mesh(exhaustGeo, chromeMat);
      ex.position.set(x, 0.35, -2.24);
      chassis.add(ex);
      exhaustMeshes.push(ex);
    });

    // --- LIGHTS ---
    // Front Angular Gallardo Headlights
    const hlGeo = new THREE.BoxGeometry(0.38, 0.08, 0.38);
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat);
    hlLeft.position.set(-0.72, 0.52, 1.95);
    hlLeft.rotation.y = -0.18;
    chassis.add(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, headlightMat);
    hlRight.position.set(0.72, 0.52, 1.95);
    hlRight.rotation.y = 0.18;
    chassis.add(hlRight);

    // Road Projection Spotlights
    const spotL = new THREE.SpotLight(0xffffff, 4.0, 60, Math.PI * 0.25, 0.5, 1.2);
    spotL.position.set(-0.72, 0.55, 2.1);
    const targetL = new THREE.Object3D();
    targetL.position.set(-0.72, 0, 30);
    carGroup.add(targetL);
    spotL.target = targetL;
    carGroup.add(spotL);

    const spotR = new THREE.SpotLight(0xffffff, 4.0, 60, Math.PI * 0.25, 0.5, 1.2);
    spotR.position.set(0.72, 0.55, 2.1);
    const targetR = new THREE.Object3D();
    targetR.position.set(0.72, 0, 30);
    carGroup.add(targetR);
    spotR.target = targetR;
    carGroup.add(spotR);

    // Rear Horizontal LED Taillights
    const rearLightGeo = new THREE.BoxGeometry(0.75, 0.1, 0.12);
    const rlLeft = new THREE.Mesh(rearLightGeo, taillightMat);
    rlLeft.position.set(-0.6, 0.65, -2.18);
    chassis.add(rlLeft);

    const rlRight = new THREE.Mesh(rearLightGeo, taillightMat);
    rlRight.position.set(0.6, 0.65, -2.18);
    chassis.add(rlRight);

    // Underglow Neon
    const underglowLight = new THREE.PointLight(color, 2.5, 6.0, 1.8);
    underglowLight.position.set(0, 0.15, 0);
    carGroup.add(underglowLight);

    // --- WHEEL ASSEMBLIES ---
    const createWheel = (isFront, isLeft) => {
      const wheelGroup = new THREE.Group();
      const wheelRadius = 0.38;
      const wheelWidth = 0.32;

      // Tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
      tireGeo.rotateZ(Math.PI * 0.5);
      const tireMesh = new THREE.Mesh(tireGeo, rubberMat);
      tireMesh.castShadow = true;
      tireMesh.receiveShadow = true;

      // Rim (Lightweight 5-spoke Superleggera Alloy)
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.8, wheelRadius * 0.8, wheelWidth * 1.02, 16);
      rimGeo.rotateZ(Math.PI * 0.5);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);

      // 5 Dual-Split Spokes
      const spokeGeo = new THREE.BoxGeometry(wheelWidth * 1.03, wheelRadius * 1.48, 0.05);
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = (s / 5) * Math.PI;
        rimMesh.add(spoke);
      }

      // Center Hub
      const lugGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelWidth * 1.05, 8);
      lugGeo.rotateZ(Math.PI * 0.5);
      const lug = new THREE.Mesh(lugGeo, chromeMat);
      rimMesh.add(lug);

      // Perforated Brake Rotor
      const discGeo = new THREE.CylinderGeometry(wheelRadius * 0.66, wheelRadius * 0.66, 0.04, 20);
      discGeo.rotateZ(Math.PI * 0.5);
      const disc = new THREE.Mesh(discGeo, brakeDiscMat);

      // Black Caliper
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.18, 0.22);
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(isLeft ? 0.04 : -0.04, wheelRadius * 0.42, 0);

      const spinningGroup = new THREE.Group();
      spinningGroup.add(tireMesh);
      spinningGroup.add(rimMesh);
      spinningGroup.add(disc);

      wheelGroup.add(spinningGroup);
      wheelGroup.add(caliper);

      return {
        root: wheelGroup,
        spinNode: spinningGroup,
        caliper: caliper
      };
    };

    const trackX = 0.98;
    const wheelY = 0.38; // Ground contact at y = 0.0
    const wheelZFront = 1.35;
    const wheelZRear = -1.35;

    const steerPivotFL = new THREE.Group();
    steerPivotFL.position.set(-trackX, wheelY, wheelZFront);
    const wheelFL = createWheel(true, true);
    steerPivotFL.add(wheelFL.root);
    carGroup.add(steerPivotFL);

    const steerPivotFR = new THREE.Group();
    steerPivotFR.position.set(trackX, wheelY, wheelZFront);
    const wheelFR = createWheel(true, false);
    steerPivotFR.add(wheelFR.root);
    carGroup.add(steerPivotFR);

    const wheelRLGroup = new THREE.Group();
    wheelRLGroup.position.set(-trackX, wheelY, wheelZRear);
    const wheelRL = createWheel(false, true);
    wheelRLGroup.add(wheelRL.root);
    carGroup.add(wheelRLGroup);

    const wheelRRGroup = new THREE.Group();
    wheelRRGroup.position.set(trackX, wheelY, wheelZRear);
    const wheelRR = createWheel(false, false);
    wheelRRGroup.add(wheelRR.root);
    carGroup.add(wheelRRGroup);

    return {
      group: carGroup,
      chassis: chassis,
      wheels: {
        fl: wheelFL,
        fr: wheelFR,
        rl: wheelRL,
        rr: wheelRR,
        steerFL: steerPivotFL,
        steerFR: steerPivotFR
      },
      lights: {
        headlightMat: headlightMat,
        taillightMat: taillightMat,
        spotL: spotL,
        spotR: spotR,
        underglow: underglowLight
      },
      exhaustMeshes: exhaustMeshes,
      materials: {
        body: bodyPaintMat,
        rim: rimMat,
        caliper: caliperMat,
        carbon: carbonFiberMat
      }
    };
  }

  // Alias for backward compatibility
  static createCar(options = {}) {
    return this.createGallardoLP570(options);
  }
}
