import * as THREE from 'three';

/**
 * CarModelBuilder.js
 * Generates high-fidelity, realistic 3D hypercar models with dual-layer clearcoat paint,
 * carbon fiber aerodynamics, detailed drilled brake rotors, alloy rims, interior cabin,
 * and working LED headlights, taillights, and underglow.
 */
export class CarModelBuilder {
  static createCar(options = {}) {
    const {
      color = 0xd90429,          // Crimson Rosso Corsa
      secondaryColor = 0x111111, // Carbon Fiber / Black trim
      rimColor = 0xc5a059,        // Satin Bronze / Gold
      caliperColor = 0xff1e00,    // Brembo Red
      carType = 'phantom'         // 'phantom', 'viper', 'kagura'
    } = options;

    const carGroup = new THREE.Group();

    // 1. PBR Automotive Materials
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95
    });

    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.4,
      roughness: 0.35
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a101d,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.98,
      roughness: 0.1
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.85,
      metalness: 0.05
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      metalness: 0.9,
      roughness: 0.2
    });

    const brakeDiscMat = new THREE.MeshStandardMaterial({
      color: 0xa8a29e,
      metalness: 0.85,
      roughness: 0.3
    });

    const caliperMat = new THREE.MeshStandardMaterial({
      color: caliperColor,
      metalness: 0.4,
      roughness: 0.2
    });

    // Emissive materials for lights
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xebf8ff,
      emissiveIntensity: 2.8,
      roughness: 0.1
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0x330000,
      emissive: 0xff0022,
      emissiveIntensity: 2.0,
      roughness: 0.2
    });

    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0x242424,
      roughness: 0.8
    });

    // Body suspension container (for chassis roll & pitch tilt)
    const chassis = new THREE.Group();
    carGroup.add(chassis);

    // --- MAIN BODY SHELL ---
    // Lower body base
    const lowerBodyGeo = new THREE.BoxGeometry(2.1, 0.45, 4.4);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyPaintMat);
    lowerBody.position.y = 0.48;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    chassis.add(lowerBody);

    // Hood / Front Nose (tapered & angled down)
    const hoodGeo = new THREE.BoxGeometry(1.95, 0.32, 1.6);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(0, 0.58, 1.45);
    hood.rotation.x = 0.08;
    hood.castShadow = true;
    chassis.add(hood);

    // Front Air Splitter (Carbon Fiber)
    const splitterGeo = new THREE.BoxGeometry(2.15, 0.06, 0.7);
    const splitter = new THREE.Mesh(splitterGeo, carbonFiberMat);
    splitter.position.set(0, 0.22, 2.25);
    splitter.castShadow = true;
    chassis.add(splitter);

    // Front Grille Mesh
    const grilleGeo = new THREE.BoxGeometry(1.4, 0.22, 0.1);
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 0.38, 2.22);
    chassis.add(grille);

    // Cockpit Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.55, 0.62, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, bodyPaintMat);
    cabin.position.set(0, 0.95, -0.2);
    cabin.castShadow = true;
    chassis.add(cabin);

    // Windshield (Raked aerodynamic angle)
    const windshieldGeo = new THREE.PlaneGeometry(1.45, 0.85);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.05, 0.85);
    windshield.rotation.x = -Math.PI * 0.32;
    chassis.add(windshield);

    // Rear Window
    const rearWindowGeo = new THREE.PlaneGeometry(1.35, 0.95);
    const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
    rearWindow.position.set(0, 1.02, -1.25);
    rearWindow.rotation.x = Math.PI * 0.34;
    chassis.add(rearWindow);

    // Side Windows
    const sideWinGeo = new THREE.PlaneGeometry(1.7, 0.45);
    const sideWinL = new THREE.Mesh(sideWinGeo, glassMat);
    sideWinL.position.set(-0.78, 1.0, -0.2);
    sideWinL.rotation.y = -Math.PI * 0.5;
    chassis.add(sideWinL);

    const sideWinR = sideWinL.clone();
    sideWinR.position.x = 0.78;
    sideWinR.rotation.y = Math.PI * 0.5;
    chassis.add(sideWinR);

    // Side Air Intakes (mid-engine cooling ducts)
    const scoopGeo = new THREE.BoxGeometry(0.2, 0.35, 0.8);
    const scoopL = new THREE.Mesh(scoopGeo, carbonFiberMat);
    scoopL.position.set(-1.05, 0.55, -0.7);
    chassis.add(scoopL);

    const scoopR = scoopL.clone();
    scoopR.position.x = 1.05;
    chassis.add(scoopR);

    // Side Skirts (Carbon)
    const skirtGeo = new THREE.BoxGeometry(0.12, 0.08, 2.6);
    const skirtL = new THREE.Mesh(skirtGeo, carbonFiberMat);
    skirtL.position.set(-1.08, 0.26, 0.1);
    chassis.add(skirtL);

    const skirtR = skirtL.clone();
    skirtR.position.x = 1.08;
    chassis.add(skirtR);

    // Rear Haunches / Muscular Engine Deck
    const rearDeckGeo = new THREE.BoxGeometry(2.05, 0.42, 1.3);
    const rearDeck = new THREE.Mesh(rearDeckGeo, bodyPaintMat);
    rearDeck.position.set(0, 0.65, -1.55);
    rearDeck.castShadow = true;
    chassis.add(rearDeck);

    // Rear Aerodynamic GT Wing / Spoiler
    const wingGeo = new THREE.BoxGeometry(2.2, 0.06, 0.45);
    const wing = new THREE.Mesh(wingGeo, carbonFiberMat);
    wing.position.set(0, 1.32, -2.15);
    wing.rotation.x = -0.06;
    wing.castShadow = true;
    chassis.add(wing);

    // Spoiler End Plates
    const endPlateGeo = new THREE.BoxGeometry(0.04, 0.28, 0.5);
    const endPlateL = new THREE.Mesh(endPlateGeo, carbonFiberMat);
    endPlateL.position.set(-1.1, 1.32, -2.15);
    chassis.add(endPlateL);
    const endPlateR = endPlateL.clone();
    endPlateR.position.x = 1.1;
    chassis.add(endPlateR);

    // Wing Support Pylons
    const pylonGeo = new THREE.BoxGeometry(0.05, 0.45, 0.25);
    const pylonL = new THREE.Mesh(pylonGeo, chromeMat);
    pylonL.position.set(-0.55, 1.1, -2.05);
    pylonL.rotation.x = -0.2;
    chassis.add(pylonL);
    const pylonR = pylonL.clone();
    pylonR.position.x = 0.55;
    chassis.add(pylonR);

    // Rear Diffuser with aerodynamic strakes
    const diffuserGeo = new THREE.BoxGeometry(1.85, 0.2, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonFiberMat);
    diffuser.position.set(0, 0.3, -2.15);
    diffuser.rotation.x = -0.15;
    chassis.add(diffuser);

    // Quad Titanium Exhaust Outlets
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.35, 12);
    exhaustGeo.rotateX(Math.PI * 0.5);
    const exhaustPositions = [-0.4, -0.22, 0.22, 0.4];
    const exhaustMeshes = [];

    exhaustPositions.forEach(x => {
      const ex = new THREE.Mesh(exhaustGeo, chromeMat);
      ex.position.set(x, 0.38, -2.25);
      chassis.add(ex);
      exhaustMeshes.push(ex);
    });

    // Side Mirrors
    const mirrorStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6);
    mirrorStemGeo.rotateZ(Math.PI * 0.35);
    const mirrorHousingGeo = new THREE.BoxGeometry(0.25, 0.12, 0.15);

    const mirrorGroupL = new THREE.Group();
    const stemL = new THREE.Mesh(mirrorStemGeo, carbonFiberMat);
    const housingL = new THREE.Mesh(mirrorHousingGeo, bodyPaintMat);
    housingL.position.set(-0.16, 0.05, 0);
    mirrorGroupL.add(stemL);
    mirrorGroupL.add(housingL);
    mirrorGroupL.position.set(-0.85, 0.88, 0.65);
    chassis.add(mirrorGroupL);

    const mirrorGroupR = new THREE.Group();
    const stemR = new THREE.Mesh(mirrorStemGeo, carbonFiberMat);
    stemR.rotation.z = -Math.PI * 0.7;
    const housingR = new THREE.Mesh(mirrorHousingGeo, bodyPaintMat);
    housingR.position.set(0.16, 0.05, 0);
    mirrorGroupR.add(stemR);
    mirrorGroupR.add(housingR);
    mirrorGroupR.position.set(0.85, 0.88, 0.65);
    chassis.add(mirrorGroupR);

    // --- COCKPIT INTERIOR DETAILS ---
    // Steering wheel
    const steeringRimGeo = new THREE.TorusGeometry(0.18, 0.028, 8, 16);
    const steeringWheel = new THREE.Mesh(steeringRimGeo, interiorMat);
    steeringWheel.position.set(-0.35, 0.82, 0.25);
    steeringWheel.rotation.x = Math.PI * 0.2;
    chassis.add(steeringWheel);

    // Sports seats
    const seatGeo = new THREE.BoxGeometry(0.48, 0.7, 0.45);
    const seatL = new THREE.Mesh(seatGeo, interiorMat);
    seatL.position.set(-0.35, 0.75, -0.2);
    chassis.add(seatL);
    const seatR = seatL.clone();
    seatR.position.x = 0.35;
    chassis.add(seatR);

    // --- LIGHTS ---
    // Front LED Headlights
    const hlGeo = new THREE.BoxGeometry(0.42, 0.08, 0.3);
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat);
    hlLeft.position.set(-0.75, 0.58, 2.05);
    hlLeft.rotation.y = -0.15;
    chassis.add(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, headlightMat);
    hlRight.position.set(0.75, 0.58, 2.05);
    hlRight.rotation.y = 0.15;
    chassis.add(hlRight);

    // Forward Spotlights (headlamp road projection)
    const spotL = new THREE.SpotLight(0xffffff, 4.0, 60, Math.PI * 0.25, 0.5, 1.2);
    spotL.position.set(-0.75, 0.6, 2.2);
    const targetL = new THREE.Object3D();
    targetL.position.set(-0.75, 0, 30);
    carGroup.add(targetL);
    spotL.target = targetL;
    carGroup.add(spotL);

    const spotR = new THREE.SpotLight(0xffffff, 4.0, 60, Math.PI * 0.25, 0.5, 1.2);
    spotR.position.set(0.75, 0.6, 2.2);
    const targetR = new THREE.Object3D();
    targetR.position.set(0.75, 0, 30);
    carGroup.add(targetR);
    spotR.target = targetR;
    carGroup.add(spotR);

    // Rear LED Light Bar
    const rearLightGeo = new THREE.BoxGeometry(1.82, 0.08, 0.15);
    const rearLight = new THREE.Mesh(rearLightGeo, taillightMat);
    rearLight.position.set(0, 0.72, -2.2);
    chassis.add(rearLight);

    // Underglow Neon Light
    const underglowLight = new THREE.PointLight(color, 2.5, 6.0, 1.8);
    underglowLight.position.set(0, 0.15, 0);
    carGroup.add(underglowLight);

    // --- WHEEL ASSEMBLIES ---
    // Function to generate a realistic sports alloy wheel with ventilated brake rotor and caliper
    const createWheel = (isFront, isLeft) => {
      const wheelGroup = new THREE.Group();
      const wheelRadius = 0.38;
      const wheelWidth = 0.32;

      // Tire (Rubber)
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
      tireGeo.rotateZ(Math.PI * 0.5);
      const tireMesh = new THREE.Mesh(tireGeo, rubberMat);
      tireMesh.castShadow = true;
      tireMesh.receiveShadow = true;

      // Rim (Multi-spoke sports alloy)
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.78, wheelRadius * 0.78, wheelWidth * 1.02, 16);
      rimGeo.rotateZ(Math.PI * 0.5);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);

      // Spokes
      const spokeGeo = new THREE.BoxGeometry(wheelWidth * 1.03, wheelRadius * 1.45, 0.06);
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = (s / 5) * Math.PI;
        rimMesh.add(spoke);
      }

      // Center lug nut
      const lugGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelWidth * 1.05, 8);
      lugGeo.rotateZ(Math.PI * 0.5);
      const lug = new THREE.Mesh(lugGeo, chromeMat);
      rimMesh.add(lug);

      // Ventilated Brake Disc Rotor
      const discGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, 0.04, 20);
      discGeo.rotateZ(Math.PI * 0.5);
      const disc = new THREE.Mesh(discGeo, brakeDiscMat);

      // Brembo Brake Caliper (Fixed to upright - does not spin with wheel)
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.18, 0.22);
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(isLeft ? 0.04 : -0.04, wheelRadius * 0.42, 0);

      // Spinning part (Tire + Rim + Disc)
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

    // Track width and wheelbase dimensions
    const trackX = 0.98;
    const wheelY = 0.38;
    const wheelZFront = 1.35;
    const wheelZRear = -1.35;

    // Front Left & Right (with steering pivots)
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

    // Rear Left & Right (direct attachment to car)
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
        rim: rimMat
      }
    };
  }
}
