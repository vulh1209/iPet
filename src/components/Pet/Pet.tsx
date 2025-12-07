import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PetBehavior } from '../../services/PetBehavior';
import { AnimationType, Direction } from '../../types';
import { useSprite } from '../../hooks/useSprite';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useSettings } from '../../hooks/useSettings';
import { useMood } from '../../hooks/useMood';
import { LoadedSprite } from '../../types/sprite';
import { getFrameRect, getFrameIndex } from '../../services/SpriteLoader';
import { MoodIndicator } from '../MoodIndicator';
import { EnergyBar } from '../EnergyBar';
import { HappinessBar } from '../HappinessBar';
import './Pet.css';

const WINDOW_SIZE = 100;
const EXPANDED_HEIGHT = 220; // Extra height for speech bubble with decorations

/**
 * Draw sprite to canvas with transforms (direction flip, squish effect)
 * Returns true if drawing was successful
 */
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: LoadedSprite,
  animation: AnimationType,
  direction: Direction,
  squishFactor: number,
  frameIndex: number
): boolean {
  const animDef = sprite.config.animations[animation];
  const spriteImage = sprite.images.get(animation);

  if (!animDef || !spriteImage) return false;

  const frameRect = getFrameRect(spriteImage, animDef.frames, frameIndex);

  ctx.clearRect(0, 0, WINDOW_SIZE, WINDOW_SIZE);
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

  // Calculate destination rect with aspect ratio preserved
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
  return true;
}

