import * as THREE from 'three';

/**
 * VehiclePhysics.js
 * Realistic vehicle handling simulation with 6-speed transmission,
 * dynamic weight transfer (suspension roll/pitch), lateral tire slip/drift,
 * and surface friction response.
 */
export class VehiclePhysics {
  constructor() {
    // Physical specs
    this.mass = 1450;             // kg
    this.topSpeedKmh = 345;       // km/h top speed
    this.reverseMaxKmh = 50;
    this.acceleration = 18.5;     // base acceleration m/s^2
    this.brakingForce = 34.0;     // m/s^2
    this.dragCoeff = 0.0012;      // aerodynamic resistance
    this.rollingResistance = 0.8;

    // State variables
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.up = new THREE.Vector3(0, 1, 0);
    this.right = new THREE.Vector3(1, 0, 0);
    this.yaw = 0;                 // Heading angle in radians
    this.speedKmh = 0;            // Ground speed in km/h
    this.signedSpeed = 0;         // Positive forward, negative reverse

    // Steering
    this.steeringAngle = 0;
    this.maxSteerAngle = 0.58;    // ~33 degrees at low speed

    // Drivetrain & Gears
    this.gear = 1;
    this.rpm = 900;
    this.gearRatios = [3.8, 2.6, 1.85, 1.38, 1.05, 0.82]; // 1st to 6th
    this.gearMaxSpeeds = [65, 115, 165, 220, 280, 350];
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

    // Nitro
    this.nitroFuel = 100.0;
    this.isNitroActive = false;

    // Track state
    this.isOnTrack = true;
    this.isOnKerb = false;
  }

