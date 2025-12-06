import { Position, AnimationType, Direction, ScreenBounds } from '../types';

type BehaviorState = 'idle' | 'wandering' | 'sleeping' | 'being_dragged' | 'reacting' | 'landing';

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

  private readonly WANDER_SPEED = 30; // pixels per second
  private readonly PET_SIZE = 50;
  private readonly IDLE_MIN = 2000;
  private readonly IDLE_MAX = 5000;
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
      default:
        return this.handleIdleState();
    }
  }

  private handleIdleState(): BehaviorResult {
    const idleDuration = this.randomInRange(this.IDLE_MIN, this.IDLE_MAX);

    if (this.stateTimer > idleDuration) {
      const roll = Math.random();
      if (roll < this.WANDER_CHANCE) {
        this.transitionTo('wandering');
        this.pickRandomTarget();
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

  private pickRandomTarget(): void {
    const margin = this.PET_SIZE;
    this.targetPosition = {
      x: margin + Math.random() * (this.screenBounds.width - margin * 2 - this.PET_SIZE),
      y: margin + Math.random() * (this.screenBounds.height - margin * 2 - this.PET_SIZE),
    };
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
    // Don't react if being dragged or landing (just dropped)
    if (this.currentState !== 'being_dragged' && this.currentState !== 'landing') {
      this.transitionTo('reacting');
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
}
