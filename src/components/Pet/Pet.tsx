import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PetBehavior } from '../../services/PetBehavior';
import { AnimationType, Direction } from '../../types';
import { PET_COLOR_PRESETS, PetColorPreset } from '../../types/settings';
import { useSprite } from '../../hooks/useSprite';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useSettings } from '../../hooks/useSettings';
import { useMood } from '../../hooks/useMood';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { usePetDrag } from '../../hooks/usePetDrag';
import { getFrameIndex } from '../../services/SpriteLoader';
import { drawSprite } from '../../services/SpriteRenderer';
import { EnergyBar } from '../EnergyBar';
import { HappinessBar } from '../HappinessBar';
import './Pet.css';

const WINDOW_SIZE = 100;

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
    streamingText,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceInput();

  // Drag behavior (extracted hook)
  const { isDragging, handleMouseDown } = usePetDrag({
    behaviorRef,
    triggerInteraction,
    forceWakeUp,
  });

  // Keyboard shortcuts (extracted hook)
  useKeyboardShortcuts({
    behaviorRef,
    isSleeping,
    triggerInteraction,
    micEnabled: settings.microphone.enabled,
    isListening,
    isProcessing,
    startListening,
  });

  // Initialize
  useEffect(() => {
    async function init() {
      try {
        const [width, height] = await invoke<[number, number]>('get_screen_size');
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
      // Sync mood state immediately after creation
      behaviorRef.current?.setMoodSleeping(isSleeping);
      behaviorRef.current?.setHappiness(happiness);
      behaviorRef.current?.setEnergy(energy);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
              // Get color tint from settings (use custom color if preset is 'custom')
              const colorPreset = (settings?.pet_color_preset ?? 'original') as PetColorPreset;
              const tintColor = colorPreset === 'custom'
                ? settings?.pet_custom_color
                : PET_COLOR_PRESETS[colorPreset];

              drawSprite(ctx, sprite, currentAnimation, currentDirection, currentSquish, newFrame, WINDOW_SIZE, tintColor);

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
  }, [isDragging, sprite, spriteLoading, settings?.pet_color_preset, settings?.pet_custom_color]);

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

  // Set up hurt callback (when pet runs into screen edge)
  useEffect(() => {
    behaviorRef.current?.setOnHurtCallback(() => {
      triggerInteraction('hurt');
    });
  }, [triggerInteraction]);

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

  // Bubble state for in-window display
  const [bubbleText, setBubbleText] = useState('');
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleProcessing, setBubbleProcessing] = useState(false);
  const [bubbleSpeaker, setBubbleSpeaker] = useState<'user' | 'pet'>('pet');
  const bubbleContentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll bubble content to the right (typewriter effect)
  useEffect(() => {
    if (bubbleContentRef.current && bubbleProcessing) {
      bubbleContentRef.current.scrollLeft = bubbleContentRef.current.scrollWidth;
    }
  }, [bubbleText, bubbleProcessing]);

  useEffect(() => {
    // Determine what to show
    let text = '';
    let processing = false;
    let shouldShow = false;
    let speaker: 'user' | 'pet' = 'pet';

    if (response?.text) {
      // Final response - show complete text
      text = response.text;
      processing = false;
      shouldShow = true;
      speaker = 'pet';
    } else if (streamingText) {
      // Streaming response - show real-time with typewriter effect
      text = streamingText;
      processing = true;
      shouldShow = true;
      speaker = 'pet';
    } else if (isProcessing && transcript) {
      // Processing but no response yet - show transcript
      text = transcript;
      processing = true;
      shouldShow = true;
      speaker = 'user';
    } else if (isListening && transcript) {
      // Show realtime transcript while listening
      text = transcript;
      processing = true;
      shouldShow = true;
      speaker = 'user';
    } else if (isListening) {
      text = '...';
      processing = true;
      shouldShow = true;
      speaker = 'user';
    }

    setBubbleText(text);
    setBubbleVisible(shouldShow);
    setBubbleProcessing(processing);
    setBubbleSpeaker(speaker);
  }, [response, isProcessing, transcript, isListening, streamingText]);

  return (
    <div className="pet-container" onClick={handleClick}>
      {/* Pet canvas - at bottom */}
      <div className="pet-wrapper">
        <canvas
          ref={canvasRef}
          width={WINDOW_SIZE}
          height={WINDOW_SIZE}
          onMouseDown={handleMouseDown}
          className={`pet-canvas ${settings?.pet_bloom_enabled && settings.pet_color_preset !== 'custom' ? `bloom-${settings.pet_color_preset}` : ''}`}
          style={settings?.pet_bloom_enabled && settings.pet_color_preset === 'custom' ? {
            filter: `drop-shadow(0 0 6px ${settings.pet_custom_color}99) drop-shadow(0 0 12px ${settings.pet_custom_color}80)`,
            animation: 'bloom-pulse 2s ease-in-out infinite',
          } : undefined}
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

      {/* Speech bubble - positioned absolute, outside pet-wrapper */}
      {bubbleVisible && (
        <div className={`speech-bubble ${bubbleSpeaker === 'user' ? 'speech-bubble--user' : 'speech-bubble--pet'}`}>
          <div className="speech-bubble-inner">
            <div
              ref={bubbleContentRef}
              className={`speech-bubble-content ${bubbleProcessing ? 'typewriter' : ''}`}
            >
              {bubbleProcessing ? (
                <span className="typewriter-text">{bubbleText || '...'}</span>
              ) : (
                bubbleText
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
