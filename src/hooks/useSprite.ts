import { useState, useEffect, useRef } from 'react';
import { LoadedSprite } from '../types/sprite';
import { loadSprite } from '../services/SpriteLoader';

interface UseSpriteResult {
  sprite: LoadedSprite | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to load and manage a sprite
 * @param skinId - The ID of the skin/sprite to load (e.g., "slime")
 */
export function useSprite(skinId: string): UseSpriteResult {
  const [sprite, setSprite] = useState<LoadedSprite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate loads
    if (loadingRef.current) return;
    loadingRef.current = true;

    setIsLoading(true);
    setError(null);

    loadSprite(skinId)
      .then((loadedSprite) => {
        setSprite(loadedSprite);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load sprite "${skinId}":`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      })
      .finally(() => {
        loadingRef.current = false;
      });

    // Cleanup on unmount or skinId change
    return () => {
      loadingRef.current = false;
    };
  }, [skinId]);

  return { sprite, isLoading, error };
}
