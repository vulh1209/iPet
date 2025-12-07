import { useEffect } from 'react';
import { PetBehavior } from '../services/PetBehavior';

interface KeyboardShortcutsConfig {
  behaviorRef: React.RefObject<PetBehavior | null>;
  isSleeping: boolean;
  triggerInteraction: (id: string) => boolean;
  // Voice input
  micEnabled: boolean;
  isListening: boolean;
  isProcessing: boolean;
  startListening: () => void;
}

/**
 * Hook to handle keyboard shortcuts for pet interactions
 * Centralizes all keyboard event handling logic
 */
export function useKeyboardShortcuts({
  behaviorRef,
  isSleeping,
  triggerInteraction,
  micEnabled,
  isListening,
  isProcessing,
  startListening,
}: KeyboardShortcutsConfig): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if any modifier key is pressed (allow system shortcuts like Cmd+C)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      // Press "V" to start voice input
      if (key === 'v') {
        if (micEnabled && !isListening && !isProcessing && !isSleeping) {
          e.preventDefault();
          startListening();
          behaviorRef.current?.onListeningStart();
        }
      }

      // Press "T" to give treat
      if (key === 't' && !isSleeping) {
        e.preventDefault();
        if (triggerInteraction('treat')) {
          behaviorRef.current?.onEat();
        } else {
          behaviorRef.current?.onReject();
        }
      }

      // Press "D" for dance party
      if (key === 'd' && !isSleeping) {
        e.preventDefault();
        if (triggerInteraction('danceParty')) {
          behaviorRef.current?.onDance();
        } else {
          behaviorRef.current?.onReject();
        }
      }

      // Press "L" for lullaby (puts pet to sleep)
      if (key === 'l' && !isSleeping) {
        e.preventDefault();
        if (!triggerInteraction('lullaby')) {
          behaviorRef.current?.onReject();
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
  }, [behaviorRef, micEnabled, isListening, isProcessing, isSleeping, startListening, triggerInteraction]);
}
