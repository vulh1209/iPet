import { Position, AnimationType, Direction, ScreenBounds } from '../types';

type BehaviorState =
  | 'idle'
  | 'wandering'
  | 'sleeping'
  | 'being_dragged'
  | 'reacting'
  | 'landing'
  | 'listening'
  | 'rejecting'
  | 'talking'        // When AI is responding
  | 'eating'         // When eating treat
  | 'dancing'        // When dance party
  | 'yawning'        // Pre-sleep transition
  | 'waking'         // Post-sleep transition
  | 'grumpy_waking'  // Angry wake when disturbed at low energy
  | 'playing'        // When playing catch
  | 'shaking'        // When being gently shaken
  | 'accelerating'   // Walk → Run transition
  | 'slowing_down'   // Run → Idle transition
  | 'stumbling'      // Hit wall while running
  | 'crying'         // After stumble
  | 'hurt';          // Legacy hurt state (for backward compat)

interface BehaviorResult {
  position: Position;
  animation: AnimationType;
  direction: Direction;
  squishFactor?: number;
  isRejecting?: boolean;
}

export class PetBehavior {
  private currentState: BehaviorState = 'idle';
  private stateTimer: number = 0;
  private targetPosition: Position | null = null;
  private position: Position;
  private screenBounds: ScreenBounds;
  private direction: Direction = 'right';
  private isMoodSleeping: boolean = false; // Controlled by mood system
  private isLowHappiness: boolean = false; // Happiness < 40
  private happiness: number = 50; // Current happiness level for mood-based animations

  // Animation queue for sequential animations
  private animationQueue: BehaviorState[] = [];

  private readonly WANDER_SPEED = 30; // pixels per second
  private readonly RUN_SPEED = 180; // pixels per second (2x walk speed)
  private readonly HAPPINESS_RUN_THRESHOLD = 60;
  private readonly PET_SIZE = 50;
  private readonly IDLE_MIN = 10000; // 10 seconds minimum
  private readonly IDLE_MAX = 20000; // 20 seconds maximum
  private readonly WANDER_CHANCE = 0.6;

  // Tired state thresholds
  private readonly TIRED_ENERGY_THRESHOLD = 30; // Energy < 30 = tired
  private readonly TIRED_SPEED_MULTIPLIER = 0.6; // 60% speed when tired

  // Wander distance configuration
  private readonly WANDER_DISTANCE_MIN = 80; // Base walk distance min
  private readonly WANDER_DISTANCE_MAX = 150; // Base walk distance max
  private readonly RUN_DISTANCE_MULTIPLIER = 3.0; // Run = 3x walk distance
  private readonly TIRED_DISTANCE_MULTIPLIER = 0.6; // Tired = 0.5x walk distance

  // Track current energy level for tired animations
  private energy: number = 50;

  // Computed getter for tired state
  private get isTired(): boolean {
    return this.energy < this.TIRED_ENERGY_THRESHOLD;
  }

  // Landing bounce physics
  private landingBaseY: number = 0;
  private landingVelocity: number = 0;
  private landingOffset: number = 0;

  // Rejection shake physics
  private rejectShakeTime: number = 0;
  private readonly REJECT_DURATION = 600; // ms

  // Animation durations for timed states
  private readonly TALK_DURATION = 2000; // ms - talk animation while AI responds
  private readonly EAT_DURATION = 2000; // ms - eating animation (~2 loops)
  private readonly DANCE_DURATION = 6000; // ms - dance party duration (~7 loops)
  private readonly YAWN_DURATION = 1000; // ms - 4 frames * 250ms
  private readonly WAKE_DURATION = 800; // ms - 4 frames * 200ms
  private readonly GRUMPY_WAKE_DURATION = 2000; // ms - angry animation when disturbed (4 seconds)
  private readonly PLAY_DURATION = 3000; // ms - playing catch animation
  private readonly SHAKE_DURATION = 800; // ms - gentle shake animation
  private readonly HURT_DURATION = 1500; // ms - hurt/crying animation when hitting edge

  // Smooth transition durations
  private readonly ACCELERATE_DURATION = 400; // ms - walk → run
  private readonly SLOW_DOWN_DURATION = 500; // ms - run → idle
  private readonly STUMBLE_DURATION = 600; // ms - hit wall
  private readonly CRY_DURATION = 2000; // ms - crying after stumble