  update(delta, input, track) {
    // 1. Process Nitro
    const wantsNitro = input.nitro && input.throttle > 0.5 && this.nitroFuel > 5.0 && this.signedSpeed > 30;
    if (wantsNitro) {
      this.isNitroActive = true;
      this.nitroFuel = Math.max(0, this.nitroFuel - 28.0 * delta);
    } else {
      this.isNitroActive = false;
      // Passive recharge when not using nitro (faster when driving cleanly or drifting)
      this.nitroFuel = Math.min(100.0, this.nitroFuel + (this.isDrifting ? 14.0 : 5.0) * delta);
    }

    // 2. Speed-dependent steering sensitivity (higher at low speed, stable at top speed)
    const speedFactor = Math.max(0.18, 1.0 - Math.min(1.0, (this.speedKmh / 260) * 0.75));
    const targetSteerAngle = -input.steer * this.maxSteerAngle * speedFactor;
    this.steeringAngle += (targetSteerAngle - this.steeringAngle) * Math.min(1.0, 10.0 * delta);

    // 3. Surface Friction calculation
    let surfaceGrip = 1.0;
    let surfaceDrag = 1.0;
    if (track) {
      const trackInfo = track.getTrackProgress(this.position);
      this.isOnTrack = trackInfo.isOnTrack;
      this.isOnKerb = trackInfo.isOnKerb;

      if (!this.isOnTrack && !this.isOnKerb) {
        // Off-road grass / sand trap
        surfaceGrip = 0.45;
        surfaceDrag = 3.5;
      } else if (this.isOnKerb) {
        // Kerb vibration
        surfaceGrip = 0.85;
      }
    }

    // 4. Longitudinal Forces (Throttle, Brakes, Transmission)
    let driveForce = 0;
    const speedMs = this.velocity.length();
    this.speedKmh = speedMs * 3.6;

    // Automatic Gear Shifting logic
    if (this.signedSpeed >= 0) {
      if (this.gear < 6 && this.speedKmh > this.gearMaxSpeeds[this.gear - 1] * 0.95) {
        this.gear++;
        this.isShifting = true;
        this.shiftTimer = 0.12;
      } else if (this.gear > 1 && this.speedKmh < this.gearMaxSpeeds[this.gear - 2] * 0.75) {
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
      let power = this.acceleration * (gearRatio / 2.2);
      if (this.isNitroActive) power *= 1.5;

      // Dropoff near top speed
      const topSpeedLimit = this.isNitroActive ? (this.topSpeedKmh + 35) : this.topSpeedKmh;
      const speedRatio = this.speedKmh / topSpeedLimit;
      power *= Math.max(0.05, 1.0 - Math.pow(speedRatio, 1.8));

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

    // Handbrake
    if (input.handbrake) {
      braking += this.brakingForce * 0.8;
    }

    // Aerodynamic Drag & Rolling Resistance
    const aeroDrag = (this.dragCoeff * speedMs * speedMs + this.rollingResistance) * surfaceDrag;

    // Compute net forward acceleration
    let forwardAcc = driveForce - braking * Math.sign(this.signedSpeed) - aeroDrag * Math.sign(this.signedSpeed);

    // Apply forward acceleration along car heading
    const accelVector = this.forward.clone().multiplyScalar(forwardAcc * delta);
    this.velocity.add(accelVector);

    // 5. Lateral Grip & Drifting
    const forwardSpeed = this.velocity.dot(this.forward);
    this.signedSpeed = forwardSpeed * 3.6;

    const lateralVelocity = this.velocity.dot(this.right);
    this.slipAngle = Math.atan2(Math.abs(lateralVelocity), Math.max(0.1, Math.abs(forwardSpeed)));

    // Drift condition: handbrake pressed or high lateral G-force
    const isHandbrakeSlide = input.handbrake && this.speedKmh > 25;
    const isPowerSlide = Math.abs(input.steer) > 0.6 && input.throttle > 0.8 && this.speedKmh > 65;
    this.isDrifting = isHandbrakeSlide || isPowerSlide || (this.slipAngle > 0.28 && this.speedKmh > 40);

    // Lateral friction response
    let lateralGripFactor = this.isDrifting ? 0.35 : 0.92;
    lateralGripFactor *= surfaceGrip;

    // Dampen sideways sliding according to lateral grip
    const lateralDamping = Math.min(1.0, 14.0 * lateralGripFactor * delta);
    this.velocity.sub(this.right.clone().multiplyScalar(lateralVelocity * lateralDamping));

    // Turn car (Yaw rotation)
    let turnRate = (forwardSpeed / 3.0) * Math.tan(this.steeringAngle);
    if (this.isDrifting) {
      // Oversteer in drift: car rotates further into the drift
      turnRate *= 1.45;
    }
    this.yaw += turnRate * delta;

    // Update forward, right vectors from yaw
    this.forward.set(Math.sin(this.yaw), 0, Math.cos(this.yaw)).normalize();
    this.right.set(this.forward.z, 0, -this.forward.x).normalize();

    // 6. Update Position
    this.position.addScaledVector(this.velocity, delta);

    // 7. Track Bounds Collision / Soft rebound
    if (track) {
      const info = track.getTrackProgress(this.position);
      const halfWidth = track.trackWidth * 0.5 + 1.6;

      // Barrier collision
      if (Math.abs(info.lateralOffset) > halfWidth + 4.5) {
        // Push back inward
        const pushDir = info.centerPoint.clone().sub(this.position).setY(0).normalize();
        this.position.addScaledVector(pushDir, 0.4);
        this.velocity.multiplyScalar(0.7); // speed scrub
      }

      // Stick gently to track height elevation
      this.position.y += (info.centerPoint.y - this.position.y) * Math.min(1.0, 12.0 * delta);
    }

    // 8. Suspension Roll & Pitch
    // Roll: centrifugal lateral force
    const lateralAccel = (this.speedKmh / 3.6) * turnRate;
    const targetRoll = THREE.MathUtils.clamp(-lateralAccel * 0.02, -0.12, 0.12);
    this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1.0, 8.0 * delta);

    // Pitch: braking dives front, throttle lifts front
    const targetPitch = THREE.MathUtils.clamp((forwardAcc / this.acceleration) * 0.06, -0.08, 0.08);
    this.bodyPitch += (targetPitch - this.bodyPitch) * Math.min(1.0, 8.0 * delta);

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
      this.rpm = Math.max(900, this.rpm - 4500 * delta);
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
    this.rpm = 900;
    this.nitroFuel = 100;
    this.isDrifting = false;
    this.driftPoints = 0;
  }
}
