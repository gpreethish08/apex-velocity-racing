import * as THREE from 'three';

/**
 * VehiclePhysics.js
 * High-performance GT physics calibrated for the Lamborghini Gallardo LP570-4 Superleggera.
 * Features:
 * - Gentle, progressive steering response (no snapping or wild spinouts)
 * - Lateral G-force clamping to prevent flying / flipping
 * - 6-speed dual-clutch transmission simulation with crisp acceleration
 * - Dynamic weight transfer (chassis roll & pitch)
 * - Direct road surface vertical snapping to ensure the car stays firmly planted on asphalt
 */
export class VehiclePhysics {
  constructor() {
    // Physical specs for Gallardo LP570-4 Superleggera
    this.mass = 1340;             // kg (lightweight carbon construction)
    this.topSpeedKmh = 345;       // km/h top speed
    this.reverseMaxKmh = 65;
    this.acceleration = 45.0;     // Responsive V10 acceleration
    this.brakingForce = 52.0;     // Carbon ceramic braking power
    this.dragCoeff = 0.00085;     // Aerodynamic drag
    this.rollingResistance = 0.5;

    // State variables
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.up = new THREE.Vector3(0, 1, 0);
    this.right = new THREE.Vector3(1, 0, 0);
    this.yaw = 0;                 // Heading angle in radians
    this.speedKmh = 0;            // Ground speed in km/h
    this.signedSpeed = 0;         // Positive forward, negative reverse

    // Steering: Calibrated to 0.30 rad (~17 deg) for smooth, gentle touch controls
    this.steeringAngle = 0;
    this.maxSteerAngle = 0.30;

    // Drivetrain & Gears
    this.gear = 1;
    this.rpm = 950;
    this.gearRatios = [4.1, 2.7, 1.9, 1.42, 1.10, 0.86]; // 1st to 6th
    this.gearMaxSpeeds = [82, 142, 198, 252, 308, 365];
    this.isShifting = false;
    this.shiftTimer = 0;

    // Drifting & Lateral Friction
    this.slipAngle = 0;
    this.slipRatio = 0;
    this.isDrifting = false;
    this.driftAngle = 0;
    this.driftPoints = 0;
    this.driftMultiplier = 1.0;

    // Suspension Body Roll / Pitch
    this.bodyRoll = 0;
    this.bodyPitch = 0;

    // Wheel spin
    this.wheelRotation = 0;
    this.wheelRadius = 0.38;

    // Nitro Boost
    this.nitroFuel = 100.0;
    this.isNitroActive = false;

    // Track state
    this.isOnTrack = true;
    this.isOnKerb = false;
  }

