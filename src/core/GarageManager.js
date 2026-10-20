import * as THREE from 'three';
import { CarModelBuilder } from '../entities/CarModelBuilder.js';

/**
 * GarageManager.js
 * Builds and coordinates the 3D Sci-Fi Showroom Stage (Image 2) with rotating turntable,
 * neon floor rings, overhead light fixtures, and real-time car model inspection.
 */
export class GarageManager {
  constructor(scene) {
    this.scene = scene;
    this.garageGroup = new THREE.Group();
    this.turntable = null;
    this.carHolder = null;
    this.currentCarMesh = null;
    this.active = false;

    this.buildShowroom();
    this.scene.add(this.garageGroup);
  }

  buildShowroom() {
    // Showroom center position (located away from race track, e.g. at (0, -100, 0))
    this.showroomOrigin = new THREE.Vector3(0, -80, 0);
    this.garageGroup.position.copy(this.showroomOrigin);

    // 1. Studio Reflective Floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    floorGeo.rotateX(-Math.PI * 0.5);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      metalness: 0.85,
      roughness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.garageGroup.add(floor);

    // 2. Turntable Pedestal
    const turntableGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.35, 36);
    const turntableMat = new THREE.MeshStandardMaterial({
      color: 0x161a23,
      metalness: 0.8,
      roughness: 0.3
    });
    this.turntable = new THREE.Mesh(turntableGeo, turntableMat);
    this.turntable.position.y = 0.18;
    this.turntable.receiveShadow = true;
    this.garageGroup.add(this.turntable);

    // Gear-tooth outer perimeter
    const toothGeo = new THREE.BoxGeometry(0.3, 0.18, 0.35);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0x242b38, metalness: 0.7 });
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(Math.cos(angle) * 4.35, 0.09, Math.sin(angle) * 4.35);
      tooth.rotation.y = -angle;
      this.turntable.add(tooth);
    }

    // Car mount on turntable
    this.carHolder = new THREE.Group();
    this.turntable.add(this.carHolder);

    // 3. Glowing Floor Neon Ring (Red / Cyan neon circle from Image 2)
    const ringGeo = new THREE.TorusGeometry(5.2, 0.05, 12, 64);
    ringGeo.rotateX(Math.PI * 0.5);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff1e42,
      emissive: 0xff002b,
      emissiveIntensity: 3.5,
      roughness: 0.1
    });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.position.y = 0.02;
    this.garageGroup.add(floorRing);

    // Outer runway catwalk lines
    const runwayGeo = new THREE.PlaneGeometry(3.6, 25);
    runwayGeo.rotateX(-Math.PI * 0.5);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.position.set(0, 0.03, 12.5);
    this.garageGroup.add(runway);

    // 4. Overhead Sci-Fi Ceiling Light Rings (from Image 2)
    const ceilingGroup = new THREE.Group();
    ceilingGroup.position.set(0, 6.5, 0);

    const roofDiskGeo = new THREE.CylinderGeometry(5.5, 6.0, 0.6, 32);
    const roofDiskMat = new THREE.MeshStandardMaterial({ color: 0x111622, metalness: 0.85, roughness: 0.4 });
    const roofDisk = new THREE.Mesh(roofDiskGeo, roofDiskMat);
    ceilingGroup.add(roofDisk);

    // Concentric light ring
    const lightRingGeo = new THREE.TorusGeometry(3.6, 0.15, 12, 48);
    lightRingGeo.rotateX(Math.PI * 0.5);
    const lightRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xebf8ff,
      emissiveIntensity: 4.0
    });
    const ceilingLight = new THREE.Mesh(lightRingGeo, lightRingMat);
    ceilingLight.position.y = -0.32;
    ceilingGroup.add(ceilingLight);

    this.garageGroup.add(ceilingGroup);

    // 5. Sci-Fi Background Wall Pillars with Blue Neon Strips
    const pillarPositions = [
      { x: -9, z: -4 }, { x: -7, z: -8 }, { x: 0, z: -10 },
      { x: 7, z: -8 }, { x: 9, z: -4 }, { x: -8, z: 6 }, { x: 8, z: 6 }
    ];

    const pillarGeo = new THREE.BoxGeometry(1.2, 10, 1.2);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x161d2b, metalness: 0.8 });
    const ledGeo = new THREE.BoxGeometry(0.15, 7.5, 0.15);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 3.5
    });

    pillarPositions.forEach(p => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(p.x, 5.0, p.z);
      this.garageGroup.add(pillar);

      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(p.x * 0.95, 5.0, p.z * 0.95);
      this.garageGroup.add(led);
    });

    // 6. Showroom Lights
    const spotLight1 = new THREE.SpotLight(0xffffff, 6.0, 35, Math.PI * 0.35, 0.4, 1.2);
    spotLight1.position.set(0, 6.0, 0);
    spotLight1.target = this.turntable;
    spotLight1.castShadow = true;
    spotLight1.shadow.mapSize.width = 1024;
    spotLight1.shadow.mapSize.height = 1024;
    this.garageGroup.add(spotLight1);

    const rimLightLeft = new THREE.SpotLight(0x00f0ff, 4.0, 30, Math.PI * 0.4);
    rimLightLeft.position.set(-8, 4.5, -4);
    rimLightLeft.target = this.turntable;
    this.garageGroup.add(rimLightLeft);

    const rimLightRight = new THREE.SpotLight(0xff1e42, 4.0, 30, Math.PI * 0.4);
    rimLightRight.position.set(8, 4.5, -4);
    rimLightRight.target = this.turntable;
    this.garageGroup.add(rimLightRight);

    const ambient = new THREE.AmbientLight(0x223344, 1.2);
    this.garageGroup.add(ambient);
  }

  setCar(carData) {
    // Clear previous car mesh
    while (this.carHolder.children.length > 0) {
      const obj = this.carHolder.children[0];
      this.carHolder.remove(obj);
    }

    // Build tailored 3D car model for the showroom
    const carObj = CarModelBuilder.createCar({
      color: carData.color,
      accentColor: carData.accentColor,
      rimColor: carData.rimColor,
      caliperColor: carData.caliperColor,
      bodyType: carData.bodyType
    });

    this.currentCarMesh = carObj.group;
    // Elevate car so tires sit flush on the turntable
    this.currentCarMesh.position.set(0, 0, 0);
    this.currentCarMesh.rotation.y = Math.PI * 0.25; // Dramatic 3/4 front angle

    this.carHolder.add(this.currentCarMesh);
  }

  update(delta) {
    if (!this.active) return;
    // Slowly rotate turntable
    if (this.turntable) {
      this.turntable.rotation.y += 0.35 * delta;
    }
  }

  getShowroomCameraTransform() {
    // Perfect camera placement framing the car on turntable matching Image 2
    const camPos = new THREE.Vector3(
      this.showroomOrigin.x - 3.8,
      this.showroomOrigin.y + 1.65,
      this.showroomOrigin.z + 5.8
    );
    const targetPos = new THREE.Vector3(
      this.showroomOrigin.x,
      this.showroomOrigin.y + 0.75,
      this.showroomOrigin.z
    );
    return { camPos, targetPos };
  }
}
