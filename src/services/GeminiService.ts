import { invoke } from '@tauri-apps/api/core';
import { settingsService } from './SettingsService';
import { getPersonalityTraits } from '../types/settings';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

// Use Gemini 2.0 Flash - fast and capable model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

/**
 * Service for interacting with Google Gemini API
 * Singleton pattern - use geminiService export
 */
export class GeminiService {
  private static instance: GeminiService;
  private conversationHistory: ChatMessage[] = [];
  private initialized = false;

  private constructor() {}

  /**
   * Initialize service by loading persisted chat history
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const history = await invoke<ChatMessage[]>('load_chat_history');
      this.conversationHistory = history;
      this.initialized = true;
      console.log(`Loaded ${history.length} chat messages from disk`);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      this.conversationHistory = [];
      this.initialized = true;
    }
  }

  /**
   * Save chat history to disk
   */
  private async saveHistory(): Promise<void> {
    try {
      await invoke('save_chat_history', { history: this.conversationHistory });
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Send a message to Gemini and get a response
   * Uses personality from settings for context
   */
  async chat(userMessage: string): Promise<GeminiResponse> {
    // Ensure history is loaded before chatting
    await this.initialize();

    const settings = await settingsService.loadSettings();
    const apiKey = settings.gemini_api_key;

    if (!apiKey) {
      return { text: '', error: 'API key not configured' };
    }

    const personality = getPersonalityTraits(settings.personality);
    const systemPrompt = this.buildSystemPrompt(personality);

    try {
      const response = await this.callGeminiAPI(apiKey, systemPrompt, userMessage);

      if (response.text) {
        // Update conversation history
        this.conversationHistory.push({ role: 'user', content: userMessage });
        this.conversationHistory.push({ role: 'model', content: response.text });

        // Keep history manageable (last 10 exchanges)
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }

        // Persist to disk
        await this.saveHistory();
      }

      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory(): Promise<void> {
    this.conversationHistory = [];
    await this.saveHistory();
  }

  /**
   * Get current conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Build system prompt with personality traits
   */
  private buildSystemPrompt(personality: string): string {
    return `You are a kawaii virtual pet named iPet. Personality: ${personality}.

STRICT RULES:
- Reply with MAX 3 WORDS only (excluding emojis)
- ALWAYS use 1-2 cute emojis 💕✨🌟💖🎀🌸😊🥰💫🐾
- Match user's language
- Be expressive through emojis, not words
- Examples: "Yay! 💕✨" "Love you! 🥰" "Hihi~ 🌸" "Okiee 💫" "Đói quá! 🍜💕"`;
  }

  /**
   * Make API call to Gemini
   */
  private async callGeminiAPI(
    apiKey: string,
    systemPrompt: string,
    message: string
  ): Promise<GeminiResponse> {
    // Build contents array with history
    const contents = this.buildContents(systemPrompt, message);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 30,
          topP: 0.9,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API request failed: ${response.status}`
      );
    }

    const data = await response.json();

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text && data.candidates?.[0]?.finishReason === 'SAFETY') {
      return { text: '', error: 'Response blocked by safety filters' };
    }

    return { text };
  }

  /**
   * Build contents array for API request
   * Includes system prompt, history, and current message
   */
  private buildContents(
    systemPrompt: string,
    currentMessage: string
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // First message includes system prompt
    if (this.conversationHistory.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser: ${currentMessage}` }],
      });
    } else {
      // Add system prompt as first user message
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood! I will respond as your cute pet companion.' }],
      });

      // Add conversation history
      for (const msg of this.conversationHistory) {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.content }],
        });
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: currentMessage }],
      });
    }

    return contents;
  }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance();
