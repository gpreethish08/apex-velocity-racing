import * as THREE from 'three';

/**
 * CarModelBuilder.js
 * Generates realistic 3D sports cars for real-world brands:
 * Mercedes-Benz Z4 / AMG GT (Purple Starter), Ford Mustang GT,
 * BMW M4 Competition, Ferrari F8 Tributo, Porsche 911 GT3 RS,
 * and Lamborghini Aventador SVJ.
 * Includes contact shadow plane to ensure cars are solidly planted on the road!
 */
export class CarModelBuilder {
  static createCar(options = {}) {
    const {
      color = 0x8b5cf6,          // Purple default for Mercedes-Benz Z4
      accentColor = 0x1f1f2e,
      rimColor = 0xe2e8f0,
      caliperColor = 0xfacc15,
      bodyType = 'benz'
    } = options;

    const carGroup = new THREE.Group();

    // 1. High-Fidelity Automotive Materials (Tuned so cars pop with vibrant color and never look black)
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.52,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.95
    });

    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: accentColor || 0x18181b,
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
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.08
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.88,
      metalness: 0.05
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      metalness: 0.9,
      roughness: 0.18
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

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xebf8ff,
      emissiveIntensity: 3.5,
      roughness: 0.1
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xff0022,
      emissive: 0xff0022,
      emissiveIntensity: 2.8,
      roughness: 0.2
    });

    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0x242424,
      roughness: 0.8
    });

    // 2. Realistic Ground Contact Shadow (Plants the car firmly onto the road surface)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(64, 128, 10, 64, 128, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.6, 5.0);
    shadowGeo.rotateX(-Math.PI * 0.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.position.y = 0.02; // Sits directly on tarmac
    carGroup.add(contactShadow);

    // 3. Body Chassis Container
    const chassis = new THREE.Group();
    carGroup.add(chassis);

    // Lower Main Body
    const lowerBodyGeo = new THREE.BoxGeometry(2.1, 0.44, 4.4);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyPaintMat);
    lowerBody.position.y = 0.44;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    chassis.add(lowerBody);

    // Brand Specific Tailoring
    let hoodLen = 1.6;
    let hoodAngle = 0.08;
    let cabinWidth = 1.5;

    if (bodyType === 'benz') {
      // Mercedes-Benz Panamericana grille with vertical chrome vanes & star badge
      const grilleGeo = new THREE.BoxGeometry(1.4, 0.28, 0.1);
      const grilleMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.set(0, 0.4, 2.22);
      chassis.add(grille);

      // Vertical Chrome Vanes
      for (let v = -0.55; v <= 0.55; v += 0.15) {
        const vaneGeo = new THREE.BoxGeometry(0.03, 0.24, 0.12);
        const vane = new THREE.Mesh(vaneGeo, chromeMat);
        vane.position.set(v, 0.4, 2.23);
        chassis.add(vane);
      }

      // Center Mercedes Chrome Star
      const starGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 24);
      const star = new THREE.Mesh(starGeo, chromeMat);
      star.position.set(0, 0.4, 2.25);
      chassis.add(star);
    } else if (bodyType === 'mustang') {
      // Ford Mustang Dual Hood Scoops & Racing Stripes
      hoodLen = 1.8;
      hoodAngle = 0.04;
      cabinWidth = 1.6;

      const scoopGeo = new THREE.BoxGeometry(0.35, 0.08, 0.6);
      const scoop1 = new THREE.Mesh(scoopGeo, carbonFiberMat);
      scoop1.position.set(-0.35, 0.72, 1.4);
      chassis.add(scoop1);
      const scoop2 = scoop1.clone();
      scoop2.position.x = 0.35;
      chassis.add(scoop2);

      // Dual Black Racing Stripes
      const stripeGeo = new THREE.PlaneGeometry(0.5, 4.0);
      stripeGeo.rotateX(-Math.PI * 0.5);
      const stripe = new THREE.Mesh(stripeGeo, carbonFiberMat);
      stripe.position.set(0, 0.74, 0.1);
      chassis.add(stripe);
    } else if (bodyType === 'bmw') {
      // BMW Dual Kidney Grille
      const kidneyGeo = new THREE.BoxGeometry(0.35, 0.28, 0.08);
      const kidneyL = new THREE.Mesh(kidneyGeo, carbonFiberMat);
      kidneyL.position.set(-0.24, 0.42, 2.22);
      chassis.add(kidneyL);
      const kidneyR = kidneyL.clone();
      kidneyR.position.x = 0.24;
      chassis.add(kidneyR);
    } else if (bodyType === 'ferrari') {
      // Ferrari S-Duct aerodynamic hood
      hoodAngle = 0.12;
      const ductGeo = new THREE.BoxGeometry(0.6, 0.1, 0.8);
      const duct = new THREE.Mesh(ductGeo, carbonFiberMat);
      duct.position.set(0, 0.55, 1.3);
      duct.rotation.x = -0.15;
      chassis.add(duct);
    } else if (bodyType === 'porsche') {
      // Porsche 911 Swan-neck massive GT3 RS rear wing
      const wingGeo = new THREE.BoxGeometry(2.35, 0.06, 0.55);
      const wing = new THREE.Mesh(wingGeo, carbonFiberMat);
      wing.position.set(0, 1.45, -2.15);
      wing.castShadow = true;
      chassis.add(wing);

      const swanGeo = new THREE.BoxGeometry(0.06, 0.65, 0.35);
      const swanL = new THREE.Mesh(swanGeo, carbonFiberMat);
      swanL.position.set(-0.6, 1.25, -2.05);
      swanL.rotation.x = -0.25;
      chassis.add(swanL);
      const swanR = swanL.clone();
      swanR.position.x = 0.6;
      chassis.add(swanR);
    } else if (bodyType === 'lamborghini') {
      // Lamborghini Aventador sharp stealth fighter wedge
      hoodAngle = 0.14;
      cabinWidth = 1.4;
      const wingGeo = new THREE.BoxGeometry(2.2, 0.06, 0.5);
      const wing = new THREE.Mesh(wingGeo, carbonFiberMat);
      wing.position.set(0, 1.38, -2.15);
      wing.castShadow = true;
      chassis.add(wing);
    }

    // Hood / Front Nose
    const hoodGeo = new THREE.BoxGeometry(1.95, 0.3, hoodLen);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(0, 0.54, 1.45);
    hood.rotation.x = hoodAngle;
    hood.castShadow = true;
    chassis.add(hood);

    // Front Air Splitter (Carbon)
    const splitterGeo = new THREE.BoxGeometry(2.15, 0.06, 0.7);
    const splitter = new THREE.Mesh(splitterGeo, carbonFiberMat);
    splitter.position.set(0, 0.22, 2.25);
    splitter.castShadow = true;
    chassis.add(splitter);

    // Cockpit Cabin
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, 0.58, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, bodyPaintMat);
    cabin.position.set(0, 0.92, -0.2);
    cabin.castShadow = true;
    chassis.add(cabin);

    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(cabinWidth * 0.92, 0.85);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.02, 0.85);
    windshield.rotation.x = -Math.PI * 0.32;
    chassis.add(windshield);

    // Rear Window
    const rearWindowGeo = new THREE.PlaneGeometry(cabinWidth * 0.88, 0.95);
    const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
    rearWindow.position.set(0, 0.99, -1.25);
    rearWindow.rotation.x = Math.PI * 0.34;
    chassis.add(rearWindow);

    // Side Windows
    const sideWinGeo = new THREE.PlaneGeometry(1.7, 0.42);
    const sideWinL = new THREE.Mesh(sideWinGeo, glassMat);
    sideWinL.position.set(-cabinWidth * 0.5 - 0.01, 0.96, -0.2);
    sideWinL.rotation.y = -Math.PI * 0.5;
    chassis.add(sideWinL);
    const sideWinR = sideWinL.clone();
    sideWinR.position.x = cabinWidth * 0.5 + 0.01;
    sideWinR.rotation.y = Math.PI * 0.5;
    chassis.add(sideWinR);

    // Side Air Intakes
    const scoopGeo = new THREE.BoxGeometry(0.2, 0.35, 0.8);
    const scoopL = new THREE.Mesh(scoopGeo, carbonFiberMat);
    scoopL.position.set(-1.05, 0.52, -0.7);
    chassis.add(scoopL);
    const scoopR = scoopL.clone();
    scoopR.position.x = 1.05;
    chassis.add(scoopR);

    // Rear Haunches
    const rearDeckGeo = new THREE.BoxGeometry(2.05, 0.4, 1.3);
    const rearDeck = new THREE.Mesh(rearDeckGeo, bodyPaintMat);
    rearDeck.position.set(0, 0.62, -1.55);
    rearDeck.castShadow = true;
    chassis.add(rearDeck);

    // Default Rear Wing (for benz, mustang, bmw, ferrari)
    if (bodyType !== 'porsche' && bodyType !== 'lamborghini') {
      const wingGeo = new THREE.BoxGeometry(2.1, 0.06, 0.45);
      const wing = new THREE.Mesh(wingGeo, carbonFiberMat);
      wing.position.set(0, 1.25, -2.15);
      wing.rotation.x = -0.06;
      wing.castShadow = true;
      chassis.add(wing);

      const pylonGeo = new THREE.BoxGeometry(0.05, 0.38, 0.22);
      const pylonL = new THREE.Mesh(pylonGeo, chromeMat);
      pylonL.position.set(-0.55, 1.05, -2.05);
      pylonL.rotation.x = -0.2;
      chassis.add(pylonL);
      const pylonR = pylonL.clone();
      pylonR.position.x = 0.55;
      chassis.add(pylonR);
    }

    // Rear Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.85, 0.2, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonFiberMat);
    diffuser.position.set(0, 0.28, -2.15);
    diffuser.rotation.x = -0.15;
    chassis.add(diffuser);

    // Exhausts
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.35, 12);
    exhaustGeo.rotateX(Math.PI * 0.5);
    const exhaustPositions = [-0.4, -0.22, 0.22, 0.4];
    const exhaustMeshes = [];

    exhaustPositions.forEach(x => {
      const ex = new THREE.Mesh(exhaustGeo, chromeMat);
      ex.position.set(x, 0.35, -2.25);
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
    mirrorGroupL.position.set(-0.85, 0.85, 0.65);
    chassis.add(mirrorGroupL);

    const mirrorGroupR = new THREE.Group();
    const stemR = new THREE.Mesh(mirrorStemGeo, carbonFiberMat);
    stemR.rotation.z = -Math.PI * 0.7;
    const housingR = new THREE.Mesh(mirrorHousingGeo, bodyPaintMat);
    housingR.position.set(0.16, 0.05, 0);
    mirrorGroupR.add(stemR);
    mirrorGroupR.add(housingR);
    mirrorGroupR.position.set(0.85, 0.85, 0.65);
    chassis.add(mirrorGroupR);

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.42, 0.09, 0.3);
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat);
    hlLeft.position.set(-0.75, 0.54, 2.05);
    hlLeft.rotation.y = -0.15;
    chassis.add(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, headlightMat);
    hlRight.position.set(0.75, 0.54, 2.05);
    hlRight.rotation.y = 0.15;
    chassis.add(hlRight);

    // Forward Spotlights
    const spotL = new THREE.SpotLight(0xffffff, 4.0, 60, Math.PI * 0.25, 0.5, 1.2);
    spotL.position.set(-0.75, 0.55, 2.2);
    const targetL = new THREE.Object3D();
    targetL.position.set(-0.75, 0, 30);
    carGroup.add(targetL);
    spotL.target = targetL;
    carGroup.add(spotL);

    const spotR = new THREE.SpotLight(0xffffff, 4.0, 60, Math.PI * 0.25, 0.5, 1.2);
    spotR.position.set(0.75, 0.55, 2.2);
    const targetR = new THREE.Object3D();
    targetR.position.set(0.75, 0, 30);
    carGroup.add(targetR);
    spotR.target = targetR;
    carGroup.add(spotR);

    // Rear LED Light Bar
    const rearLightGeo = new THREE.BoxGeometry(1.82, 0.08, 0.15);
    const rearLight = new THREE.Mesh(rearLightGeo, taillightMat);
    rearLight.position.set(0, 0.68, -2.2);
    chassis.add(rearLight);

    // Underglow Neon Light
    const underglowLight = new THREE.PointLight(color, 2.5, 6.0, 1.8);
    underglowLight.position.set(0, 0.15, 0);
    carGroup.add(underglowLight);

    // Wheel Assemblies (Precisely placed with wheels touching ground at y=0)
    const createWheel = (isFront, isLeft) => {
      const wheelGroup = new THREE.Group();
      const wheelRadius = 0.38;
      const wheelWidth = 0.32;

      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
      tireGeo.rotateZ(Math.PI * 0.5);
      const tireMesh = new THREE.Mesh(tireGeo, rubberMat);
      tireMesh.castShadow = true;
      tireMesh.receiveShadow = true;

      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.78, wheelRadius * 0.78, wheelWidth * 1.02, 16);
      rimGeo.rotateZ(Math.PI * 0.5);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);

      const spokeGeo = new THREE.BoxGeometry(wheelWidth * 1.03, wheelRadius * 1.45, 0.06);
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = (s / 5) * Math.PI;
        rimMesh.add(spoke);
      }

      const lugGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelWidth * 1.05, 8);
      lugGeo.rotateZ(Math.PI * 0.5);
      const lug = new THREE.Mesh(lugGeo, chromeMat);
      rimMesh.add(lug);

      const discGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, 0.04, 20);
      discGeo.rotateZ(Math.PI * 0.5);
      const disc = new THREE.Mesh(discGeo, brakeDiscMat);

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
    const wheelY = 0.38; // Bottom of wheel is at y = 0.0
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
}