  // Track if we were running (for transitions)
  private wasRunning: boolean = false;

  // Callback for when pet gets hurt (to reduce happiness)
  private onHurtCallback?: () => void;

  private readonly SPRING_STIFFNESS = 150;   // Slower oscillation
  private readonly SPRING_DAMPING = 5;       // Less damping = more bounces
  private readonly BOUNCE_THRESHOLD = 0.3;
  private readonly INITIAL_DROP_VELOCITY = 250; // Larger drop velocity

  constructor(initialPosition: Position, screenBounds: ScreenBounds) {
    this.position = initialPosition;
    this.screenBounds = screenBounds;
  }

  setScreenBounds(bounds: ScreenBounds): void {
    this.screenBounds = bounds;
  }

  setPosition(pos: Position): void {
    this.position = pos;
  }

  update(deltaTime: number): BehaviorResult {
    this.stateTimer += deltaTime;

    switch (this.currentState) {
      case 'idle':
        return this.handleIdleState();
      case 'wandering':
        return this.handleWanderingState(deltaTime);
      case 'being_dragged':
        return this.handleDraggedState();
      case 'reacting':
        return this.handleReactingState();
      case 'sleeping':
        return this.handleSleepingState();
      case 'landing':
        return this.handleLandingState(deltaTime);
      case 'listening':
        return this.handleListeningState();
      case 'rejecting':
        return this.handleRejectingState(deltaTime);
      case 'talking':
        return this.handleTalkingState();
      case 'eating':
        return this.handleEatingState();
      case 'dancing':
        return this.handleDancingState();
      case 'yawning':
        return this.handleYawningState();
      case 'waking':
        return this.handleWakingState();
      case 'grumpy_waking':
        return this.handleGrumpyWakingState();
      case 'playing':
        return this.handlePlayingState(deltaTime);
      case 'shaking':
        return this.handleShakingState(deltaTime);
      case 'accelerating':
        return this.handleAcceleratingState(deltaTime);
      case 'slowing_down':
        return this.handleSlowingDownState(deltaTime);
      case 'stumbling':
        return this.handleStumblingState(deltaTime);
      case 'crying':
        return this.handleCryingState(deltaTime);
      case 'hurt':
        return this.handleHurtState(deltaTime);
      default:
        return this.handleIdleState();
    }
  }

  private handleIdleState(): BehaviorResult {
    // If mood system says sleeping, transition to yawning first
    if (this.isMoodSleeping) {
      this.transitionTo('yawning');
      return this.handleYawningState();
    }

    const idleDuration = this.randomInRange(this.IDLE_MIN, this.IDLE_MAX);

    if (this.stateTimer > idleDuration) {
      const roll = Math.random();
      if (roll < this.WANDER_CHANCE) {
        this.transitionTo('wandering');
        this.pickRandomDirection();
      } else {
        // Reset timer to stay idle longer
        this.stateTimer = 0;
      }
    }

    return {
      position: this.position,
      animation: this.selectIdleAnimation(),
      direction: this.direction,
    };
  }

  /**
   * Select the appropriate idle animation based on mood levels
   * Priority: tired (low energy) > sad (low happiness) > ecstatic > happy > idle
   * Note: angry is reserved for grumpy_waking state only
   */
  private selectIdleAnimation(): AnimationType {
    // Tired (low energy) - different from sad (low happiness)
    if (this.isTired) return 'idle_tired';
    if (this.isLowHappiness) return 'sad';
    if (this.happiness >= 80) return 'idle_ecstatic';
    if (this.happiness >= 60) return 'idle_happy';
    return 'idle';
  }

