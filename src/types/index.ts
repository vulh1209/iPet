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
  | 'walk'
  | 'sleep'
  | 'happy'
  | 'talk'
  | 'curious'
  | 'drag';

export type Direction = 'left' | 'right';

export type Emotion = 'neutral' | 'happy' | 'sad' | 'excited' | 'sleepy';

export interface PetState {
  position: Position;
  animation: AnimationType;
  direction: Direction;
  emotion: Emotion;
  isDragging: boolean;
}
