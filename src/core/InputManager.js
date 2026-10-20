/**
 * InputManager.js
 * Handles keyboard, gamepad, and touch controls with smooth input filtering.
 */
export class InputManager {
  constructor() {
    this.keys = {};
    
    // Virtual axes (-1 to 1) and buttons
    this.throttle = 0;   // 0 to 1
    this.brake = 0;      // 0 to 1
    this.steer = 0;      // -1 (left) to +1 (right)
    this.handbrake = false;
    this.nitro = false;
    
    // Single-press action triggers
    this.cameraTriggered = false;
    this.resetTriggered = false;
    this.pauseTriggered = false;
    this.viewModeTriggered = false;

    // Mobile / Touch virtual input
    this.touchSteer = 0;
    this.touchThrottle = 0;
    this.touchBrake = 0;
    this.touchHandbrake = false;
    this.touchNitro = false;

    this.setupKeyboard();
    this.setupGamepad();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on arrows/space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      this.keys[e.code] = true;

      if (e.code === 'KeyC') this.cameraTriggered = true;
      if (e.code === 'KeyR') this.resetTriggered = true;
      if (e.code === 'KeyP' || e.code === 'Escape') this.pauseTriggered = true;
      if (e.code === 'KeyV') this.viewModeTriggered = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  setupGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
    });
  }

  update(delta) {
    // 1. Keyboard Inputs
    let forwardKey = this.keys['KeyW'] || this.keys['ArrowUp'];
    let backwardKey = this.keys['KeyS'] || this.keys['ArrowDown'];
    let leftKey = this.keys['KeyA'] || this.keys['ArrowLeft'];
    let rightKey = this.keys['KeyD'] || this.keys['ArrowRight'];
    let handbrakeKey = this.keys['Space'];
    let nitroKey = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyN'];

    // Target values from keyboard
    let targetThrottle = forwardKey ? 1 : 0;
    let targetBrake = backwardKey ? 1 : 0;
    let targetSteer = (rightKey ? 1 : 0) - (leftKey ? 1 : 0);

    // 2. Gamepad poll
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (gp) {
      // Left stick X
      if (Math.abs(gp.axes[0]) > 0.15) {
        targetSteer = gp.axes[0];
      }
      // Right Trigger (Gas)
      if (gp.buttons[7] && gp.buttons[7].value > 0.05) {
        targetThrottle = gp.buttons[7].value;
      } else if (gp.buttons[0] && gp.buttons[0].pressed) { // A button
        targetThrottle = 1.0;
      }
      // Left Trigger (Brake)
      if (gp.buttons[6] && gp.buttons[6].value > 0.05) {
        targetBrake = gp.buttons[6].value;
      } else if (gp.buttons[1] && gp.buttons[1].pressed) { // B button
        targetBrake = 1.0;
      }
      // Handbrake (X button or RB)
      if (gp.buttons[2]?.pressed || gp.buttons[5]?.pressed) {
        handbrakeKey = true;
      }
      // Nitro (LB or Y)
      if (gp.buttons[4]?.pressed || gp.buttons[3]?.pressed) {
        nitroKey = true;
      }
      // Camera switch (D-pad up or select)
      if (gp.buttons[8]?.pressed || gp.buttons[12]?.pressed) {
        this.cameraTriggered = true;
      }
    }

    // 3. Touch Overrides
    if (this.touchThrottle > 0) targetThrottle = Math.max(targetThrottle, this.touchThrottle);
    if (this.touchBrake > 0) targetBrake = Math.max(targetBrake, this.touchBrake);
    if (Math.abs(this.touchSteer) > 0.01) targetSteer = this.touchSteer;
    if (this.touchHandbrake) handbrakeKey = true;
    if (this.touchNitro) nitroKey = true;

    // Smooth steering input for realistic feel (fast steer-in, rapid centering)
    const steerSpeed = targetSteer === 0 ? 12.0 : 8.0;
    this.steer += (targetSteer - this.steer) * Math.min(1.0, steerSpeed * delta);
    
    // Smooth throttle and brake
    this.throttle += (targetThrottle - this.throttle) * Math.min(1.0, 15.0 * delta);
    this.brake += (targetBrake - this.brake) * Math.min(1.0, 15.0 * delta);

    this.handbrake = !!handbrakeKey;
    this.nitro = !!nitroKey;
  }

  consumeCameraTrigger() {
    const val = this.cameraTriggered;
    this.cameraTriggered = false;
    return val;
  }

  consumeResetTrigger() {
    const val = this.resetTriggered;
    this.resetTriggered = false;
    return val;
  }

  consumePauseTrigger() {
    const val = this.pauseTriggered;
    this.pauseTriggered = false;
    return val;
  }

  consumeViewModeTrigger() {
    const val = this.viewModeTriggered;
    this.viewModeTriggered = false;
    return val;
  }
}
