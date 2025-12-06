import { AnimationType } from '../types';
import { SpriteConfig, LoadedSprite, FrameRect, AnimationDef } from '../types/sprite';

// Cache for loaded sprites
const spriteCache = new Map<string, LoadedSprite>();

/**
 * Load sprite configuration from JSON file
 */
export async function loadSpriteConfig(skinId: string): Promise<SpriteConfig> {
  const response = await fetch(`/sprites/${skinId}/config.json`);
  if (!response.ok) {
    throw new Error(`Failed to load sprite config for ${skinId}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Load a single image and return a promise
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Load all sprite images based on config
 */
export async function loadSpriteImages(config: SpriteConfig): Promise<LoadedSprite> {
  // Check cache first
  const cached = spriteCache.get(config.id);
  if (cached) {
    return cached;
  }

  const images = new Map<AnimationType, HTMLImageElement>();
  const basePath = `/sprites/${config.id}`;

  // Load all animation images in parallel
  const entries = Object.entries(config.animations) as [AnimationType, AnimationDef][];
  const loadPromises = entries.map(async ([animType, animDef]) => {
    const img = await loadImage(`${basePath}/${animDef.file}`);
    images.set(animType, img);
  });

  await Promise.all(loadPromises);

  const loadedSprite: LoadedSprite = {
    config,
    images,
  };

  // Cache the result
  spriteCache.set(config.id, loadedSprite);

  return loadedSprite;
}

/**
 * Load a complete sprite (config + images)
 */
export async function loadSprite(skinId: string): Promise<LoadedSprite> {
  const config = await loadSpriteConfig(skinId);
  return loadSpriteImages(config);
}

/**
 * Calculate the rectangle for a specific frame in a sprite sheet
 * Frames are arranged horizontally (left to right)
 */
export function getFrameRect(
  image: HTMLImageElement,
  frameCount: number,
  frameIndex: number
): FrameRect {
  const frameWidth = image.width / frameCount;
  const frameHeight = image.height;

  return {
    x: frameIndex * frameWidth,
    y: 0,
    width: frameWidth,
    height: frameHeight,
  };
}

/**
 * Get the current frame index based on animation time
 */
export function getFrameIndex(
  animationTime: number,
  animDef: AnimationDef
): number {
  const totalDuration = animDef.frames * animDef.frameDuration;

  if (animDef.loop) {
    // Loop: use modulo
    const time = animationTime % totalDuration;
    return Math.floor(time / animDef.frameDuration);
  } else {
    // No loop: clamp to last frame
    if (animationTime >= totalDuration) {
      return animDef.frames - 1;
    }
    return Math.floor(animationTime / animDef.frameDuration);
  }
}

/**
 * Clear the sprite cache
 */
export function clearSpriteCache(): void {
  spriteCache.clear();
}
