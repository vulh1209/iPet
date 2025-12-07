export interface Position {
  x: number;
  y: number;
}

export interface ScreenBounds {
  width: number;
  height: number;
}

export type AnimationType =
  | 'idle'
  | 'idle_happy'
  | 'idle_ecstatic'
  | 'idle_blink'
  | 'idle_look'
  | 'walk'
  | 'walk_tired'
  | 'sleep'
  | 'happy'
  | 'talk'
  | 'curious'
  | 'drag'
  | 'reject'
  | 'angry'
  | 'sad'
  | 'eat'
  | 'dance'
  | 'yawn'
  | 'wake';

export type Direction = 'left' | 'right';

export type Emotion = 'neutral' | 'happy' | 'sad' | 'excited' | 'sleepy';

export interface PetState {
  position: Position;
  animation: AnimationType;
  direction: Direction;
  emotion: Emotion;
  isDragging: boolean;
}

// Re-export sprite types
export * from './sprite';

// Re-export mood types
export * from './mood';
