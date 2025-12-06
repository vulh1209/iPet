import { AnimationType } from './index';

/**
 * Configuration for a single animation within a sprite
 */
export interface AnimationDef {
  /** Filename of the sprite sheet (e.g., "idle.png") */
  file: string;
  /** Number of frames in the animation */
  frames: number;
  /** Duration of each frame in milliseconds */
  frameDuration: number;
  /** Whether the animation should loop */
  loop: boolean;
}

/**
 * Configuration for a complete sprite/skin
 */
export interface SpriteConfig {
  /** Unique identifier for the sprite */
  id: string;
  /** Display name */
  name: string;
  /** Animation definitions keyed by animation type */
  animations: Partial<Record<AnimationType, AnimationDef>>;
}

/**
 * A fully loaded sprite with all images ready to render
 */
export interface LoadedSprite {
  /** The sprite configuration */
  config: SpriteConfig;
  /** Loaded images keyed by animation type */
  images: Map<AnimationType, HTMLImageElement>;
}

/**
 * Rectangle defining a frame's position in a sprite sheet
 */
export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
