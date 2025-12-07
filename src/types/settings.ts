// Personality presets
export type PersonalityPreset = 'bubbles' | 'sage' | 'drowsy' | 'custom';

export const PERSONALITY_PRESETS: Record<Exclude<PersonalityPreset, 'custom'>, string> = {
  bubbles: 'Cheerful, energetic, loves emojis, active',
  sage: 'Calm, wise, likes sharing knowledge',
  drowsy: 'Sleepy, cute, slow-paced',
};

export const PERSONALITY_NAMES: Record<Exclude<PersonalityPreset, 'custom'>, string> = {
  bubbles: 'Bubbles (Vui vẻ)',
  sage: 'Sage (Thông thái)',
  drowsy: 'Drowsy (Buồn ngủ)',
};

// Settings interfaces (must match Rust types)
export interface PersonalityConfig {
  preset: PersonalityPreset;
  custom_traits?: string;
}

export interface MicrophoneConfig {
  enabled: boolean;
  silence_timeout: number; // milliseconds
  language: string;
}

export interface AppSettings {
  gemini_api_key: string;
  personality: PersonalityConfig;
  microphone: MicrophoneConfig;
  conversation_retention_days: number;
  show_energy_bar: boolean;
  show_happiness_bar: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  gemini_api_key: '',
  personality: {
    preset: 'bubbles',
    custom_traits: undefined,
  },
  microphone: {
    enabled: true,
    silence_timeout: 2000,
    language: 'vi-VN',
  },
  conversation_retention_days: 30,
  show_energy_bar: true,
  show_happiness_bar: true,
};

// Get personality traits string based on config
export function getPersonalityTraits(config: PersonalityConfig): string {
  if (config.preset === 'custom' && config.custom_traits) {
    return config.custom_traits;
  }
  return PERSONALITY_PRESETS[config.preset as Exclude<PersonalityPreset, 'custom'>] || PERSONALITY_PRESETS.bubbles;
}
