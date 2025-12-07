import { AnimationType, Direction } from '../types';
import { LoadedSprite } from '../types/sprite';
import { getFrameRect } from './SpriteLoader';

/**
 * Draw sprite to canvas with transforms (direction flip, squish effect)
 * @returns true if drawing was successful
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: LoadedSprite,
  animation: AnimationType,
  direction: Direction,
  squishFactor: number,
  frameIndex: number,
  canvasSize: number
): boolean {
  const animDef = sprite.config.animations[animation];
  const spriteImage = sprite.images.get(animation);

  if (!animDef || !spriteImage) return false;

  const frameRect = getFrameRect(spriteImage, animDef.frames, frameIndex);

  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.save();

  // Apply direction flip
  if (direction === 'left') {
    ctx.translate(canvasSize, 0);
    ctx.scale(-1, 1);
  }

  // Apply squish effect (volume preservation)
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  ctx.translate(centerX, centerY);
  ctx.scale(1 / squishFactor, squishFactor);
  ctx.translate(-centerX, -centerY);

  // Calculate destination rect with aspect ratio preserved
  const aspectRatio = frameRect.width / frameRect.height;
  let destWidth: number;
  let destHeight: number;
  let destX: number;
  let destY: number;

  if (aspectRatio > 1) {
    // Wider than tall - fit to width
    destWidth = canvasSize;
    destHeight = canvasSize / aspectRatio;
    destX = 0;
    destY = (canvasSize - destHeight) / 2;
  } else {
    // Taller than wide - fit to height
    destHeight = canvasSize;
    destWidth = canvasSize * aspectRatio;
    destX = (canvasSize - destWidth) / 2;
    destY = 0;
  }

  ctx.drawImage(
    spriteImage,
    frameRect.x, frameRect.y, frameRect.width, frameRect.height,
    destX, destY, destWidth, destHeight
  );

  ctx.restore();
  return true;
}
