import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PetBehavior } from '../../services/PetBehavior';
import { Position, AnimationType, Direction } from '../../types';
import './Pet.css';

const PET_SIZE = 40;
const WINDOW_SIZE = 50;

export function Pet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const behaviorRef = useRef<PetBehavior | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<AnimationType>('idle');
  const [direction, setDirection] = useState<Direction>('right');
  const [frame, setFrame] = useState(0);
  const [squishFactor, setSquishFactor] = useState(1.0);

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

        setAnimation(result.animation);
        setDirection(result.direction);
        if (result.squishFactor !== undefined) {
          setSquishFactor(result.squishFactor);
        } else {
          setSquishFactor(1.0);
        }
      }

      // Update frame for animation
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

    // Draw placeholder slime (cute blob)
    const centerX = WINDOW_SIZE / 2;
    const centerY = WINDOW_SIZE / 2 + 2;
    const baseRadius = 18;

    // Bounce animation
    const bounceOffset = Math.sin(frame * 0.5) * 3;
    const walkSquish = animation === 'walk' ? 0.9 + Math.sin(frame * 0.8) * 0.1 : 1;
    // Combine walk squish with landing squish (volume preservation: X * Y = constant)
    const squishX = walkSquish / squishFactor;  // Wider when squishFactor > 1
    const squishY = walkSquish * squishFactor;  // Shorter when squishFactor > 1

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
    let mainColor = '#7EC8E3'; // blue
    let lightColor = '#B5E4F7';

    if (animation === 'happy') {
      mainColor = '#FFB6C1'; // pink
      lightColor = '#FFE4E8';
    } else if (animation === 'sleep') {
      mainColor = '#9B8EC8'; // purple
      lightColor = '#C4B8E8';
    } else if (animation === 'drag') {
      mainColor = '#98D8AA'; // green
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

    // Blinking
    const isBlinking = frame % 20 === 0;

    if (animation === 'sleep' || isBlinking) {
      // Closed eyes (lines)
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - eyeSpacing - 2, eyeY);
      ctx.lineTo(centerX - eyeSpacing + 2, eyeY);
      ctx.moveTo(centerX + eyeSpacing - 2, eyeY);
      ctx.lineTo(centerX + eyeSpacing + 2, eyeY);
      ctx.stroke();
    } else {
      // Open eyes
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.ellipse(centerX - eyeSpacing, eyeY, 2, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(centerX + eyeSpacing, eyeY, 2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
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
      // Big smile
      ctx.arc(centerX, mouthY - 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    } else if (animation === 'sleep') {
      // Small o mouth
      ctx.ellipse(centerX, mouthY, 2, 1.5, 0, 0, Math.PI * 2);
    } else {
      // Normal smile
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

  }, [frame, animation, direction]);

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    // Lưu offset = vị trí click trong window (clientX/Y)
    // Dùng ref để tránh stale closure trong event listeners
    dragOffsetRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    behaviorRef.current?.onDragStart();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Vị trí window mới = screenX/Y - offset
    // screenX/Y là logical pixels, khớp với Tauri LogicalPosition
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
      // Tính vị trí cuối cùng dùng cùng công thức với handleMouseMove
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
