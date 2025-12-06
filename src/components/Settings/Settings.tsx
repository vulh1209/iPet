import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettings } from '../../hooks/useSettings';
import {
  AppSettings,
  PersonalityPreset,
  PERSONALITY_NAMES,
  PERSONALITY_PRESETS,
} from '../../types/settings';
import './Settings.css';

// Emoji mapping for personality presets
const PERSONALITY_EMOJI: Record<string, string> = {
  bubbles: '🎉',
  sage: '🦉',
  drowsy: '😴',
  custom: '✨',
};

// Section icon paths
const SECTION_ICONS = {
  apiKey: '/icons/settings/api-key.png',
  personality: '/icons/settings/mood.png',
  microphone: '/icons/settings/microphone.png',
  storage: '/icons/settings/storage.png',
  theme: '/icons/settings/theme.png',
};

// App info
const APP_INFO = {
  name: 'iPet',
  version: '1.0.0',
  author: 'Vu Le',
  github: 'https://github.com/vulh1209/iPet',
  description: 'Your adorable AI desktop companion',
};

export function Settings() {
  const { settings, loading, error, saveSettings } = useSettings();
  const [formData, setFormData] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form data when settings load
  useEffect(() => {
    if (settings && !formData) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const handleChange = (field: keyof AppSettings, value: unknown) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    setSaveSuccess(false);
  };

  const handlePersonalityChange = (preset: PersonalityPreset) => {
    if (!formData) return;
    setFormData({
      ...formData,
      personality: {
        ...formData.personality,
        preset,
        custom_traits: preset === 'custom' ? formData.personality.custom_traits : undefined,
      },
    });
    setSaveSuccess(false);
  };

  const handleMicrophoneChange = (field: keyof AppSettings['microphone'], value: unknown) => {
    if (!formData) return;
    setFormData({
      ...formData,
      microphone: { ...formData.microphone, [field]: value },
    });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await saveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    invoke('close_settings_window');
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  if (error) {
    return (
      <div className="settings-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!formData) {
    return <div className="loading">Initializing...</div>;
  }

  const presetKeys = Object.keys(PERSONALITY_PRESETS) as Exclude<PersonalityPreset, 'custom'>[];

  return (
    <div className="settings-container">
      {/* Header with bouncing mascot */}
      <div className="settings-header">
        <div className="settings-header-icon">🐾</div>
        <h1>iPet Settings</h1>
        <p>Customize your desktop companion</p>
      </div>

      {saveSuccess && (
        <div className="success-message">Settings saved successfully!</div>
      )}

      {/* API Key Section */}
      <div className="settings-section">
        <h2><img src={SECTION_ICONS.apiKey} alt="" className="section-icon" />Gemini API</h2>
        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            id="apiKey"
            type="password"
            value={formData.gemini_api_key}
            onChange={(e) => handleChange('gemini_api_key', e.target.value)}
            placeholder="Enter your Gemini API key"
          />
          <p className="hint">
            Get your API key from{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
          </p>
        </div>
      </div>

      {/* Personality Section */}
      <div className="settings-section">
        <h2><img src={SECTION_ICONS.personality} alt="" className="section-icon" />Personality</h2>
        <div className="personality-options">
          {presetKeys.map((preset) => (
            <div
              key={preset}
              className={`personality-option ${formData.personality.preset === preset ? 'selected' : ''}`}
              onClick={() => handlePersonalityChange(preset)}
            >
              <span className="emoji">{PERSONALITY_EMOJI[preset]}</span>
              <div className="name">{PERSONALITY_NAMES[preset]}</div>
              <div className="description">{PERSONALITY_PRESETS[preset]}</div>
            </div>
          ))}
          <div
            className={`personality-option ${formData.personality.preset === 'custom' ? 'selected' : ''}`}
            onClick={() => handlePersonalityChange('custom')}
          >
            <span className="emoji">{PERSONALITY_EMOJI.custom}</span>
            <div className="name">Custom</div>
            <div className="description">Define your own personality</div>
          </div>
        </div>

        {formData.personality.preset === 'custom' && (
          <div className="form-group">
            <label htmlFor="customTraits">Custom Personality Traits</label>
            <textarea
              id="customTraits"
              value={formData.personality.custom_traits || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personality: { ...formData.personality, custom_traits: e.target.value },
                })
              }
              placeholder="e.g., Friendly, curious, loves jokes"
            />
          </div>
        )}
      </div>

      {/* Microphone Section */}
      <div className="settings-section">
        <h2><img src={SECTION_ICONS.microphone} alt="" className="section-icon" />Voice Input</h2>
        <div className="form-group form-group-inline">
          <label>Enable Microphone</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.microphone.enabled}
              onChange={(e) => handleMicrophoneChange('enabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="silenceTimeout">Silence Timeout</label>
          <select
            id="silenceTimeout"
            value={formData.microphone.silence_timeout}
            onChange={(e) => handleMicrophoneChange('silence_timeout', parseInt(e.target.value))}
          >
            <option value={1000}>1 second</option>
            <option value={1500}>1.5 seconds</option>
            <option value={2000}>2 seconds</option>
            <option value={2500}>2.5 seconds</option>
            <option value={3000}>3 seconds</option>
          </select>
          <p className="hint">Stop listening after this much silence</p>
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={formData.microphone.language}
            onChange={(e) => handleMicrophoneChange('language', e.target.value)}
          >
            <option value="vi-VN">🇻🇳 Vietnamese</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="ja-JP">🇯🇵 Japanese</option>
            <option value="ko-KR">🇰🇷 Korean</option>
            <option value="zh-CN">🇨🇳 Chinese</option>
          </select>
        </div>
      </div>

      {/* Storage Section */}
      <div className="settings-section">
        <h2><img src={SECTION_ICONS.storage} alt="" className="section-icon" />Storage</h2>
        <div className="form-group">
          <label htmlFor="retentionDays">Conversation History</label>
          <select
            id="retentionDays"
            value={formData.conversation_retention_days}
            onChange={(e) => handleChange('conversation_retention_days', parseInt(e.target.value))}
          >
            <option value={7}>Keep for 7 days</option>
            <option value={14}>Keep for 14 days</option>
            <option value={30}>Keep for 30 days</option>
            <option value={60}>Keep for 60 days</option>
            <option value={90}>Keep for 90 days</option>
          </select>
          <p className="hint">Older conversations will be automatically removed</p>
        </div>
      </div>

      {/* About Section */}
      <div className="settings-section about-section">
        <h2><span className="section-emoji">💝</span>About</h2>
        <div className="about-content">
          <div className="about-app">
            <div className="about-logo">🐾</div>
            <div className="about-details">
              <div className="about-name">{APP_INFO.name}</div>
              <div className="about-version">Version {APP_INFO.version}</div>
            </div>
          </div>
          <p className="about-description">{APP_INFO.description}</p>
          <div className="about-author">
            <span className="author-label">Created with 💖 by</span>
            <a
              href={APP_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="author-link"
            >
              {APP_INFO.author}
            </a>
          </div>
        </div>
      </div>

      {saveError && <div className="error-message">{saveError}</div>}

      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
