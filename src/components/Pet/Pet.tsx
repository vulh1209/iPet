import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PetBehavior } from '../../services/PetBehavior';
import { AnimationType, Direction } from '../../types';
import { useSprite } from '../../hooks/useSprite';
import { getFrameRect, getFrameIndex } from '../../services/SpriteLoader';
import './Pet.css';

const WINDOW_SIZE = 100;

export function Pet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const behaviorRef = useRef<PetBehavior | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);
  const lastAnimationRef = useRef<AnimationType>('idle');

  const [, setScreenSize] = useState({ width: 1920, height: 1080 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<AnimationType>('idle');
  const [direction, setDirection] = useState<Direction>('right');
  const [frame, setFrame] = useState(0);
  const [squishFactor, setSquishFactor] = useState(1.0);

  // Load sprites
  const { sprite, isLoading: spriteLoading } = useSprite('slime');

  // Initialize
  useEffect(() => {
    async function init() {
      try {
        const [width, height] = await invoke<[number, number]>('get_screen_size');
        setScreenSize({ width, height });

        behaviorRef.current = new PetBehavior(
          { x: 100, y: 100 },
          { width: width - WINDOW_SIZE, height: height - WINDOW_SIZE }
        );
      } catch (e) {
        console.error('Failed to get screen size:', e);
        behaviorRef.current = new PetBehavior(
          { x: 100, y: 100 },
          { width: 1920 - WINDOW_SIZE, height: 1080 - WINDOW_SIZE }
        );
      }
    }
    init();
  }, []);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;

    function gameLoop(timestamp: number) {
      if (!behaviorRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      if (!isDragging) {
        const result = behaviorRef.current.update(deltaTime);

        // Update window position
        invoke('set_window_position', {
          x: Math.round(result.position.x),
          y: Math.round(result.position.y),
        });

        // Reset animation time when animation changes
        if (result.animation !== lastAnimationRef.current) {
          animationTimeRef.current = 0;
          lastAnimationRef.current = result.animation;
        } else {
          animationTimeRef.current += deltaTime;
        }

        setAnimation(result.animation);
        setDirection(result.direction);
        if (result.squishFactor !== undefined) {
          setSquishFactor(result.squishFactor);
        } else {
          setSquishFactor(1.0);
        }
      } else {
        // Still update animation time while dragging
        animationTimeRef.current += deltaTime;
      }

      // Update frame for procedural fallback animation
      frameCount++;
      if (frameCount % 10 === 0) {
        setFrame(f => (f + 1) % 4);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDragging]);

  // Draw pet on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WINDOW_SIZE, WINDOW_SIZE);

    // Try to draw sprite if loaded
    if (sprite && !spriteLoading) {
      const animDef = sprite.config.animations[animation];
      const spriteImage = sprite.images.get(animation);

      if (animDef && spriteImage) {
        // Calculate current frame
        const frameIndex = getFrameIndex(animationTimeRef.current, animDef);
        const frameRect = getFrameRect(spriteImage, animDef.frames, frameIndex);

        ctx.save();

        // Apply direction flip
        if (direction === 'left') {
          ctx.translate(WINDOW_SIZE, 0);
          ctx.scale(-1, 1);
        }

        // Apply squish effect (volume preservation)
        const centerX = WINDOW_SIZE / 2;
        const centerY = WINDOW_SIZE / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(1 / squishFactor, squishFactor);
        ctx.translate(-centerX, -centerY);

        // Draw sprite with correct aspect ratio (fit inside window)
        const aspectRatio = frameRect.width / frameRect.height;
        let destWidth: number;
        let destHeight: number;
        let destX: number;
        let destY: number;

        if (aspectRatio > 1) {
          // Wider than tall - fit to width
          destWidth = WINDOW_SIZE;
          destHeight = WINDOW_SIZE / aspectRatio;
          destX = 0;
          destY = (WINDOW_SIZE - destHeight) / 2;
        } else {
          // Taller than wide - fit to height
          destHeight = WINDOW_SIZE;
          destWidth = WINDOW_SIZE * aspectRatio;
          destX = (WINDOW_SIZE - destWidth) / 2;
          destY = 0;
        }

        ctx.drawImage(
          spriteImage,
          frameRect.x, frameRect.y, frameRect.width, frameRect.height,
          destX, destY, destWidth, destHeight
        );

        ctx.restore();
        return; // Skip procedural drawing
      }
    }

    // Fallback: Draw procedural slime
    drawProceduralSlime(ctx, animation, direction, frame, squishFactor);

  }, [frame, animation, direction, squishFactor, sprite, spriteLoading]);

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    behaviorRef.current?.onDragStart();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.screenX - dragOffsetRef.current.x;
    const newY = e.screenY - dragOffsetRef.current.y;

    invoke('set_window_position', {
      x: Math.round(newX),
      y: Math.round(newY),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      const newPosition = {
        x: e.screenX - dragOffsetRef.current.x,
        y: e.screenY - dragOffsetRef.current.y,
      };
      behaviorRef.current?.onDragEnd(newPosition);
    }
  }, [isDragging]);

  const handleClick = useCallback(() => {
    if (!isDragging) {
      behaviorRef.current?.onClick();
    }
  }, [isDragging]);

  // Global mouse event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="pet-container" onClick={handleClick}>
      <canvas
        ref={canvasRef}
        width={WINDOW_SIZE}
        height={WINDOW_SIZE}
        onMouseDown={handleMouseDown}
        className="pet-canvas"
      />
    </div>
  );
}

