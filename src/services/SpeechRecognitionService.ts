/**
 * Web Speech API wrapper for voice recognition
 * Handles browser compatibility and provides clean interface
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionConfig {
  language: string;
  silenceTimeout: number;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionCallbacks {
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart?: () => void;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: WebSpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: WebSpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onaudiostart: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onsoundend: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: WebSpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => WebSpeechRecognition;
    webkitSpeechRecognition: new () => WebSpeechRecognition;
  }
}

export class SpeechRecognitionService {
  private recognition: WebSpeechRecognition | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private isListening = false;
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private config: SpeechRecognitionConfig;

  constructor(config: SpeechRecognitionConfig) {
    this.config = config;
    this.initRecognition();
  }

  /**
   * Check if Web Speech API is supported
   */
  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Initialize speech recognition instance
   */
  private initRecognition(): void {
    if (!SpeechRecognitionService.isSupported()) {
      console.warn('Web Speech API not supported');
      return;
    }

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new SpeechRecognitionConstructor();
    this.recognition.continuous = this.config.continuous ?? false;
    this.recognition.interimResults = this.config.interimResults ?? false;
    this.recognition.lang = this.config.language;

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for recognition
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks?.onStart?.();
      this.startSilenceTimer();
    };

    this.recognition.onaudiostart = () => {};

    this.recognition.onaudioend = () => {};

    this.recognition.onsoundstart = () => {};

    this.recognition.onsoundend = () => {};

    this.recognition.onspeechstart = () => {
      this.clearSilenceTimer(); // Clear timer when speech starts
    };

    this.recognition.onspeechend = () => {
      // After speech ends, give a short window for final result, then stop
      this.clearSilenceTimer();
      this.silenceTimer = setTimeout(() => {
        if (this.isListening) {
          this.stop();
        }
      }, 1500); // 1.5s after speech ends
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.clearSilenceTimer();
      this.callbacks?.onEnd();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      this.clearSilenceTimer();

      let errorMessage: string;
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech service not allowed - check microphone permissions in System Settings';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        case 'aborted':
          errorMessage = 'Recognition aborted';
          break;
        default:
          errorMessage = event.error || 'Unknown error';
      }

      this.callbacks?.onError(errorMessage);
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.clearSilenceTimer();

      const result = event.results[event.resultIndex];
      const alternative = result[0];

      const speechResult: SpeechRecognitionResult = {
        transcript: alternative.transcript,
        confidence: alternative.confidence,
        isFinal: result.isFinal,
      };

      this.callbacks?.onResult(speechResult);

      // Restart silence timer if not final
      if (!result.isFinal) {
        this.startSilenceTimer();
      }
    };
  }

  /**
   * Start silence timeout timer
   */
  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.isListening) {
        this.stop();
      }
    }, this.config.silenceTimeout);
  }

  /**
   * Clear silence timer
   */
  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.recognition) {
      if (config.language) {
        this.recognition.lang = config.language;
      }
      if (config.continuous !== undefined) {
        this.recognition.continuous = config.continuous;
      }
      if (config.interimResults !== undefined) {
        this.recognition.interimResults = config.interimResults;
      }
    }
  }

  /**
   * Start listening for speech
   */
  start(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.recognition) {
      callbacks.onError('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    this.callbacks = callbacks;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      callbacks.onError('Failed to start recognition');
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    this.clearSilenceTimer();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop errors
      }
    }
    this.isListening = false;
  }

  /**
   * Abort listening immediately
   */
  abort(): void {
    this.clearSilenceTimer();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore abort errors
      }
    }
    this.isListening = false;
  }

  /**
   * Destroy the recognition instance completely
   */
  destroy(): void {
    this.abort();
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onend = null;
      this.recognition.onerror = null;
      this.recognition.onresult = null;
      this.recognition.onaudiostart = null;
      this.recognition.onaudioend = null;
      this.recognition.onsoundstart = null;
      this.recognition.onsoundend = null;
      this.recognition.onspeechstart = null;
      this.recognition.onspeechend = null;
      this.recognition = null;
    }
    this.callbacks = null;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}