  update(delta, input, track) {
    // 1. Process Nitro Boost
    const wantsNitro = input.nitro && input.throttle > 0.4 && this.nitroFuel > 5.0 && this.signedSpeed > 25;
    if (wantsNitro) {
      this.isNitroActive = true;
      this.nitroFuel = Math.max(0, this.nitroFuel - 26.0 * delta);
    } else {
      this.isNitroActive = false;
      // Passive recharge when not boosting (faster during drift)
      this.nitroFuel = Math.min(100.0, this.nitroFuel + (this.isDrifting ? 16.0 : 6.0) * delta);
    }

    // 2. Gentle, Progressive Steering Response
    // At low speed, allow responsive cornering; at high speed (>120 km/h), dampen authority for rock-solid stability
    const speedRatio = Math.min(1.0, this.speedKmh / 280.0);
    const speedDamping = 1.0 / (1.0 + Math.pow(this.speedKmh / 100.0, 1.25));
    const effectiveMaxAngle = this.maxSteerAngle * Math.max(0.24, speedDamping);

    const targetSteerAngle = -input.steer * effectiveMaxAngle;
    // Smooth transition into steering angle to prevent sudden twitching
    this.steeringAngle += (targetSteerAngle - this.steeringAngle) * Math.min(1.0, 7.0 * delta);

    // 3. Surface Friction calculation
    let surfaceGrip = 1.0;
    let surfaceDrag = 1.0;
    if (track) {
      const trackInfo = track.getTrackProgress(this.position);
      this.isOnTrack = trackInfo.isOnTrack;
      this.isOnKerb = trackInfo.isOnKerb;

      if (!this.isOnTrack && !this.isOnKerb) {
        // Off-road grass / runoff
        surfaceGrip = 0.55;
        surfaceDrag = 2.8;
      } else if (this.isOnKerb) {
        // Kerb vibration
        surfaceGrip = 0.88;
      }
    }

    // 4. Longitudinal Forces (Throttle, Brakes, Transmission)
    let driveForce = 0;
    const speedMs = this.velocity.length();
    this.speedKmh = speedMs * 3.6;

    // Automatic Gear Shifting logic
    if (this.signedSpeed >= 0) {
      if (this.gear < 6 && this.speedKmh > this.gearMaxSpeeds[this.gear - 1] * 0.94) {
        this.gear++;
        this.isShifting = true;
        this.shiftTimer = 0.10;
      } else if (this.gear > 1 && this.speedKmh < this.gearMaxSpeeds[this.gear - 2] * 0.74) {
        this.gear--;
      }
    }

    if (this.isShifting) {
      this.shiftTimer -= delta;
      if (this.shiftTimer <= 0) this.isShifting = false;
    }

    // Engine acceleration
    if (input.throttle > 0 && !this.isShifting) {
      const gearRatio = this.gearRatios[this.gear - 1] || 1.0;
      let power = this.acceleration * (gearRatio / 2.1);
      if (this.isNitroActive) power *= 1.45;

      // Dropoff near top speed
      const topSpeedLimit = this.isNitroActive ? (this.topSpeedKmh + 35) : this.topSpeedKmh;
      const speedFrac = this.speedKmh / topSpeedLimit;
      power *= Math.max(0.06, 1.0 - Math.pow(speedFrac, 1.9));

      driveForce += power * input.throttle * surfaceGrip;
    }

    // Braking & Reverse
    let braking = 0;
    if (input.brake > 0) {
      if (this.signedSpeed > 2.0) {
        // Braking while moving forward
        braking = this.brakingForce * input.brake;
      } else {
        // Reverse gear
        if (this.speedKmh < this.reverseMaxKmh) {
          driveForce -= (this.acceleration * 0.45) * input.brake;
        }
      }
    }

    // Handbrake / Drift button
    if (input.handbrake) {
      braking += this.brakingForce * 0.75;
    }

    // Aerodynamic Drag & Rolling Resistance
    const aeroDrag = (this.dragCoeff * speedMs * speedMs + this.rollingResistance) * surfaceDrag;

    // Net forward acceleration
    let forwardAcc = driveForce - braking * Math.sign(this.signedSpeed) - aeroDrag * Math.sign(this.signedSpeed);

    // Apply forward acceleration along car heading
    const accelVector = this.forward.clone().multiplyScalar(forwardAcc * delta);
    this.velocity.add(accelVector);

    // 5. Lateral Grip & Drifting
    const forwardSpeed = this.velocity.dot(this.forward);
    this.signedSpeed = forwardSpeed * 3.6;

    const lateralVelocity = this.velocity.dot(this.right);
    this.slipAngle = Math.atan2(Math.abs(lateralVelocity), Math.max(0.1, Math.abs(forwardSpeed)));

    // Drift condition
    const isHandbrakeSlide = input.handbrake && this.speedKmh > 25;
    const isPowerSlide = Math.abs(input.steer) > 0.65 && input.throttle > 0.8 && this.speedKmh > 65;
    this.isDrifting = isHandbrakeSlide || isPowerSlide || (this.slipAngle > 0.28 && this.speedKmh > 40);

    // Lateral friction response
    let lateralGripFactor = this.isDrifting ? 0.42 : 0.94;
    lateralGripFactor *= surfaceGrip;

    // Sideways sliding damping
    const lateralDamping = Math.min(1.0, 16.0 * lateralGripFactor * delta);
    this.velocity.sub(this.right.clone().multiplyScalar(lateralVelocity * lateralDamping));

    // Turn car (Yaw rotation using stable bicycle model + lateral G limit)
    const wheelbase = 2.56; // Gallardo wheelbase in meters
    const understeerCoeff = 0.0035;
    let turnRate = (forwardSpeed / (wheelbase + understeerCoeff * forwardSpeed * forwardSpeed)) * Math.tan(this.steeringAngle);

    // Clamp maximum lateral acceleration so car NEVER snaps, flips, or spins uncontrollably
    const maxLateralG = 13.5; // ~1.38G maximum grip
    const maxTurnRate = Math.max(0.65, maxLateralG / Math.max(7.0, Math.abs(forwardSpeed)));
    turnRate = THREE.MathUtils.clamp(turnRate, -maxTurnRate, maxTurnRate);

    if (this.isDrifting) {
      turnRate *= 1.15; // Smooth drift rotation
    }
    this.yaw += turnRate * delta;

    // Update forward, right vectors from yaw
    this.forward.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
    this.right.set(this.forward.z, 0, -this.forward.x).normalize();

    // 6. Update Position
    this.position.addScaledVector(this.velocity, delta);

    // 7. Track Bounds & Vertical Ground Clamping (Guarantees car NEVER flies)
    if (track) {
      const info = track.getTrackProgress(this.position);
      const halfWidth = track.trackWidth * 0.5 + 1.6;

      // Soft boundary rebound if pushed off road
      if (Math.abs(info.lateralOffset) > halfWidth + 4.5) {
        const pushDir = info.centerPoint.clone().sub(this.position).setY(0).normalize();
        this.position.addScaledVector(pushDir, 0.35);
        this.velocity.multiplyScalar(0.75); // speed scrub
      }

      // Firmly plant car directly on the road surface height (no floating or flying)
      const targetY = info.centerPoint ? info.centerPoint.y : 0;
      this.position.y += (targetY - this.position.y) * Math.min(1.0, 35.0 * delta);
    }

    // 8. Suspension Roll & Pitch
    const lateralAccel = (this.speedKmh / 3.6) * turnRate;
    const targetRoll = THREE.MathUtils.clamp(-lateralAccel * 0.016, -0.09, 0.09);
    this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1.0, 7.0 * delta);

