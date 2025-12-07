import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

/**
 * Service for managing application settings via Tauri backend
 */
export class SettingsService {
  private static instance: SettingsService;
  private cachedSettings: AppSettings | null = null;

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Load settings from disk
   * Returns cached settings if available, otherwise loads from file
   */
  async loadSettings(forceReload = false): Promise<AppSettings> {
    if (this.cachedSettings && !forceReload) {
      return this.cachedSettings;
    }

    try {
      const settings = await invoke<AppSettings>('load_settings');
      this.cachedSettings = settings;
      return settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Return default settings on error
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to disk and notify other windows
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await invoke('save_settings', { settings });
      this.cachedSettings = settings;
      // Emit event to notify other windows (like Pet) that settings changed
      await emit('settings-changed', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  /**
   * Update specific settings fields
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.loadSettings();
    const updated = { ...current, ...updates };
    await this.saveSettings(updated);
    return updated;
  }

  /**
   * Clear cached settings
   */
  clearCache(): void {
    this.cachedSettings = null;
  }

  /**
   * Check if API key is configured
   */
  async hasApiKey(): Promise<boolean> {
    const settings = await this.loadSettings();
    return settings.gemini_api_key.length > 0;
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();
