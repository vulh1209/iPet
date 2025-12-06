import { invoke } from '@tauri-apps/api/core';
import {
  PetMoodState,
  MoodStats,
  MOOD_CONSTANTS,
  SLEEP_CONSTANTS,
  INTERACTIONS,
  Interaction,
  createDefaultMoodState,
  randomInRange,
} from '../types/mood';

type MoodListener = (mood: PetMoodState) => void;

export class MoodService {
  private static instance: MoodService;
  private moodState: PetMoodState = createDefaultMoodState();
  private decayInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<MoodListener> = new Set();
  private interactionCooldowns: Map<string, number> = new Map();
  private decayDelay: number;
  private initialized = false;
  private quietTimeStart: number | null = null;

  private constructor() {
    // Random decay delay for this session (10 min - 1 hour)
    this.decayDelay = randomInRange(
      MOOD_CONSTANTS.DECAY_START_DELAY_MIN,
      MOOD_CONSTANTS.DECAY_START_DELAY_MAX
    );
  }

  static getInstance(): MoodService {
    if (!MoodService.instance) {
      MoodService.instance = new MoodService();
    }
    return MoodService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load persisted mood
    const loaded = await this.loadMood();
    if (loaded) {
      this.moodState = loaded;
      // Apply offline decay
      this.applyOfflineDecay();
    }

    // Check for new day (reset daily counters)
    this.checkNewDay();

    // Process any pending sleep wake-up
    this.processSleepState();

    // Reset session-specific state
    this.interactionCooldowns.clear();
    this.quietTimeStart = Date.now();

    // Start decay timer
    this.startDecayTimer();

    this.initialized = true;
    this.notifyListeners();

    // Save initial state
    await this.saveMood();
  }

  private async loadMood(): Promise<PetMoodState | null> {
    try {
      const result = await invoke<PetMoodState | null>('load_mood');
      return result;
    } catch (error) {
      console.error('Failed to load mood:', error);
      return null;
    }
  }

  async saveMood(): Promise<void> {
    // Update appLastClosed before saving
    this.moodState.timestamps.appLastClosed = Date.now();
    try {
      await invoke('save_mood', { mood: this.moodState });
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  }

  private applyOfflineDecay(): void {
    const now = Date.now();
    const offlineTime = now - this.moodState.timestamps.appLastClosed;

    // Cap offline time
    const cappedOfflineTime = Math.min(
      offlineTime,
      MOOD_CONSTANTS.MAX_OFFLINE_DECAY_HOURS * 60 * 60 * 1000
    );

    // Only apply decay if significant time passed
    if (cappedOfflineTime < 60 * 1000) return; // Less than 1 minute

    const offlineMinutes = cappedOfflineTime / (60 * 1000);
    const decayRate = MOOD_CONSTANTS.OFFLINE_DECAY_MULTIPLIER;

    // Apply reduced decay
    this.moodState.stats.happiness = Math.max(
      MOOD_CONSTANTS.MIN_STAT,
      this.moodState.stats.happiness -
        offlineMinutes * MOOD_CONSTANTS.HAPPINESS_DECAY_RATE * decayRate
    );
    this.moodState.stats.energy = Math.max(
      MOOD_CONSTANTS.MIN_STAT,
      this.moodState.stats.energy -
        offlineMinutes * MOOD_CONSTANTS.ENERGY_DECAY_RATE * decayRate
    );

    // Update timestamps
    this.moodState.timestamps.lastInteraction = now;
  }

  private checkNewDay(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.moodState.interactionCounts.todayDate !== today) {
      // Reset daily counters
      this.moodState.interactionCounts = {
        todayDate: today,
        treats: 0,
        morningGreeting: false,
      };
    }
  }

