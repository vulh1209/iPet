import { Position, AnimationType, Direction, ScreenBounds } from '../types';

type BehaviorState = 'idle' | 'wandering' | 'sleeping' | 'being_dragged' | 'reacting' | 'landing' | 'listening';

interface BehaviorResult {
  position: Position;
  animation: AnimationType;
  direction: Direction;
  squishFactor?: number;
}

export class PetBehavior {
  private currentState: BehaviorState = 'idle';
  private stateTimer: number = 0;
  private targetPosition: Position | null = null;
  private position: Position;
  private screenBounds: ScreenBounds;
  private direction: Direction = 'right';
  private isMoodSleeping: boolean = false; // Controlled by mood system

  private readonly WANDER_SPEED = 30; // pixels per second
  private readonly PET_SIZE = 50;
  private readonly IDLE_MIN = 10000; // 10 seconds minimum
  private readonly IDLE_MAX = 20000; // 20 seconds maximum
  private readonly WANDER_CHANCE = 0.6;

  // Landing bounce physics
  private landingBaseY: number = 0;
  private landingVelocity: number = 0;
  private landingOffset: number = 0;

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
      default:
        return this.handleIdleState();
    }
  }

  private handleIdleState(): BehaviorResult {
    // If mood system says sleeping, transition to sleep
    if (this.isMoodSleeping) {
      this.transitionTo('sleeping');
      return this.handleSleepingState();
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
      animation: 'idle',
      direction: this.direction,
    };
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
      this.transitionTo('sleeping');
    } else if (!sleeping && this.currentState === 'sleeping') {
      this.transitionTo('idle');
    }
  }

  isSleeping(): boolean {
    return this.currentState === 'sleeping';
  }
}
