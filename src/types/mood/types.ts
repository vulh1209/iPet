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