    const targetPitch = THREE.MathUtils.clamp((forwardAcc / this.acceleration) * 0.05, -0.07, 0.07);
    this.bodyPitch += (targetPitch - this.bodyPitch) * Math.min(1.0, 7.0 * delta);

    // 9. Wheel Spin
    const wheelAngularVel = speedMs / this.wheelRadius;
    this.wheelRotation += wheelAngularVel * delta * Math.sign(this.signedSpeed);

    // 10. Engine RPM calculation
    const currentMaxGearSpeed = this.gearMaxSpeeds[this.gear - 1] || 100;
    const prevMaxGearSpeed = this.gear > 1 ? this.gearMaxSpeeds[this.gear - 2] : 0;
    const gearProgress = Math.max(0, (this.speedKmh - prevMaxGearSpeed) / (currentMaxGearSpeed - prevMaxGearSpeed));

    if (input.throttle > 0) {
      this.rpm = 2000 + gearProgress * 6500;
      if (this.isNitroActive) this.rpm = Math.min(8800, this.rpm + 500);
    } else {
      this.rpm = Math.max(950, this.rpm - 4200 * delta);
    }

    // 11. Drift Scoring
    if (this.isDrifting && this.speedKmh > 35) {
      this.driftPoints += Math.floor(this.speedKmh * Math.abs(this.slipAngle) * 8.0 * delta);
      this.driftMultiplier = Math.min(4.0, this.driftMultiplier + 0.3 * delta);
      this.slipRatio = Math.min(1.0, this.slipAngle * 2.2);
    } else {
      this.slipRatio = Math.max(0, this.slipRatio - 4.0 * delta);
      if (this.driftMultiplier > 1.0) {
        this.driftMultiplier = Math.max(1.0, this.driftMultiplier - 1.5 * delta);
      }
    }
  }

  reset(position, heading) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.yaw = heading || 0;
    this.forward.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
    this.right.set(this.forward.z, 0, -this.forward.x).normalize();
    this.speedKmh = 0;
    this.signedSpeed = 0;
    this.gear = 1;
    this.rpm = 950;
    this.nitroFuel = 100;
    this.isDrifting = false;
    this.driftPoints = 0;
    this.steeringAngle = 0;
    this.bodyRoll = 0;
    this.bodyPitch = 0;
  }
}
