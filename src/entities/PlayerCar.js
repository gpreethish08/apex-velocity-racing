import * as THREE from 'three';
import { CarModelBuilder } from './CarModelBuilder.js';
import { VehiclePhysics } from './VehiclePhysics.js';

/**
 * PlayerCar.js
 * Controls the player's car, visual animations, camera modes, and dynamic FX triggers.
 */
export class PlayerCar {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.physics = new VehiclePhysics();

    this.carData = CarModelBuilder.createCar(options);
    this.mesh = this.carData.group;
    this.chassis = this.carData.chassis;
    this.wheels = this.carData.wheels;
    this.lights = this.carData.lights;
    this.exhaustMeshes = this.carData.exhaustMeshes;

    this.scene.add(this.mesh);

    // Camera modes: 0: Chase Far, 1: Chase Close, 2: Cockpit, 3: Hood / Bumper
    this.cameraMode = 0;
    this.cameraModesCount = 4;
    this.cameraOffset = new THREE.Vector3();
    this.cameraLookAt = new THREE.Vector3();
    this.smoothCamPos = new THREE.Vector3();
    this.smoothCamTarget = new THREE.Vector3();

    // Wheel world positions for effects
    this.wheelPosRL = new THREE.Vector3();
    this.wheelPosRR = new THREE.Vector3();
    this.exhaustPosL = new THREE.Vector3();
    this.exhaustPosR = new THREE.Vector3();
  }

  update(delta, input, track, effects, sound) {
    // 1. Update Physics
    this.physics.update(delta, input, track);

    // 2. Sync Car Mesh Transform with Physics
    this.mesh.position.copy(this.physics.position);
    this.mesh.rotation.y = this.physics.yaw;

    // 3. Apply Suspension Body Roll & Pitch to Chassis
    this.chassis.rotation.z = this.physics.bodyRoll;
    this.chassis.rotation.x = this.physics.bodyPitch;

    // 4. Animate Wheels: Front Steering Angle & All-wheel Spin
    this.wheels.steerFL.rotation.y = this.physics.steeringAngle;
    this.wheels.steerFR.rotation.y = this.physics.steeringAngle;

    this.wheels.fl.spinNode.rotation.x = this.physics.wheelRotation;
    this.wheels.fr.spinNode.rotation.x = this.physics.wheelRotation;
    this.wheels.rl.spinNode.rotation.x = this.physics.wheelRotation;
    this.wheels.rr.spinNode.rotation.x = this.physics.wheelRotation;

    // 5. Brake Lights Visual Intensity
    const isBraking = input.brake > 0 || input.handbrake;
    if (isBraking) {
      this.lights.taillightMat.emissiveIntensity = 4.5;
      this.lights.taillightMat.emissive.setHex(0xff0000);
    } else {
      this.lights.taillightMat.emissiveIntensity = 1.6;
      this.lights.taillightMat.emissive.setHex(0xd00018);
    }

    // 6. Calculate Wheel and Exhaust Positions for FX
    this.wheels.rl.root.getWorldPosition(this.wheelPosRL);
    this.wheels.rr.root.getWorldPosition(this.wheelPosRR);

    if (this.exhaustMeshes.length >= 2) {
      this.exhaustMeshes[0].getWorldPosition(this.exhaustPosL);
      this.exhaustMeshes[this.exhaustMeshes.length - 1].getWorldPosition(this.exhaustPosR);
    }

    // 7. Visual Effects: Tire Smoke & Skid Marks
    if (effects) {
      if (this.physics.isDrifting || (isBraking && this.physics.speedKmh > 30)) {
        effects.emitTireSmoke(this.wheelPosRL, this.wheelPosRR, this.physics.speedKmh);
        effects.addSkidSegment(this.wheelPosRL, this.wheelPosRR, Math.max(0.6, this.physics.slipRatio));
      } else {
        effects.clearSkidAnchor();
      }

      // Exhaust Nitro Flames
      if (this.physics.isNitroActive) {
        effects.emitNitroFlames(this.exhaustPosL, this.exhaustPosR, this.physics.forward, true);
      }
    }

    // 8. Dynamic Audio Engine Hook
    if (sound) {
      const rpmRatio = (this.physics.rpm - 800) / (8500 - 800);
      sound.update(
        rpmRatio,
        this.physics.speedKmh,
        this.physics.slipRatio,
        this.physics.isNitroActive,
        input.throttle
      );

      if (this.physics.isShifting && this.physics.shiftTimer > 0.09) {
        sound.playGearShift();
      }
    }
  }

  updateCamera(camera, delta) {
    const carPos = this.physics.position;
    const forward = this.physics.forward;
    const right = this.physics.right;

    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();
    let followSharpness = 12.0;

    switch (this.cameraMode) {
      case 0: // Chase Far (Cinematic high angle)
        targetCamPos.copy(carPos)
          .addScaledVector(forward, -7.5)
          .add(new THREE.Vector3(0, 3.4, 0));
        targetLookAt.copy(carPos)
          .addScaledVector(forward, 6.0)
          .add(new THREE.Vector3(0, 1.2, 0));
        followSharpness = 7.5; // Smooth spring lag
        break;

      case 1: // Chase Close (Low aggressive arcade)
        targetCamPos.copy(carPos)
          .addScaledVector(forward, -4.8)
          .add(new THREE.Vector3(0, 1.9, 0));
        targetLookAt.copy(carPos)
          .addScaledVector(forward, 5.0)
          .add(new THREE.Vector3(0, 1.0, 0));
        followSharpness = 14.0;
        break;

      case 2: // Cockpit (First Person)
        targetCamPos.copy(carPos)
          .addScaledVector(forward, 0.1)
          .addScaledVector(right, -0.35)
          .add(new THREE.Vector3(0, 1.15, 0));
        targetLookAt.copy(carPos)
          .addScaledVector(forward, 25.0)
          .add(new THREE.Vector3(0, 1.1, 0));
        followSharpness = 30.0;
        break;

      case 3: // Hood / Bumper (Ultra-speed sensation)
        targetCamPos.copy(carPos)
          .addScaledVector(forward, 1.8)
          .add(new THREE.Vector3(0, 0.7, 0));
        targetLookAt.copy(carPos)
          .addScaledVector(forward, 20.0)
          .add(new THREE.Vector3(0, 0.6, 0));
        followSharpness = 28.0;
        break;
    }

    // Dynamic FOV widening on Nitro boost (warp speed feel)
    const targetFOV = this.physics.isNitroActive ? 75 : (58 + (this.physics.speedKmh / 350) * 10);
    camera.fov += (targetFOV - camera.fov) * Math.min(1.0, 6.0 * delta);
    camera.updateProjectionMatrix();

    // Smooth camera lag interpolation
    if (this.smoothCamPos.lengthSq() === 0) {
      this.smoothCamPos.copy(targetCamPos);
      this.smoothCamTarget.copy(targetLookAt);
    } else {
      this.smoothCamPos.lerp(targetCamPos, Math.min(1.0, followSharpness * delta));
      this.smoothCamTarget.lerp(targetLookAt, Math.min(1.0, (followSharpness + 4.0) * delta));
    }

    camera.position.copy(this.smoothCamPos);
    camera.lookAt(this.smoothCamTarget);
  }

  cycleCamera() {
    this.cameraMode = (this.cameraMode + 1) % this.cameraModesCount;
    return this.getCameraModeName();
  }

  getCameraModeName() {
    const names = ['CHASE (FAR)', 'CHASE (CLOSE)', 'COCKPIT (1ST PERSON)', 'HOOD / BUMPER'];
    return names[this.cameraMode];
  }

  setCarConfig(carConfig) {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }

    this.carData = CarModelBuilder.createCar({
      color: carConfig.color,
      accentColor: carConfig.accentColor,
      rimColor: carConfig.rimColor,
      caliperColor: carConfig.caliperColor,
      bodyType: carConfig.bodyType
    });

    this.mesh = this.carData.group;
    this.chassis = this.carData.chassis;
    this.wheels = this.carData.wheels;
    this.lights = this.carData.lights;
    this.exhaustMeshes = this.carData.exhaustMeshes;

    this.scene.add(this.mesh);

    if (carConfig.physics) {
      if (carConfig.physics.topSpeedKmh) this.physics.topSpeedKmh = carConfig.physics.topSpeedKmh;
      if (carConfig.physics.acceleration) this.physics.acceleration = carConfig.physics.acceleration;
      if (carConfig.physics.brakingForce) this.physics.brakingForce = carConfig.physics.brakingForce;
    }
  }

  setCarColor(hexColor) {
    this.carData.materials.body.color.setHex(hexColor);
    this.lights.underglow.color.setHex(hexColor);
  }
}
