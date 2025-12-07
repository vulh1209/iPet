import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PetBehavior } from '../services/PetBehavior';

interface UsePetDragConfig {
  behaviorRef: React.RefObject<PetBehavior | null>;
  triggerInteraction: (id: string) => boolean;
  forceWakeUp: () => boolean;
}

interface UsePetDragReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Hook to handle pet drag and drop behavior
 * Manages drag state, mouse events, and window positioning
 */
export function usePetDrag({
  behaviorRef,
  triggerInteraction,
  forceWakeUp,
}: UsePetDragConfig): UsePetDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragOffsetRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    const behavior = behaviorRef.current;

    // Wake up pet if sleeping when dragged
    const isGrumpy = forceWakeUp();

    if (isGrumpy) {
      // Low energy wake - show grumpy animation immediately (clears queue)
      // Pet will go back to sleep after 10s via mood system
      behavior?.onGrumpyWake();
      // Don't set isDragging - pet refuses to be dragged when grumpy
      return;
    }
    setIsDragging(true);
    behavior?.onDragStart();
  }, [behaviorRef, forceWakeUp]);

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
  }, [behaviorRef, isDragging, triggerInteraction]);

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

  return {
    isDragging,
    handleMouseDown,
  };
}