  private processSleepState(): void {
    const now = Date.now();
    const { sleep, stats } = this.moodState;

    if (sleep.isSleeping && sleep.scheduledWakeTime) {
      if (now >= sleep.scheduledWakeTime) {
        // Pet should wake up
        const sleepDuration = sleep.scheduledWakeTime - (sleep.sleepStartTime || now);
        const sleepMinutes = sleepDuration / (60 * 1000);

        // Restore energy
        stats.energy = Math.min(
          MOOD_CONSTANTS.MAX_STAT,
          stats.energy + sleepMinutes * SLEEP_CONSTANTS.ENERGY_RESTORE_PER_MINUTE
        );

        // Happiness boost on wake
        stats.happiness = Math.min(
          MOOD_CONSTANTS.MAX_STAT,
          stats.happiness + SLEEP_CONSTANTS.HAPPINESS_BOOST_ON_WAKE
        );

        // Wake up
        this.wakeUp();
      }
    }
  }

  private startDecayTimer(): void {
    if (this.decayInterval) return;

    this.decayInterval = setInterval(() => {
      this.processDecay();
      this.processSleepCycle();
      this.processQuietTime();
    }, MOOD_CONSTANTS.DECAY_CHECK_INTERVAL);
  }

  private processDecay(): void {
    // Don't decay while sleeping
    if (this.moodState.sleep.isSleeping) return;

    const now = Date.now();
    const timeSinceInteraction = now - this.moodState.timestamps.lastInteraction;

    // Only decay after the random delay
    if (timeSinceInteraction < this.decayDelay) return;

    // Only apply decay for the last check interval
    const intervalMinutes = MOOD_CONSTANTS.DECAY_CHECK_INTERVAL / (60 * 1000);

    this.moodState.stats.happiness = Math.max(
      MOOD_CONSTANTS.MIN_STAT,
      this.moodState.stats.happiness - intervalMinutes * MOOD_CONSTANTS.HAPPINESS_DECAY_RATE
    );
    this.moodState.stats.energy = Math.max(
      MOOD_CONSTANTS.MIN_STAT,
      this.moodState.stats.energy - intervalMinutes * MOOD_CONSTANTS.ENERGY_DECAY_RATE
    );

    this.notifyListeners();
    this.saveMood();
  }

  private processSleepCycle(): void {
    const now = Date.now();
    const { sleep, stats } = this.moodState;

    if (sleep.isSleeping) {
      // Check if it's time to wake up
      if (sleep.scheduledWakeTime && now >= sleep.scheduledWakeTime) {
        const sleepDuration = now - (sleep.sleepStartTime || now);
        const sleepMinutes = sleepDuration / (60 * 1000);

        // Restore energy
        stats.energy = Math.min(
          MOOD_CONSTANTS.MAX_STAT,
          stats.energy + sleepMinutes * SLEEP_CONSTANTS.ENERGY_RESTORE_PER_MINUTE
        );

        // Happiness boost on wake
        stats.happiness = Math.min(
          MOOD_CONSTANTS.MAX_STAT,
          stats.happiness + SLEEP_CONSTANTS.HAPPINESS_BOOST_ON_WAKE
        );

        this.wakeUp();
      }
    } else {
      // Check if it's time to sleep
      const shouldSleep =
        now >= sleep.nextSleepTime ||
        stats.energy < SLEEP_CONSTANTS.FORCED_SLEEP_ENERGY_THRESHOLD;

      if (shouldSleep) {
        this.startSleep();
      }
    }
  }

  private processQuietTime(): void {
    // Check if pet has been idle for 5+ minutes (quiet time bonus)
    if (!this.quietTimeStart || this.moodState.sleep.isSleeping) return;

    const now = Date.now();
    const quietDuration = now - this.quietTimeStart;
    const quietTimeThreshold = INTERACTIONS.quietTime.cooldownMs;

    if (quietDuration >= quietTimeThreshold) {
      // Apply quiet time bonus
      this.applyInteractionEffects(INTERACTIONS.quietTime);
      this.quietTimeStart = now; // Reset for next quiet time bonus
    }
  }

  private startSleep(): void {
    const now = Date.now();
    const sleepDuration = randomInRange(
      SLEEP_CONSTANTS.SLEEP_DURATION_MIN,
      SLEEP_CONSTANTS.SLEEP_DURATION_MAX
    );

    this.moodState.sleep = {
      isSleeping: true,
      sleepStartTime: now,
      scheduledWakeTime: now + sleepDuration,
      nextSleepTime: 0, // Will be set on wake
    };

    this.notifyListeners();
    this.saveMood();
  }

