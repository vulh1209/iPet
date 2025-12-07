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
  | 'talking'      // When AI is responding
  | 'eating'       // When eating treat
  | 'dancing'      // When dance party
  | 'yawning'      // Pre-sleep transition
  | 'waking'       // Post-sleep transition
  | 'grumpy_waking' // Angry wake when disturbed at low energy
  | 'playing'      // When playing catch
  | 'shaking';     // When being gently shaken

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
  private isLowEnergy: boolean = false; // Energy < 20
  private isLowHappiness: boolean = false; // Happiness < 40
  private happiness: number = 50; // Current happiness level for mood-based animations

  // Animation queue for sequential animations
  private animationQueue: BehaviorState[] = [];

  private readonly WANDER_SPEED = 30; // pixels per second
  private readonly PET_SIZE = 50;
  private readonly IDLE_MIN = 10000; // 10 seconds minimum
  private readonly IDLE_MAX = 20000; // 20 seconds maximum
  private readonly WANDER_CHANCE = 0.6;

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
  private readonly GRUMPY_WAKE_DURATION = 4000; // ms - angry animation when disturbed (4 seconds)
  private readonly PLAY_DURATION = 3000; // ms - playing catch animation
  private readonly SHAKE_DURATION = 800; // ms - gentle shake animation

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
   * Priority: angry (low energy) > sad (low happiness) > ecstatic > happy > idle
   */
  private selectIdleAnimation(): AnimationType {
    if (this.isLowEnergy) return 'angry';
    if (this.isLowHappiness) return 'sad';
    if (this.happiness >= 80) return 'idle_ecstatic';
    if (this.happiness >= 60) return 'idle_happy';
    return 'idle';
  }

  private handleWanderingState(deltaTime: number): BehaviorResult {
    if (!this.targetPosition) {
      this.transitionTo('idle');
      return this.handleIdleState();
    }

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Reached target
    if (distance < 5) {
      this.targetPosition = null;
      this.transitionTo('idle');
      return {
        position: this.position,
        animation: 'idle',
        direction: this.direction,
      };
    }

    // Move towards target
    const moveDistance = (this.WANDER_SPEED * deltaTime) / 1000;
    const ratio = Math.min(moveDistance / distance, 1);

    this.position = {
      x: this.position.x + dx * ratio,
      y: this.position.y + dy * ratio,
    };

    this.direction = dx > 0 ? 'right' : 'left';

    return {
      position: this.position,
      animation: 'walk',
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

    for (let i = 0; i < maxAttempts; i++) {
      // Pick random angle (0 to 360 degrees)
      const angle = Math.random() * Math.PI * 2;
      // Random distance 50-200 pixels
      const distance = this.randomInRange(50, 200);

      // Calculate target based on direction
      const targetX = this.position.x + Math.cos(angle) * distance;
      const targetY = this.position.y + Math.sin(angle) * distance;

      // Clamp to screen bounds
      const clamped = this.clampToScreen({ x: targetX, y: targetY });

      // Check if target is far enough (avoid edge cases when pet is in corner)
      const dx = clamped.x - this.position.x;
      const dy = clamped.y - this.position.y;
      const actualDistance = Math.sqrt(dx * dx + dy * dy);

      if (actualDistance >= 20) {
        this.targetPosition = clamped;
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
    return {
      x: Math.max(0, Math.min(pos.x, this.screenBounds.width - this.PET_SIZE)),
      y: Math.max(0, Math.min(pos.y, this.screenBounds.height - this.PET_SIZE)),
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

  // Low energy state (energy < 20)
  setLowEnergy(isLow: boolean): void {
    this.isLowEnergy = isLow;
  }

  // Set happiness level for mood-based idle animations
  setHappiness(value: number): void {
    this.happiness = value;
    this.isLowHappiness = value < 40;
  }

  // Set energy level
  setEnergy(value: number): void {
    this.isLowEnergy = value < 20;
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
}