/**
 * Draw procedural slime as fallback when sprites are not loaded
 */
function drawProceduralSlime(
  ctx: CanvasRenderingContext2D,
  animation: AnimationType,
  direction: Direction,
  frame: number,
  squishFactor: number
) {
  const centerX = WINDOW_SIZE / 2;
  const centerY = WINDOW_SIZE / 2 + 2;
  const baseRadius = 18;

  // Bounce animation
  const bounceOffset = Math.sin(frame * 0.5) * 3;
  const walkSquish = animation === 'walk' ? 0.9 + Math.sin(frame * 0.8) * 0.1 : 1;
  const squishX = walkSquish / squishFactor;
  const squishY = walkSquish * squishFactor;

  ctx.save();

  // Flip if facing left
  if (direction === 'left') {
    ctx.translate(WINDOW_SIZE, 0);
    ctx.scale(-1, 1);
  }

  // Body
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY - bounceOffset,
    baseRadius * squishX,
    baseRadius * squishY,
    0,
    0,
    Math.PI * 2
  );

  // Gradient for cute look
  const gradient = ctx.createRadialGradient(
    centerX - 10,
    centerY - bounceOffset - 15,
    5,
    centerX,
    centerY - bounceOffset,
    baseRadius
  );

  // Color based on animation
  let mainColor = '#7EC8E3';
  let lightColor = '#B5E4F7';

  if (animation === 'happy') {
    mainColor = '#FFB6C1';
    lightColor = '#FFE4E8';
  } else if (animation === 'sleep') {
    mainColor = '#9B8EC8';
    lightColor = '#C4B8E8';
  } else if (animation === 'drag') {
    mainColor = '#98D8AA';
    lightColor = '#C8F0D4';
  }

  gradient.addColorStop(0, lightColor);
  gradient.addColorStop(1, mainColor);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  const eyeY = centerY - bounceOffset - 2;
  const eyeSpacing = 5;
  const isBlinking = frame % 20 === 0;

  if (animation === 'sleep' || isBlinking) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 2, eyeY);
    ctx.lineTo(centerX - eyeSpacing + 2, eyeY);
    ctx.moveTo(centerX + eyeSpacing - 2, eyeY);
    ctx.lineTo(centerX + eyeSpacing + 2, eyeY);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing, eyeY, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + eyeSpacing, eyeY, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing + 0.5, eyeY - 0.5, 0.8, 0.8, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + eyeSpacing + 0.5, eyeY - 0.5, 0.8, 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  const mouthY = centerY - bounceOffset + 5;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();

  if (animation === 'happy') {
    ctx.arc(centerX, mouthY - 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
  } else if (animation === 'sleep') {
    ctx.ellipse(centerX, mouthY, 2, 1.5, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(centerX, mouthY - 1, 3, 0.1 * Math.PI, 0.9 * Math.PI);
  }
  ctx.stroke();

  // Blush
  ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
  ctx.beginPath();
  ctx.ellipse(centerX - 10, eyeY + 3, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + 10, eyeY + 3, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Sleep Z's
  if (animation === 'sleep') {
    ctx.fillStyle = '#666';
    ctx.font = '8px Arial';
    const zOffset = (frame % 4) * 2;
    ctx.fillText('z', centerX + 12, centerY - 15 - zOffset);
    ctx.font = '6px Arial';
    ctx.fillText('z', centerX + 16, centerY - 20 - zOffset);
  }
}