  private wakeUp(): void {
    const now = Date.now();

    this.moodState.sleep = {
      isSleeping: false,
      sleepStartTime: null,
      scheduledWakeTime: null,
      nextSleepTime:
        now +
        randomInRange(SLEEP_CONSTANTS.AWAKE_DURATION_MIN, SLEEP_CONSTANTS.AWAKE_DURATION_MAX),
    };
    this.moodState.timestamps.lastSleepEnd = now;

    this.notifyListeners();
    this.saveMood();
  }

  // Public API
  getMoodState(): PetMoodState {
    return this.moodState;
  }

  getStats(): MoodStats {
    return this.moodState.stats;
  }

  isSleeping(): boolean {
    return this.moodState.sleep.isSleeping;
  }

  // Force wake up when pet is disturbed (e.g., dragged)
  forceWakeUp(): void {
    if (this.moodState.sleep.isSleeping) {
      this.wakeUp();
    }
  }

  triggerInteraction(interactionId: string): boolean {
    const interaction = INTERACTIONS[interactionId];
    if (!interaction) {
      console.warn(`Unknown interaction: ${interactionId}`);
      return false;
    }

    // Can't interact while sleeping (except lullaby which is prevented by UI)
    if (this.moodState.sleep.isSleeping && interactionId !== 'lullaby') {
      return false;
    }

    // Check cooldown
    const lastUsed = this.interactionCooldowns.get(interactionId) || 0;
    const now = Date.now();
    if (now - lastUsed < interaction.cooldownMs) {
      return false;
    }

    // Check daily limit
    if (interaction.dailyLimit) {
      const count = this.getInteractionCount(interactionId);
      if (count >= interaction.dailyLimit) {
        return false;
      }
    }

    // Check energy requirement
    if (interaction.energyRequired && this.moodState.stats.energy < interaction.energyRequired) {
      return false;
    }

    // Apply effects
    this.applyInteractionEffects(interaction);

    // Update tracking
    this.interactionCooldowns.set(interactionId, now);
    this.incrementInteractionCount(interactionId);
    this.moodState.timestamps.lastInteraction = now;

    // Reset quiet time on any interaction
    this.quietTimeStart = now;

    // Reset decay delay on interaction
    this.decayDelay = randomInRange(
      MOOD_CONSTANTS.DECAY_START_DELAY_MIN,
      MOOD_CONSTANTS.DECAY_START_DELAY_MAX
    );

    // Special handling for lullaby (triggers sleep)
    if (interaction.triggersSleep) {
      this.startSleep();
    }

    // Notify and save
    this.notifyListeners();
    this.saveMood();

    return true;
  }

  private applyInteractionEffects(interaction: Interaction): void {
    this.moodState.stats.happiness = Math.max(
      MOOD_CONSTANTS.MIN_STAT,
      Math.min(
        MOOD_CONSTANTS.MAX_STAT,
        this.moodState.stats.happiness + interaction.happinessChange
      )
    );
    this.moodState.stats.energy = Math.max(
      MOOD_CONSTANTS.MIN_STAT,
      Math.min(MOOD_CONSTANTS.MAX_STAT, this.moodState.stats.energy + interaction.energyChange)
    );
  }

  private getInteractionCount(interactionId: string): number {
    switch (interactionId) {
      case 'treat':
        return this.moodState.interactionCounts.treats;
      case 'morningGreeting':
        return this.moodState.interactionCounts.morningGreeting ? 1 : 0;
      default:
        return 0;
    }
  }

  private incrementInteractionCount(interactionId: string): void {
    switch (interactionId) {
      case 'treat':
        this.moodState.interactionCounts.treats++;
        break;
      case 'morningGreeting':
        this.moodState.interactionCounts.morningGreeting = true;
        break;
    }
  }

  // Check if this is the first interaction of the day
  canTriggerMorningGreeting(): boolean {
    return !this.moodState.interactionCounts.morningGreeting;
  }

  // Subscriber pattern for React integration
  subscribe(listener: MoodListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.moodState));
  }

  // Cleanup
  destroy(): void {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.saveMood();
  }
}

// Export singleton instance
export const moodService = MoodService.getInstance();