export function Pet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const behaviorRef = useRef<PetBehavior | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);
  const lastAnimationRef = useRef<AnimationType>('idle');

  // Refs for tracking previous state to optimize redraws
  const lastFrameRef = useRef<number>(0);
  const lastDirectionRef = useRef<Direction>('right');
  const lastSquishRef = useRef<number>(1);

  const [, setScreenSize] = useState({ width: 1920, height: 1080 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // State kept for potential UI/debugging use
  const [, setAnimation] = useState<AnimationType>('idle');
  const [, setDirection] = useState<Direction>('right');
  const [, setSquishFactor] = useState(1.0);
  const [isRejecting, setIsRejecting] = useState(false);

  // Load sprites
  const { sprite, isLoading: spriteLoading } = useSprite('slime');

  // Mood system
  const {
    happiness,
    energy,
    isSleeping,
    triggerInteraction,
    forceWakeUp,
    canTriggerMorningGreeting,
  } = useMood();

  // Voice input
  const { settings } = useSettings();
  const {
    isListening,
    isProcessing,
    transcript,
    response,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceInput();

  // Right-click for voice input (double-click conflicts with app close)

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

  // Animation loop with integrated drawing
  useEffect(() => {
    function gameLoop(timestamp: number) {
      if (!behaviorRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      let currentAnimation: AnimationType = 'idle';
      let currentDirection: Direction = 'right';
      let currentSquish = 1.0;

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

        currentAnimation = result.animation;
        currentDirection = result.direction;
        currentSquish = result.squishFactor ?? 1.0;

        setAnimation(currentAnimation);
        setDirection(currentDirection);
        setSquishFactor(currentSquish);
        setIsRejecting(result.isRejecting ?? false);
      } else {
        // While dragging: use drag animation
        animationTimeRef.current += deltaTime;
        currentAnimation = 'drag';
        currentDirection = lastDirectionRef.current;
        currentSquish = 1.0;
      }

      // Draw sprite if loaded
      if (sprite && !spriteLoading) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx) {
          const animDef = sprite.config.animations[currentAnimation];
          if (animDef) {
            const newFrame = getFrameIndex(animationTimeRef.current, animDef);

            // Only redraw when state changes (optimized rendering)
            const needsRedraw =
              newFrame !== lastFrameRef.current ||
              currentAnimation !== lastAnimationRef.current ||
              currentDirection !== lastDirectionRef.current ||
              currentSquish !== lastSquishRef.current;

            if (needsRedraw) {
              drawSprite(ctx, sprite, currentAnimation, currentDirection, currentSquish, newFrame);

              // Update tracking refs
              lastFrameRef.current = newFrame;
              lastDirectionRef.current = currentDirection;
              lastSquishRef.current = currentSquish;
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDragging, sprite, spriteLoading]);

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    behaviorRef.current?.onDragStart();
    // Wake up pet if sleeping when dragged
    forceWakeUp();
  }, [forceWakeUp]);

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
      // Dragging costs energy
      triggerInteraction('drag');
    }
  }, [isDragging, triggerInteraction]);

  // Click = pet react + mood interaction
  const handleClick = useCallback(() => {
    if (isDragging) return;

    // Check for morning greeting bonus (first interaction of the day)
    if (canTriggerMorningGreeting) {
      triggerInteraction('morningGreeting');
    }

    // Trigger petting interaction
    triggerInteraction('pet');
    behaviorRef.current?.onClick();
  }, [isDragging, canTriggerMorningGreeting, triggerInteraction]);

  // Keyboard shortcuts for interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if sleeping (except for some interactions)
      const key = e.key.toLowerCase();

      // Press "V" to start voice input
      if (key === 'v') {
        if (settings.microphone.enabled && !isListening && !isProcessing && !isSleeping) {
          e.preventDefault();
          startListening();
          behaviorRef.current?.onListeningStart();
        }
      }

      // Press "T" to give treat
      if (key === 't' && !isSleeping) {
        e.preventDefault();
        if (triggerInteraction('treat')) {
          behaviorRef.current?.onEat(); // Show eating animation
        } else {
          behaviorRef.current?.onReject(); // Show rejection (cooldown/limit)
        }
      }

      // Press "D" for dance party
      if (key === 'd' && !isSleeping) {
        e.preventDefault();
        if (triggerInteraction('danceParty')) {
          behaviorRef.current?.onDance(); // Show dancing animation
        } else {
          behaviorRef.current?.onReject(); // Show rejection (cooldown/low energy)
        }
      }

      // Press "L" for lullaby (puts pet to sleep)
      if (key === 'l' && !isSleeping) {
        e.preventDefault();
        if (!triggerInteraction('lullaby')) {
          behaviorRef.current?.onReject(); // Show rejection (cooldown)
        }
      }

      // Press "C" for play catch
      if (key === 'c' && !isSleeping) {
        e.preventDefault();
        if (triggerInteraction('playCatch')) {
          behaviorRef.current?.onPlay();
        } else {
          behaviorRef.current?.onReject();
        }
      }

      // Press "S" for gentle shake
      if (key === 's' && !isSleeping) {
        e.preventDefault();
        if (triggerInteraction('shake')) {
          behaviorRef.current?.onShake();
        } else {
          behaviorRef.current?.onReject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.microphone.enabled, isListening, isProcessing, isSleeping, startListening, triggerInteraction]);

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

  // Handle voice input state changes
  useEffect(() => {
    if (!isListening && !isProcessing) {
      // Voice input ended - transition pet back to idle
      behaviorRef.current?.onListeningEnd();
    }
  }, [isListening, isProcessing]);

  // Sync mood state with behavior for mood-based animations
  useEffect(() => {
    behaviorRef.current?.setMoodSleeping(isSleeping);
    behaviorRef.current?.setHappiness(happiness);
    behaviorRef.current?.setEnergy(energy);
  }, [isSleeping, happiness, energy]);

  // Trigger voice chat interaction and talk animation when we get a response
  useEffect(() => {
    if (response?.text) {
      triggerInteraction('voiceChat');
      behaviorRef.current?.onTalkStart(); // Show talk animation

      // Check for compliment in the transcript
      const lowerTranscript = (transcript || '').toLowerCase();
      const complimentWords = ['good', 'love', 'cute', 'beautiful', 'pretty', 'sweet', 'adorable', 'yêu', 'thương', 'xinh', 'đẹp'];
      const hasCompliment = complimentWords.some(word => lowerTranscript.includes(word));
      if (hasCompliment) {
        triggerInteraction('compliment');
      }
    } else {
      // End talk animation when response clears
      behaviorRef.current?.onTalkEnd();
    }
  }, [response, transcript, triggerInteraction]);

  // Stop listening on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Determine which indicator to show
  const showMicIndicator = isListening || isProcessing;
  const showErrorIndicator = voiceError !== null;
  const showSpeechBubble = !!(transcript || response?.text);

  // Resize window when speech bubble needs to show
  useEffect(() => {
    if (showSpeechBubble) {
      // Expand window to fit speech bubble above
      invoke('set_window_size', { width: WINDOW_SIZE, height: EXPANDED_HEIGHT });
    } else {
      // Return to normal size
      invoke('set_window_size', { width: WINDOW_SIZE, height: WINDOW_SIZE });
    }
  }, [showSpeechBubble]);

  return (
    <div className="pet-container" onClick={handleClick}>
      {/* Speech bubble for transcript/response - above pet */}
      {showSpeechBubble && (
        <div className="speech-bubble">
          {/* Floating sparkle decorations */}
          <span className="speech-sparkle speech-sparkle--1" />
          <span className="speech-sparkle speech-sparkle--2" />
          <span className="speech-sparkle speech-sparkle--3" />
          <span className="speech-sparkle speech-sparkle--4" />
          <span className="speech-star" />

          {/* Glass content area */}
          <div className="speech-bubble-content">
            {response?.text || transcript}
          </div>
        </div>
      )}

      {/* Pet canvas - at bottom */}
      <div className="pet-wrapper">
        <canvas
          ref={canvasRef}
          width={WINDOW_SIZE}
          height={WINDOW_SIZE}
          onMouseDown={handleMouseDown}
          className="pet-canvas"
        />

        {/* Mood indicator */}
        <MoodIndicator
          happiness={happiness}
          energy={energy}
          isSleeping={isSleeping}
          isActive={showMicIndicator}
        />

        {/* Happiness bar above energy bar */}
        <HappinessBar
          happiness={happiness}
          isVisible={settings.show_happiness_bar ?? true}
          isSleeping={isSleeping}
        />

        {/* Energy bar below pet */}
        <EnergyBar
          energy={energy}
          isVisible={settings.show_energy_bar ?? true}
          isSleeping={isSleeping}
        />

        {/* Voice input indicators - pure CSS visual */}
        {showMicIndicator && (
          <div className={`voice-indicator ${isProcessing ? 'processing' : 'listening'}`} />
        )}

        {showErrorIndicator && !showMicIndicator && (
          <div className="voice-indicator error" />
        )}

        {/* Rejection indicator - X icon when action on cooldown */}
        {isRejecting && (
          <div className="reject-indicator" />
        )}
      </div>
    </div>
  );
}
