import * as THREE from 'three';
import { CarModelBuilder } from './CarModelBuilder.js';

/**
 * AICar.js
 * AI racing opponents that intelligently navigate the race track,
 * adjust speeds for turns, avoid collisions, and challenge the player for podium victory.
 */
export class AICar {
  constructor(scene, track, options = {}) {
    this.scene = scene;
    this.track = track;
    this.name = options.name || 'RIVAL GT';

    this.carData = CarModelBuilder.createCar({
      color: options.color || 0x0284c7,
      rimColor: options.rimColor || 0xd1d5db,
      caliperColor: options.caliperColor || 0xfacc15
    });

    this.mesh = this.carData.group;
    this.chassis = this.carData.chassis;
    this.wheels = this.carData.wheels;
    this.lights = this.carData.lights;

    this.scene.add(this.mesh);

    // AI Driving parameters
    this.progress = options.initialProgress || 0.05;
    this.lateralOffset = options.lateralOffset || 0;
    this.targetLateralOffset = this.lateralOffset;

    this.speedKmh = 0;
    this.maxStraightSpeed = options.maxSpeed || (300 + Math.random() * 25);
    this.corneringGrip = options.corneringGrip || (110 + Math.random() * 20);
    this.acceleration = 16.0 + Math.random() * 3.0;
    this.brakingForce = 32.0;

    this.position = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.yaw = 0;
    this.wheelRotation = 0;
    this.steeringAngle = 0;
    this.lap = 1;
    this.lastProgress = this.progress;

    // Place at starting grid position
    this.updatePositionFromProgress(0);
  }

  update(delta, playerCar, otherAIs) {
    // 1. Look ahead on track to calculate curvature / corner radius
    const lookAheadU = (this.progress + 0.035) % 1.0;
    const currentTangent = this.track.getTangentAtProgress(this.progress);
    const aheadTangent = this.track.getTangentAtProgress(lookAheadU);
    const curvature = 1.0 - Math.max(0, currentTangent.dot(aheadTangent));

    // Target speed based on curvature
    let targetSpeed = this.maxStraightSpeed;
    if (curvature > 0.03) {
      // Corner ahead: calculate safe cornering speed
      targetSpeed = Math.max(85, this.corneringGrip - curvature * 350);
    }

    // 2. Obstacle Detection & Avoidance (dodge player and other AI)
    let obstacleAhead = false;
    const myPos = this.position;

    // Check player
    if (playerCar) {
      const pPos = playerCar.physics.position;
      const distToPlayer = myPos.distanceTo(pPos);
      if (distToPlayer < 18.0) {
        const toPlayer = pPos.clone().sub(myPos);
        const forwardDot = toPlayer.dot(this.forward);
        if (forwardDot > 0 && forwardDot < 15.0) {
          // Player is directly ahead! Check lateral separation
          const rightDot = toPlayer.dot(new THREE.Vector3(this.forward.z, 0, -this.forward.x));
          if (Math.abs(rightDot) < 3.2) {
            obstacleAhead = true;
            // Steer away from player
            this.targetLateralOffset = rightDot > 0 ? this.lateralOffset - 3.5 : this.lateralOffset + 3.5;
            targetSpeed = Math.min(targetSpeed, playerCar.physics.speedKmh * 0.95);
          }
        }
      }
    }

    // Clamp lateral offset within track boundaries
    const maxSafeOffset = (this.track.trackWidth * 0.5) - 2.5;
    this.targetLateralOffset = THREE.MathUtils.clamp(this.targetLateralOffset, -maxSafeOffset, maxSafeOffset);
    this.lateralOffset += (this.targetLateralOffset - this.lateralOffset) * Math.min(1.0, 3.0 * delta);

    // 3. Accelerate or Brake
    const speedMs = this.speedKmh / 3.6;
    const isBraking = this.speedKmh > (targetSpeed + 5);

    if (isBraking) {
      this.speedKmh = Math.max(targetSpeed, this.speedKmh - this.brakingForce * 3.6 * delta);
      // Bright brake lights
      this.lights.taillightMat.emissiveIntensity = 4.0;
      this.lights.taillightMat.emissive.setHex(0xff0000);
    } else {
      this.speedKmh = Math.min(targetSpeed, this.speedKmh + this.acceleration * 3.6 * delta);
      this.lights.taillightMat.emissiveIntensity = 1.5;
      this.lights.taillightMat.emissive.setHex(0xc00014);
    }

    // 4. Advance progress along track
    const distStep = (this.speedKmh / 3.6) * delta;
    const progressDelta = distStep / this.track.length;
    this.progress += progressDelta;

    // Lap crossing check
    if (this.lastProgress > 0.85 && this.progress >= 1.0) {
      this.lap++;
    }
    this.lastProgress = this.progress;
    this.progress = this.progress % 1.0;

    // 5. Update Transform on track
    this.updatePositionFromProgress(delta);

    // 6. Wheel animations
    const wheelAngularVel = (this.speedKmh / 3.6) / 0.38;
    this.wheelRotation += wheelAngularVel * delta;

    this.wheels.steerFL.rotation.y = this.steeringAngle;
    this.wheels.steerFR.rotation.y = this.steeringAngle;
    this.wheels.fl.spinNode.rotation.x = this.wheelRotation;
    this.wheels.fr.spinNode.rotation.x = this.wheelRotation;
    this.wheels.rl.spinNode.rotation.x = this.wheelRotation;
    this.wheels.rr.spinNode.rotation.x = this.wheelRotation;
  }

  updatePositionFromProgress(delta) {
    const centerPt = this.track.getPointAtProgress(this.progress);
    const tangent = this.track.getTangentAtProgress(this.progress);
    const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

    // Position with lateral racing offset
    this.position.copy(centerPt).addScaledVector(normal, this.lateralOffset);
    this.position.y += 0.05;

    // Look slightly ahead to determine yaw heading
    const lookAheadPt = this.track.getPointAtProgress((this.progress + 0.015) % 1.0).addScaledVector(normal, this.lateralOffset);
    const headingVec = lookAheadPt.clone().sub(this.position).setY(0).normalize();

    const targetYaw = Math.atan2(headingVec.x, headingVec.z);
    
    // Smooth steering calculation
    const yawDiff = targetYaw - this.yaw;
    this.steeringAngle = THREE.MathUtils.clamp(yawDiff * 2.0, -0.4, 0.4);

    this.yaw = targetYaw;
    this.forward.copy(headingVec);

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw;
  }

  getOverallProgress() {
    return (this.lap - 1) + this.progress;
  }
}
