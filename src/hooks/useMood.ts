import { useState, useEffect, useCallback, useRef } from 'react';
import { moodService } from '../services/MoodService';
import {
  PetMoodState,
  MoodLevel,
  EnergyLevel,
  getMoodLevel,
  getEnergyLevel,
  createDefaultMoodState,
} from '../types/mood';

interface UseMoodReturn {
  mood: PetMoodState;
  moodLevel: MoodLevel;
  energyLevel: EnergyLevel;
  happiness: number;
  energy: number;
  isSleeping: boolean;
  triggerInteraction: (id: string) => boolean;
  forceWakeUp: () => void;
  canTriggerMorningGreeting: boolean;
}

export function useMood(): UseMoodReturn {
  const [mood, setMood] = useState<PetMoodState>(createDefaultMoodState);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize mood service on mount
    if (!initializedRef.current) {
      initializedRef.current = true;
      moodService.initialize().then(() => {
        setMood(moodService.getMoodState());
      });
    }

    // Subscribe to mood changes
    const unsubscribe = moodService.subscribe(setMood);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Save mood when window is about to close
  useEffect(() => {
    const handleBeforeUnload = () => {
      moodService.saveMood();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const triggerInteraction = useCallback((id: string): boolean => {
    return moodService.triggerInteraction(id);
  }, []);

  const forceWakeUp = useCallback((): void => {
    moodService.forceWakeUp();
  }, []);

  const moodLevel = getMoodLevel(mood.stats.happiness);
  const energyLevel = getEnergyLevel(mood.stats.energy);

  return {
    mood,
    moodLevel,
    energyLevel,
    happiness: mood.stats.happiness,
    energy: mood.stats.energy,
    isSleeping: mood.sleep.isSleeping,
    triggerInteraction,
    forceWakeUp,
    canTriggerMorningGreeting: moodService.canTriggerMorningGreeting(),
  };
}
