// Mood Stats
export interface MoodStats {
  happiness: number;  // 0-100
  energy: number;     // 0-100
}

// Timestamps for decay calculation
export interface MoodTimestamps {
  lastInteraction: number;    // Unix timestamp (ms)
  lastSleepEnd: number;       // When pet last woke up
  appLastClosed: number;      // For offline decay calculation
}

// Sleep state
export interface SleepState {
  isSleeping: boolean;
  sleepStartTime: number | null;
  scheduledWakeTime: number | null;
  nextSleepTime: number;      // When pet should next fall asleep
}

// Daily interaction tracking
export interface InteractionCounts {
  todayDate: string;          // YYYY-MM-DD format
  treats: number;
  morningGreeting: boolean;
}

// Complete mood state for persistence
export interface PetMoodState {
  version: number;
  stats: MoodStats;
  timestamps: MoodTimestamps;
  sleep: SleepState;
  interactionCounts: InteractionCounts;
}

// Mood level thresholds for animation selection
export type MoodLevel = 'depressed' | 'sad' | 'neutral' | 'happy' | 'ecstatic';
export type EnergyLevel = 'exhausted' | 'tired' | 'normal' | 'energetic' | 'hyperactive';

// Interaction definition
export interface Interaction {
  id: string;
  name: string;
  happinessChange: number;
  energyChange: number;
  cooldownMs: number;
  dailyLimit?: number;
  triggersSleep?: boolean;
  energyRequired?: number;
}

// Constants
export const MOOD_CONSTANTS = {
  // Decay settings
  DECAY_CHECK_INTERVAL: 60 * 1000,        // Check every 60 seconds
  DECAY_START_DELAY_MIN: 10 * 60 * 1000,  // 10 minutes minimum
  DECAY_START_DELAY_MAX: 60 * 60 * 1000,  // 1 hour maximum

  // Decay rates (per minute after delay expires)
  HAPPINESS_DECAY_RATE: 0.5,
  ENERGY_DECAY_RATE: 0.3,

  // Offline decay
  OFFLINE_DECAY_MULTIPLIER: 0.5,
  MAX_OFFLINE_DECAY_HOURS: 24,

  // Stat bounds
  MIN_STAT: 0,
  MAX_STAT: 100,

  // Mood level thresholds
  MOOD_THRESHOLDS: {
    depressed: 20,
    sad: 40,
    neutral: 60,
    happy: 80,
  },

  // Energy level thresholds
  ENERGY_THRESHOLDS: {
    exhausted: 15,
    tired: 35,
    normal: 60,
    energetic: 85,
  },
};

export const SLEEP_CONSTANTS = {
  // Time between sleep cycles
  AWAKE_DURATION_MIN: 1 * 60 * 60 * 1000,   // 1 hour
  AWAKE_DURATION_MAX: 3 * 60 * 60 * 1000,   // 3 hours

  // Sleep duration
  SLEEP_DURATION_MIN: 10 * 60 * 1000,       // 10 minutes
  SLEEP_DURATION_MAX: 30 * 60 * 1000,       // 30 minutes

  // Energy restoration during sleep
  ENERGY_RESTORE_PER_MINUTE: 2,
  HAPPINESS_BOOST_ON_WAKE: 5,

  // Low energy triggers forced sleep
  FORCED_SLEEP_ENERGY_THRESHOLD: 10,
};

// All 10 interactions
export const INTERACTIONS: Record<string, Interaction> = {
  pet: {
    id: 'pet',
    name: 'Petting',
    happinessChange: 7,
    energyChange: 2,
    cooldownMs: 2000,
  },
  voiceChat: {
    id: 'voiceChat',
    name: 'Voice Chat',
    happinessChange: 15,
    energyChange: -5,
    cooldownMs: 5000,
  },
  treat: {
    id: 'treat',
    name: 'Give Treat',
    happinessChange: 8,
    energyChange: 10,
    cooldownMs: 0,
    dailyLimit: 5,
  },
  playCatch: {
    id: 'playCatch',
    name: 'Play Catch',
    happinessChange: 12,
    energyChange: -10,
    cooldownMs: 30000,
    energyRequired: 20,
  },
  shake: {
    id: 'shake',
    name: 'Gentle Shake',
    happinessChange: 3,
    energyChange: 5,
    cooldownMs: 5000,
  },
  lullaby: {
    id: 'lullaby',
    name: 'Sing Lullaby',
    happinessChange: 5,
    energyChange: 0,
    cooldownMs: 60000,
    triggersSleep: true,
  },
  morningGreeting: {
    id: 'morningGreeting',
    name: 'Morning Greeting',
    happinessChange: 20,
    energyChange: 10,
    cooldownMs: 0,
    dailyLimit: 1,
  },
  compliment: {
    id: 'compliment',
    name: 'Compliment',
    happinessChange: 10,
    energyChange: 0,
    cooldownMs: 10000,
  },
  danceParty: {
    id: 'danceParty',
    name: 'Dance Party',
    happinessChange: 15,
    energyChange: -15,
    cooldownMs: 60000,
    energyRequired: 30,
  },
  quietTime: {
    id: 'quietTime',
    name: 'Quiet Time',
    happinessChange: 3,
    energyChange: 5,
    cooldownMs: 5 * 60 * 1000, // 5 minutes
  },
};

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
      nextSleepTime: now + randomInRange(
        SLEEP_CONSTANTS.AWAKE_DURATION_MIN,
        SLEEP_CONSTANTS.AWAKE_DURATION_MAX
      ),
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
