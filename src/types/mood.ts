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

  // Energy level thresholds - adjusted for better distribution
  // exhausted→tired→normal→energetic→hyperactive
  ENERGY_THRESHOLDS: {
    exhausted: 10,    // Reduced from 15 → 10 (matches forced sleep at 10)
    tired: 30,        // Reduced from 35 → 30 (wider tired range)
    normal: 55,       // Reduced from 60 → 55 (easier to reach normal)
    energetic: 75,    // Reduced from 85 → 75 (more achievable)
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

// All 10 interactions - balanced for diverse gameplay
// Design philosophy:
// 1. Diversify: Users should use multiple interaction types, not spam one
// 2. Risk-Reward: Fun activities (dance, play) cost energy → need balance with rest/treat
// 3. Real-time value: Quiet time is stronger to encourage letting pet rest
// 4. Negative feedback: Drag penalty is significant to discourage excessive dragging
export const INTERACTIONS: Record<string, Interaction> = {
  pet: {
    id: 'pet',
    name: 'Petting',
    happinessChange: 5,      // Reduced from 7 → 5 to prevent spam dominance
    energyChange: 1,         // Reduced from 2 → 1
    cooldownMs: 3000,        // Increased from 2s → 3s (max 100 H/min vs 210)
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
    happinessChange: 10,     // Increased from 8 → 10 (compensates for cooldown)
    energyChange: 8,         // Reduced from 10 → 8
    cooldownMs: 10000,       // Added 10s cooldown (was 0 - allowed instant spam)
    dailyLimit: 10,          // Reduced from 20 → 10 (more precious resource)
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
    happinessChange: 5,      // Increased from 3 → 5 (was too weak vs pet)
    energyChange: 3,         // Reduced from 5 → 3
    cooldownMs: 3000,        // Reduced from 5s → 3s (now competitive with pet)
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
    happinessChange: 8,      // Increased from 3 → 8 (reward for patience)
    energyChange: 10,        // Increased from 5 → 10 (good rest alternative)
    cooldownMs: 3 * 60 * 1000, // Reduced from 5m → 3m (more accessible)
  },
  drag: {
    id: 'drag',
    name: 'Drag',
    happinessChange: -5,     // Increased penalty from -2 → -5
    energyChange: -5,        // Increased penalty from -3 → -5
    cooldownMs: 0,           // No cooldown - each drag-drop costs stats
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
