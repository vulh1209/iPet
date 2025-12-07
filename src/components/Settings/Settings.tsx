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

// Section types
type SectionId = 'api' | 'personality' | 'voice' | 'storage' | 'about';

// Section icons from public folder
const SECTION_ICONS: Record<SectionId, string> = {
  api: '/icons/settings/api-key.png',
  personality: '/icons/settings/mood.png',
  voice: '/icons/settings/microphone.png',
  storage: '/icons/settings/storage.png',
  about: '/icons/settings/theme.png',
};

// Emoji mapping for personality presets
const PERSONALITY_EMOJI: Record<string, string> = {
  bubbles: '🎉',
  sage: '🦉',
  drowsy: '😴',
  custom: '✨',
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
  const [expandedSection, setExpandedSection] = useState<SectionId | null>('api');

  useEffect(() => {
    if (settings && !formData) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const toggleSection = (id: SectionId) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

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
    return <div className="settings-loading">🐾 Loading...</div>;
  }

  if (error) {
    return <div className="settings-error">Error: {error}</div>;
  }

  if (!formData) {
    return <div className="settings-loading">🐾 Initializing...</div>;
  }

  const presetKeys = Object.keys(PERSONALITY_PRESETS) as Exclude<PersonalityPreset, 'custom'>[];

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1>Settings</h1>
        {saveSuccess && <span className="save-badge">✓ Saved</span>}
      </div>

      {/* Accordion Sections */}
      <div className="settings-accordion">
        {/* API Section */}
        <div className={`accordion-item ${expandedSection === 'api' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('api')}>
            <img src={SECTION_ICONS.api} alt="" className="accordion-icon" />
            <span className="accordion-title">Gemini API</span>
            <span className="accordion-arrow">›</span>
          </button>
          <div className="accordion-content">
            <div className="setting-item">
              <div className="setting-label">API Key</div>
              <input
                type="password"
                className="setting-input"
                value={formData.gemini_api_key}
                onChange={(e) => handleChange('gemini_api_key', e.target.value)}
                placeholder="Enter your API key"
              />
              <div className="setting-hint">
                Get from{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                  Google AI Studio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Personality Section */}
        <div className={`accordion-item ${expandedSection === 'personality' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('personality')}>
            <img src={SECTION_ICONS.personality} alt="" className="accordion-icon" />
            <span className="accordion-title">Personality</span>
            <span className="accordion-arrow">›</span>
          </button>
          <div className="accordion-content">
            <div className="personality-chips">
              {presetKeys.map((preset) => (
                <button
                  key={preset}
                  className={`chip ${formData.personality.preset === preset ? 'active' : ''}`}
                  onClick={() => handlePersonalityChange(preset)}
                >
                  <span>{PERSONALITY_EMOJI[preset]}</span>
                  <span>{PERSONALITY_NAMES[preset].split(' ')[0]}</span>
                </button>
              ))}
              <button
                className={`chip ${formData.personality.preset === 'custom' ? 'active' : ''}`}
                onClick={() => handlePersonalityChange('custom')}
              >
                <span>{PERSONALITY_EMOJI.custom}</span>
                <span>Custom</span>
              </button>
            </div>
            {formData.personality.preset === 'custom' && (
              <textarea
                className="setting-textarea"
                value={formData.personality.custom_traits || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personality: { ...formData.personality, custom_traits: e.target.value },
                  })
                }
                placeholder="Describe your pet's personality..."
                rows={2}
              />
            )}
            <div className="setting-row">
              <span className="row-label">Show Energy Bar</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formData.show_energy_bar}
                  onChange={(e) => handleChange('show_energy_bar', e.target.checked)}
                />
                <span className="toggle-track"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Voice Section */}
        <div className={`accordion-item ${expandedSection === 'voice' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('voice')}>
            <img src={SECTION_ICONS.voice} alt="" className="accordion-icon" />
            <span className="accordion-title">Voice Input</span>
            <span className="accordion-arrow">›</span>
          </button>
          <div className="accordion-content">
            <div className="setting-row">
              <span className="row-label">Enable Microphone</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formData.microphone.enabled}
                  onChange={(e) => handleMicrophoneChange('enabled', e.target.checked)}
                />
                <span className="toggle-track"></span>
              </label>
            </div>
            <div className="setting-row">
              <span className="row-label">Language</span>
              <select
                className="setting-select"
                value={formData.microphone.language}
                onChange={(e) => handleMicrophoneChange('language', e.target.value)}
              >
                <option value="vi-VN">🇻🇳 Vietnamese</option>
                <option value="en-US">🇺🇸 English</option>
                <option value="ja-JP">🇯🇵 Japanese</option>
                <option value="ko-KR">🇰🇷 Korean</option>
                <option value="zh-CN">🇨🇳 Chinese</option>
              </select>
            </div>
            <div className="setting-row">
              <span className="row-label">Silence Timeout</span>
              <select
                className="setting-select"
                value={formData.microphone.silence_timeout}
                onChange={(e) => handleMicrophoneChange('silence_timeout', parseInt(e.target.value))}
              >
                <option value={1000}>1s</option>
                <option value={1500}>1.5s</option>
                <option value={2000}>2s</option>
                <option value={2500}>2.5s</option>
                <option value={3000}>3s</option>
              </select>
            </div>
          </div>
        </div>

        {/* Storage Section */}
        <div className={`accordion-item ${expandedSection === 'storage' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('storage')}>
            <img src={SECTION_ICONS.storage} alt="" className="accordion-icon" />
            <span className="accordion-title">Storage</span>
            <span className="accordion-arrow">›</span>
          </button>
          <div className="accordion-content">
            <div className="setting-row">
              <span className="row-label">Keep History</span>
              <select
                className="setting-select"
                value={formData.conversation_retention_days}
                onChange={(e) => handleChange('conversation_retention_days', parseInt(e.target.value))}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className={`accordion-item ${expandedSection === 'about' ? 'expanded' : ''}`}>
          <button className="accordion-header" onClick={() => toggleSection('about')}>
            <img src={SECTION_ICONS.about} alt="" className="accordion-icon" />
            <span className="accordion-title">About</span>
            <span className="accordion-arrow">›</span>
          </button>
          <div className="accordion-content">
            <div className="about-content">
              <div className="about-icon">🐾</div>
              <div className="about-name">{APP_INFO.name}</div>
              <div className="about-version">v{APP_INFO.version}</div>
              <div className="about-desc">{APP_INFO.description}</div>
              <div className="about-author">
                Made with 💖 by{' '}
                <a href={APP_INFO.github} target="_blank" rel="noopener noreferrer">
                  {APP_INFO.author}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        {saveError && <span className="error-msg">{saveError}</span>}
        <button className="btn-cancel" onClick={handleClose}>Cancel</button>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
