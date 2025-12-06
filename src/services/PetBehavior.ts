import { Position, AnimationType, Direction, ScreenBounds } from '../types';

type BehaviorState = 'idle' | 'wandering' | 'sleeping' | 'being_dragged' | 'reacting';

interface BehaviorResult {
  position: Position;
  animation: AnimationType;
  direction: Direction;
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
    this.transitionTo('idle');
  }

  onClick(): void {
    if (this.currentState !== 'being_dragged') {
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
