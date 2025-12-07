import type { PetMoodState, MoodLevel, EnergyLevel } from './types';
import { MOOD_CONSTANTS, SLEEP_CONSTANTS } from './constants';

// Helper to get random value in range
export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Default mood state
export function createDefaultMoodState(): PetMoodState {
  const now = Date.now();
  return {
    version: 1,
    stats: {
      happiness: 70,
      energy: 80,
    },
    timestamps: {
      lastInteraction: now,
      lastSleepEnd: now,
      appLastClosed: now,
    },
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      scheduledWakeTime: null,
      nextSleepTime: Math.floor(now + randomInRange(
        SLEEP_CONSTANTS.AWAKE_DURATION_MIN,
        SLEEP_CONSTANTS.AWAKE_DURATION_MAX
      )),
    },
    interactionCounts: {
      todayDate: new Date().toISOString().split('T')[0],
      treats: 0,
      morningGreeting: false,
    },
  };
}

// Get mood level from happiness value
export function getMoodLevel(happiness: number): MoodLevel {
  if (happiness < MOOD_CONSTANTS.MOOD_THRESHOLDS.depressed) return 'depressed';
  if (happiness < MOOD_CONSTANTS.MOOD_THRESHOLDS.sad) return 'sad';
  if (happiness < MOOD_CONSTANTS.MOOD_THRESHOLDS.neutral) return 'neutral';
  if (happiness < MOOD_CONSTANTS.MOOD_THRESHOLDS.happy) return 'happy';
  return 'ecstatic';
}

// Get energy level from energy value
export function getEnergyLevel(energy: number): EnergyLevel {
  if (energy < MOOD_CONSTANTS.ENERGY_THRESHOLDS.exhausted) return 'exhausted';
  if (energy < MOOD_CONSTANTS.ENERGY_THRESHOLDS.tired) return 'tired';
  if (energy < MOOD_CONSTANTS.ENERGY_THRESHOLDS.normal) return 'normal';
  if (energy < MOOD_CONSTANTS.ENERGY_THRESHOLDS.energetic) return 'energetic';
  return 'hyperactive';
}
