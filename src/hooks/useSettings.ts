import { useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { settingsService } from '../services/SettingsService';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

interface UseSettingsReturn {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  saveSettings: (settings: AppSettings) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

/**
 * React hook for managing application settings
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount and listen for changes from other windows
  useEffect(() => {
    // Force reload from file on mount to ensure fresh data
    // This is important when Settings window opens - it needs latest from disk
    loadSettings(true);

    // Listen for settings-changed event from other windows (e.g., Settings window)
    const unlisten = listen<AppSettings>('settings-changed', (event) => {
      console.log('Settings changed from another window:', event.payload);
      settingsService.clearCache();
      setSettings(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const loadSettings = async (forceReload = false) => {
    setLoading(true);
    setError(null);
    try {
      // Always force reload to get fresh data from file
      // This ensures Settings window shows correct values when opened
      const loaded = await settingsService.loadSettings(forceReload);
      setSettings(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    setError(null);
    try {
      await settingsService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setError(null);
    try {
      const updated = await settingsService.updateSettings(updates);
      setSettings(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update settings';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const reloadSettings = useCallback(async () => {
    settingsService.clearCache();
    await loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateSettings,
    reloadSettings,
  };
}
