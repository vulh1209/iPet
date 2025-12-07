import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SpeechRecognitionService,
  SpeechRecognitionResult,
} from '../services/SpeechRecognitionService';
import { geminiService, GeminiResponse } from '../services/GeminiService';
import { useSettings } from './useSettings';
import { ensureMicPermission } from '../services/PermissionService';

export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceInputError {
  type: 'permission' | 'not-supported' | 'recognition' | 'api';
  message: string;
}

interface UseVoiceInputReturn {
  state: VoiceInputState;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  response: GeminiResponse | null;
  streamingText: string; // Real-time streaming response
  error: VoiceInputError | null;
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
}

/**
 * React hook for voice input with Gemini integration
 * Handles speech recognition and sends transcript to Gemini API
 */
export function useVoiceInput(): UseVoiceInputReturn {
  const { settings } = useSettings();
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<GeminiResponse | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<VoiceInputError | null>(null);

  const recognitionRef = useRef<SpeechRecognitionService | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<VoiceInputState>('idle');

  // Keep stateRef in sync
  stateRef.current = state;

  // DON'T initialize recognition service on mount - it crashes WKWebView
  // We'll create it lazily when startListening is called

  // Clear error after timeout
  const setErrorWithTimeout = useCallback((err: VoiceInputError) => {
    setError(err);
    setState('error');

    // Clear previous timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Auto-clear error after 3 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
      setState('idle');
    }, 3000);
  }, []);

  // Handle recognition result
  const handleResult = useCallback(
    async (result: SpeechRecognitionResult) => {
      const text = result.transcript.trim();

      // Update transcript in realtime (even for interim results)
      if (text) {
        setTranscript(text);
      }

      // Only process when final
      if (!result.isFinal) return;

      if (!text) {
        setState('idle');
        return;
      }

      setState('processing');
      setStreamingText(''); // Clear previous streaming text

      // Send to Gemini with streaming
      const geminiResponse = await geminiService.chatStream(text, (_chunk, fullText) => {
        // Update streaming text in real-time
        setStreamingText(fullText);
      });

      if (geminiResponse.error) {
        // Clear transcript when API error occurs to hide speech bubble
        setTranscript('');
        setStreamingText('');
        setErrorWithTimeout({
          type: 'api',
          message: geminiResponse.error,
        });
      } else {
        setResponse(geminiResponse);
        setStreamingText(''); // Clear streaming, response is now complete
        setState('idle');

        // Clear response after 5 seconds to hide speech bubble
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
        }
        responseTimeoutRef.current = setTimeout(() => {
          setResponse(null);
          setTranscript('');
        }, 5000);
      }
    },
    [setErrorWithTimeout]
  );

  // Handle recognition error
  const handleError = useCallback(
    (errorMessage: string) => {
      let errorType: VoiceInputError['type'] = 'recognition';

      if (
        errorMessage.includes('permission') ||
        errorMessage.includes('not-allowed')
      ) {
        errorType = 'permission';
      }

      setErrorWithTimeout({
        type: errorType,
        message: errorMessage,
      });
    },
    [setErrorWithTimeout]
  );

  // Handle recognition end
  const handleEnd = useCallback(() => {
    // Destroy recognition instance to release microphone
    if (recognitionRef.current) {
      recognitionRef.current.destroy();
      recognitionRef.current = null;
    }
    // Only set to idle if still listening (not processing or error)
    if (stateRef.current === 'listening') {
      // Clear transcript if recognition ended without processing
      // (e.g., user didn't say anything or recognition timed out)
      setTranscript('');
      setState('idle');
    }
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    // Check if microphone is enabled in settings
    if (!settings.microphone.enabled) {
      setErrorWithTimeout({
        type: 'permission',
        message: 'Microphone is disabled in settings',
      });
      return;
    }

    // Check/request microphone permission (macOS)
    const permResult = await ensureMicPermission();

    if (permResult.status !== 'authorized') {
      setErrorWithTimeout({
        type: 'permission',
        message: permResult.error || 'Microphone permission denied. Please enable in System Settings.',
      });
      return;
    }

    // Check browser support
    const isSupported = SpeechRecognitionService.isSupported();

    if (!isSupported) {
      setErrorWithTimeout({
        type: 'not-supported',
        message: 'Speech recognition not supported in this environment',
      });
      return;
    }

    // Clear previous state
    setTranscript('');
    setResponse(null);
    setError(null);

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }

    // Create recognition service lazily (to avoid crash on mount)
    // Use longer timeout (at least 5 seconds) to give user time to speak
    const timeout = Math.max(settings.microphone.silence_timeout, 5000);
    try {
      recognitionRef.current = new SpeechRecognitionService({
        language: settings.microphone.language,
        silenceTimeout: timeout,
        continuous: false,
        interimResults: true, // Enable interim results to see partial speech
      });
    } catch {
      setErrorWithTimeout({
        type: 'not-supported',
        message: 'Failed to initialize speech recognition',
      });
      return;
    }

    // Start recognition (now async to capture MediaStream for proper mic release)
    try {
      const started = await recognitionRef.current?.start({
        onResult: handleResult,
        onError: handleError,
        onEnd: handleEnd,
        onStart: () => {
          setState('listening');
        },
      });

      if (!started) {
        setErrorWithTimeout({
          type: 'recognition',
          message: 'Failed to start recognition',
        });
      }
    } catch (err) {
      setErrorWithTimeout({
        type: 'recognition',
        message: `Recognition error: ${err}`,
      });
    }
  }, [
    settings.microphone.enabled,
    settings.microphone.language,
    settings.microphone.silence_timeout,
    handleResult,
    handleError,
    handleEnd,
    setErrorWithTimeout,
  ]);

  // Stop listening and release microphone
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.destroy();
      recognitionRef.current = null;
    }
  }, []);

  // Clear error manually
  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);
    setState('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      // Destroy recognition to release microphone
      if (recognitionRef.current) {
        recognitionRef.current.destroy();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    state,
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    transcript,
    response,
    streamingText,
    error,
    startListening,
    stopListening,
    clearError,
  };
}