  private handleWanderingState(deltaTime: number): BehaviorResult {
    if (!this.targetPosition) {
      // If was running, play slow down animation before idle
      if (this.wasRunning) {
        this.transitionTo('slowing_down');
        return this.handleSlowingDownState(deltaTime);
      }
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Determine if should be running based on happiness AND energy
    // Cannot run when tired!
    const canRun = this.happiness > this.HAPPINESS_RUN_THRESHOLD && !this.isTired;

    // Check for walk → run transition (only if not tired)
    if (canRun && !this.wasRunning) {
      this.transitionTo('accelerating');
      return this.handleAcceleratingState(deltaTime);
    }

    // If currently running but became tired, slow down
    if (this.wasRunning && this.isTired) {
      this.transitionTo('slowing_down');
      return this.handleSlowingDownState(deltaTime);
    }

    // Reached target or getting close
    if (distance < 5) {
      this.targetPosition = null;
      // If was running, play slow down animation
      if (this.wasRunning) {
        this.transitionTo('slowing_down');
        return this.handleSlowingDownState(deltaTime);
      }
      this.transitionTo('idle');
      return {
        position: this.position,
        animation: 'idle',
        direction: this.direction,
      };
    }

    // Determine speed based on current running state and tiredness
    let speed = this.wasRunning ? this.RUN_SPEED : this.WANDER_SPEED;
    if (this.isTired) {
      speed *= this.TIRED_SPEED_MULTIPLIER; // Slow down when tired
    }

    // Move towards target
    const moveDistance = (speed * deltaTime) / 1000;
    const ratio = Math.min(moveDistance / distance, 1);

    const newX = this.position.x + dx * ratio;
    const newY = this.position.y + dy * ratio;

    // Check if running into screen edge (only when running)
    // This check must happen BEFORE slow down check to allow hitting edges
    if (this.wasRunning) {
      const hitLeftEdge = newX <= 0 && dx < 0;
      const hitRightEdge = newX >= this.screenBounds.width - this.PET_SIZE && dx > 0;
      const hitTopEdge = newY <= 0 && dy < 0;
      const hitBottomEdge = newY >= this.screenBounds.height - this.PET_SIZE && dy > 0;

      if (hitLeftEdge || hitRightEdge || hitTopEdge || hitBottomEdge) {
        // Pet ran into edge - trigger stumble → cry sequence!
        this.targetPosition = null;
        this.transitionTo('stumbling');
        // Call hurt callback to reduce happiness
        if (this.onHurtCallback) {
          this.onHurtCallback();
        }
        return this.handleStumblingState(deltaTime);
      }
    }

    // If running and getting close to target (but not hitting edge), start slowing down
    if (this.wasRunning && distance < 30) {
      this.transitionTo('slowing_down');
      return this.handleSlowingDownState(deltaTime);
    }

    // Clamp position to screen bounds to prevent pet from going off-screen
    const clampedPosition = this.clampToScreen({
      x: newX,
      y: newY,
    });

    // Check if we hit screen edge (position at boundary)
    // screenBounds already accounts for window size
    const atLeftEdge = clampedPosition.x <= 0;
    const atRightEdge = clampedPosition.x >= this.screenBounds.width;
    const atTopEdge = clampedPosition.y <= 0;
    const atBottomEdge = clampedPosition.y >= this.screenBounds.height;

    if (atLeftEdge || atRightEdge || atTopEdge || atBottomEdge) {
      // We hit the edge - stop wandering and go to idle
      this.targetPosition = null;
      this.transitionTo('idle');
      this.position = clampedPosition;
      return {
        position: this.position,
        animation: 'idle',
        direction: this.direction,
      };
    }

    this.position = clampedPosition;
    this.direction = dx > 0 ? 'right' : 'left';

    // Choose walk animation based on energy level
    let walkAnimation: AnimationType = 'walk';
    if (this.wasRunning) {
      walkAnimation = 'run';
    } else if (this.isTired) {
      walkAnimation = 'walk_tired';
    }

    return {
      position: this.position,
      animation: walkAnimation,
      direction: this.direction,
    };
  }

  private handleDraggedState(): BehaviorResult {
    return {
      position: this.position,
      animation: 'drag',
      direction: this.direction,
    };
  }

  private handleReactingState(): BehaviorResult {
    if (this.stateTimer > 1000) {
      this.transitionTo('idle');
    }
    return {
      position: this.position,
      animation: 'happy',
      direction: this.direction,
    };
  }

  private handleSleepingState(): BehaviorResult {
    return {
      position: this.position,
      animation: 'sleep',
      direction: this.direction,
    };
  }

  private handleListeningState(): BehaviorResult {
    return {
      position: this.position,
      animation: 'curious',
      direction: this.direction,
    };
  }

  private handleRejectingState(deltaTime: number): BehaviorResult {
    this.rejectShakeTime += deltaTime;

    // Gentle shake animation using sine wave
    const shakeIntensity = 1.5; // Reduced from 3
    const shakeFrequency = 12; // Slower shake (was 20)
    const shakeOffset = Math.sin(this.rejectShakeTime * shakeFrequency / 1000 * Math.PI * 2) * shakeIntensity;

    // End rejection after duration
    if (this.rejectShakeTime >= this.REJECT_DURATION) {
      this.rejectShakeTime = 0;
      this.transitionTo('idle');
      return {
        position: this.position,
        animation: 'idle',
        direction: this.direction,
        isRejecting: false,
      };
    }

    return {
      position: { x: this.position.x + shakeOffset, y: this.position.y },
      animation: 'reject',
      direction: this.direction,
      isRejecting: true,
    };
  }

  private handleTalkingState(): BehaviorResult {
    // Talking animation plays while AI is responding
    // Duration controlled externally via onTalkEnd()
    if (this.stateTimer > this.TALK_DURATION) {
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    return {
      position: this.position,
      animation: 'talk',
      direction: this.direction,
    };
  }

  private handleEatingState(): BehaviorResult {
    // Eating animation plays once then returns to happy
    if (this.stateTimer > this.EAT_DURATION) {
      this.transitionTo('reacting'); // Show happy after eating
      return this.handleReactingState();
    }

    return {
      position: this.position,
      animation: 'eat',
      direction: this.direction,
    };
  }

  private handleDancingState(): BehaviorResult {
    // Dancing animation loops for duration
    if (this.stateTimer > this.DANCE_DURATION) {
      this.transitionTo('reacting'); // Show happy after dancing
      return this.handleReactingState();
    }

    return {
      position: this.position,
      animation: 'dance',
      direction: this.direction,
    };
  }

  private handleYawningState(): BehaviorResult {
    // Yawn animation before sleep
    if (this.stateTimer > this.YAWN_DURATION) {
      this.transitionTo('sleeping');
      return this.handleSleepingState();
    }

    return {
      position: this.position,
      animation: 'yawn',
      direction: this.direction,
    };
  }

  private handleWakingState(): BehaviorResult {
    // Wake animation after sleep
    if (this.stateTimer > this.WAKE_DURATION) {
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    return {
      position: this.position,
      animation: 'wake',
      direction: this.direction,
    };
  }

  private handleGrumpyWakingState(): BehaviorResult {
    // Grumpy wake animation - angry face when disturbed at low energy
    if (this.stateTimer > this.GRUMPY_WAKE_DURATION) {
      // Check queue for next animation (e.g., yawning -> sleeping)
      this.transitionToNextOrFallback('idle');
      return this.getResultForCurrentState();
    }

    // Aggressive shake effect while grumpy - faster and stronger
    const shakeSpeed = 15;
    const shakeAmount = 6;
    const shakeOffset = Math.sin(this.stateTimer * shakeSpeed / 1000 * Math.PI * 2) * shakeAmount;

    return {
      position: { x: this.position.x + shakeOffset, y: this.position.y },
      animation: 'angry',
      direction: this.direction,
    };
  }

  // Helper to get result for current state (used after queue transition)
  private getResultForCurrentState(): BehaviorResult {
    switch (this.currentState) {
      case 'yawning':
        return this.handleYawningState();
      case 'sleeping':
        return this.handleSleepingState();
      case 'idle':
      default:
        return this.handleIdleState();
    }
  }

  private handlePlayingState(_deltaTime: number): BehaviorResult {
    // Playing catch - bouncy happy animation with vertical bounce
    if (this.stateTimer > this.PLAY_DURATION) {
      this.transitionTo('reacting');
      return this.handleReactingState();
    }

    // Bounce effect: pet jumps up and down while playing
    const bounceSpeed = 6; // bounces per second
    const bounceHeight = 25; // pixels - more visible bounce
    const phase = this.stateTimer * bounceSpeed / 1000 * Math.PI;
    const bounceOffset = Math.abs(Math.sin(phase)) * bounceHeight;

    return {
      position: { x: this.position.x, y: this.position.y - bounceOffset },
      animation: 'happy',
      direction: this.direction,
      squishFactor: 1 + Math.sin(phase) * 0.15, // more visible squish
    };
  }

  private handleShakingState(_deltaTime: number): BehaviorResult {
    // Gentle shake - wiggle side to side
    if (this.stateTimer > this.SHAKE_DURATION) {
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    // Wiggle effect: gentle horizontal shake
    const shakeSpeed = 12; // shakes per second
    const shakeAmount = 8; // pixels - more visible shake
    const shakeOffset = Math.sin(this.stateTimer * shakeSpeed / 1000 * Math.PI * 2) * shakeAmount;

    return {
      position: { x: this.position.x + shakeOffset, y: this.position.y },
      animation: 'happy',
      direction: this.direction,
    };
  }

  private handleHurtState(_deltaTime: number): BehaviorResult {
    // Legacy hurt state - kept for backward compatibility
    if (this.stateTimer > this.HURT_DURATION) {
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    const wobbleSpeed = 8;
    const wobbleAmount = 2;
    const wobbleOffset = Math.sin(this.stateTimer * wobbleSpeed / 1000 * Math.PI * 2) * wobbleAmount;

    return {
      position: { x: this.position.x + wobbleOffset, y: this.position.y },
      animation: 'hurt',
      direction: this.direction,
    };
  }

  private handleAcceleratingState(_deltaTime: number): BehaviorResult {
    // Walk → Run transition animation
    if (this.stateTimer > this.ACCELERATE_DURATION) {
      this.wasRunning = true;
      this.transitionTo('wandering');
      return this.handleWanderingState(_deltaTime);
    }

    // Gradually increase speed during acceleration
    const progress = this.stateTimer / this.ACCELERATE_DURATION;
    const currentSpeed = this.WANDER_SPEED + (this.RUN_SPEED - this.WANDER_SPEED) * progress;

    // Continue moving toward target if exists
    if (this.targetPosition) {
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        const moveDistance = (currentSpeed * _deltaTime) / 1000;
        const ratio = Math.min(moveDistance / distance, 1);
        this.position = this.clampToScreen({
          x: this.position.x + dx * ratio,
          y: this.position.y + dy * ratio,
        });
        this.direction = dx > 0 ? 'right' : 'left';
      }
    }

    return {
      position: this.position,
      animation: 'run_start',
      direction: this.direction,
    };
  }

  private handleSlowingDownState(_deltaTime: number): BehaviorResult {
    // Run → Idle transition animation
    if (this.stateTimer > this.SLOW_DOWN_DURATION) {
      this.wasRunning = false;
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    // Gradually decrease speed during deceleration
    const progress = this.stateTimer / this.SLOW_DOWN_DURATION;
    const currentSpeed = this.RUN_SPEED * (1 - progress);

    // Continue moving slightly during slowdown
    if (this.targetPosition) {
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2 && currentSpeed > 5) {
        const moveDistance = (currentSpeed * _deltaTime) / 1000;
        const ratio = Math.min(moveDistance / distance, 1);
        this.position = this.clampToScreen({
          x: this.position.x + dx * ratio,
          y: this.position.y + dy * ratio,
        });
      }
    }

    // Wobble effect while slowing down
    const wobble = Math.sin(this.stateTimer * 10 / 1000 * Math.PI * 2) * 2 * (1 - progress);

    return {
      position: { x: this.position.x + wobble, y: this.position.y },
      animation: 'run_stop',
      direction: this.direction,
    };
  }

  private handleStumblingState(_deltaTime: number): BehaviorResult {
    // Stumble animation after hitting wall
    if (this.stateTimer > this.STUMBLE_DURATION) {
      this.transitionTo('crying');
      return this.handleCryingState(_deltaTime);
    }

    // Impact wobble - stronger at start, fading
    const progress = this.stateTimer / this.STUMBLE_DURATION;
    const shakeIntensity = 6 * (1 - progress);
    const shakeOffset = Math.sin(this.stateTimer * 15 / 1000 * Math.PI * 2) * shakeIntensity;

    return {
      position: { x: this.position.x + shakeOffset, y: this.position.y },
      animation: 'stumble',
      direction: this.direction,
    };
  }

  private handleCryingState(_deltaTime: number): BehaviorResult {
    // Crying animation after stumble
    if (this.stateTimer > this.CRY_DURATION) {
      this.wasRunning = false;
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    // Gentle sob shake
    const sobSpeed = 6;
    const sobAmount = 3;
    const sobOffset = Math.sin(this.stateTimer * sobSpeed / 1000 * Math.PI * 2) * sobAmount;

    return {
      position: { x: this.position.x + sobOffset, y: this.position.y },
      animation: 'cry',
      direction: this.direction,
    };
  }

  private handleLandingState(deltaTime: number): BehaviorResult {
    const dt = deltaTime / 1000; // Convert to seconds

    // Spring physics: F = -kx - bv
    const springForce = -this.SPRING_STIFFNESS * this.landingOffset;
    const dampingForce = -this.SPRING_DAMPING * this.landingVelocity;
    const acceleration = springForce + dampingForce;

    this.landingVelocity += acceleration * dt;
    this.landingOffset += this.landingVelocity * dt;

    // Squish: moving down = compress (wider), moving up = stretch (taller)
    const squishFactor = Math.max(0.7, Math.min(1.3, 1 - this.landingVelocity * 0.002));

    // Check if bounce has settled
    if (Math.abs(this.landingOffset) < this.BOUNCE_THRESHOLD &&
        Math.abs(this.landingVelocity) < this.BOUNCE_THRESHOLD) {
      this.landingOffset = 0;
      this.transitionTo('idle');
      return {
        position: { x: this.position.x, y: this.landingBaseY },
        animation: 'idle',
        direction: this.direction,
        squishFactor: 1.0,
      };
    }

    return {
      position: { x: this.position.x, y: this.landingBaseY + this.landingOffset },
      animation: 'idle',
      direction: this.direction,
      squishFactor,
    };
  }

  private pickRandomDirection(): void {
    const maxAttempts = 5;

    // Determine distance multiplier based on state
    let distanceMultiplier = 1.0;
    if (this.isTired) {
      distanceMultiplier = this.TIRED_DISTANCE_MULTIPLIER;
    } else if (this.happiness > this.HAPPINESS_RUN_THRESHOLD) {
      distanceMultiplier = this.RUN_DISTANCE_MULTIPLIER;
    }

    for (let i = 0; i < maxAttempts; i++) {
      // Pick random angle (0 to 360 degrees)
      const angle = Math.random() * Math.PI * 2;
      // Distance based on state: tired=40-75, walk=80-150, run=240-450
      const distance = this.randomInRange(
        this.WANDER_DISTANCE_MIN * distanceMultiplier,
        this.WANDER_DISTANCE_MAX * distanceMultiplier
      );

      // Calculate target based on direction
      // Don't clamp to screen - allow running into edges!
      const targetX = this.position.x + Math.cos(angle) * distance;
      const targetY = this.position.y + Math.sin(angle) * distance;

      // Check if target direction makes sense (not completely outside screen)
      // Pet can run toward edge but we need valid direction
      const dx = targetX - this.position.x;
      const dy = targetY - this.position.y;
      const actualDistance = Math.sqrt(dx * dx + dy * dy);

      if (actualDistance >= 20) {
        this.targetPosition = { x: targetX, y: targetY };
        return;
      }
    }

    // Fallback: stay idle, don't move
    this.targetPosition = null;
  }

  private transitionTo(newState: BehaviorState): void {
    this.currentState = newState;
    this.stateTimer = 0;
  }

  // Queue multiple animations
  private queueAnimations(...states: BehaviorState[]): void {
    this.animationQueue.push(...states);
  }

  // Clear queue and transition immediately
  private forceTransition(newState: BehaviorState): void {
    this.animationQueue = [];
    this.transitionTo(newState);
  }

  // Process next animation in queue (called when current animation ends)
  private processQueue(): BehaviorState {
    if (this.animationQueue.length > 0) {
      const nextState = this.animationQueue.shift()!;
      this.transitionTo(nextState);
      return nextState;
    }
    return 'idle';
  }

  // Check if there's a queued animation and transition to it, otherwise go to fallback
  private transitionToNextOrFallback(fallback: BehaviorState = 'idle'): void {
    if (this.animationQueue.length > 0) {
      this.processQueue();
    } else {
      this.transitionTo(fallback);
    }
  }

  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  // External triggers
  onDragStart(): void {
    this.transitionTo('being_dragged');
  }

  onDragEnd(newPosition: Position): void {
    this.position = this.clampToScreen(newPosition);
    // Initialize landing bounce - pet falls DOWN then bounces up
    this.landingBaseY = this.position.y;
    this.landingOffset = 0;
    this.landingVelocity = this.INITIAL_DROP_VELOCITY; // Downward velocity (positive Y = down)
    this.transitionTo('landing');
  }

  onClick(): void {
    // Don't react if being dragged, landing, or listening
    if (this.currentState !== 'being_dragged' &&
        this.currentState !== 'landing' &&
        this.currentState !== 'listening') {
      this.transitionTo('reacting');
    }
  }

  onListeningStart(): void {
    // Can start listening from any state except being_dragged
    if (this.currentState !== 'being_dragged') {
      this.transitionTo('listening');
    }
  }

  onListeningEnd(): void {
    if (this.currentState === 'listening') {
      this.transitionTo('idle');
    }
  }

  onReject(): void {
    // Can reject from idle or wandering states
    if (this.currentState === 'idle' || this.currentState === 'wandering') {
      this.rejectShakeTime = 0;
      this.transitionTo('rejecting');
    }
  }

  private clampToScreen(pos: Position): Position {
    // screenBounds already accounts for window size, no need to subtract PET_SIZE
    return {
      x: Math.max(0, Math.min(pos.x, this.screenBounds.width)),
      y: Math.max(0, Math.min(pos.y, this.screenBounds.height)),
    };
  }

  getState(): BehaviorState {
    return this.currentState;
  }

  // Mood system integration
  setMoodSleeping(sleeping: boolean): void {
    this.isMoodSleeping = sleeping;
    if (sleeping && this.currentState !== 'being_dragged') {
      // If grumpy_waking, queue yawning -> sleeping for after it finishes
      if (this.currentState === 'grumpy_waking') {
        this.queueAnimations('yawning', 'sleeping');
        return;
      }
      // Don't interrupt yawning - it will transition to sleeping automatically
      if (this.currentState !== 'yawning' && this.currentState !== 'sleeping') {
        this.transitionTo('yawning'); // Play yawn before sleep
      }
    } else if (!sleeping) {
      // Don't override grumpy_waking with normal waking
      if (this.currentState === 'grumpy_waking') {
        return; // Let grumpy animation finish, queue is empty so will go to idle
      }
      if (this.currentState === 'sleeping') {
        this.transitionTo('waking'); // Play wake animation after sleep
      }
    }
  }

  // Trigger grumpy wake animation (called when force waking at low energy)
  // Uses forceTransition to clear any pending animations and show angry immediately
  onGrumpyWake(): void {
    this.forceTransition('grumpy_waking');
  }

  isSleeping(): boolean {
    return this.currentState === 'sleeping';
  }

  // Set happiness level for mood-based idle animations
  setHappiness(value: number): void {
    this.happiness = value;
    this.isLowHappiness = value < 40;
  }

  // Set energy level
  setEnergy(value: number): void {
    this.energy = value;
  }

  // Trigger eating animation
  onEat(): void {
    if (this.currentState === 'idle' || this.currentState === 'wandering' || this.currentState === 'landing' || this.currentState === 'reacting') {
      this.transitionTo('eating');
    }
  }

  // Trigger dancing animation
  onDance(): void {
    if (this.currentState === 'idle' || this.currentState === 'wandering' || this.currentState === 'landing' || this.currentState === 'reacting') {
      this.transitionTo('dancing');
    }
  }

  // Trigger talking animation (when AI responds)
  onTalkStart(): void {
    if (this.currentState === 'listening') {
      this.transitionTo('talking');
    }
  }

  onTalkEnd(): void {
    if (this.currentState === 'talking') {
      this.transitionTo('idle');
    }
  }

  // Trigger playing animation (play catch)
  onPlay(): void {
    if (this.currentState === 'idle' || this.currentState === 'wandering' || this.currentState === 'landing' || this.currentState === 'reacting') {
      this.transitionTo('playing');
    }
  }

  // Trigger shaking animation (gentle shake)
  onShake(): void {
    if (this.currentState === 'idle' || this.currentState === 'wandering' || this.currentState === 'landing' || this.currentState === 'reacting') {
      this.transitionTo('shaking');
    }
  }

  // Set callback for when pet gets hurt (running into edge)
  setOnHurtCallback(callback: () => void): void {
    this.onHurtCallback = callback;
  }
}
