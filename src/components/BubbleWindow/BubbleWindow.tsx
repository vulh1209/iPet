import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './BubbleWindow.css';

interface BubblePayload {
  text: string;
  isProcessing?: boolean;
}

export function BubbleWindow() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('[BubbleWindow] Component mounted, setting up event listeners');

    // Get current window to verify we're in bubble window
    const currentWindow = getCurrentWindow();
    console.log('[BubbleWindow] Window label:', currentWindow.label);

    // Listen for bubble show event
    const unlistenShow = listen<BubblePayload>('bubble:show', (event) => {
      console.log('[BubbleWindow] bubble:show received:', event.payload);
      setText(event.payload.text);
      setIsProcessing(event.payload.isProcessing ?? false);
      setIsVisible(true);
    });

    // Listen for bubble hide event
    const unlistenHide = listen('bubble:hide', () => {
      console.log('[BubbleWindow] bubble:hide received');
      setIsVisible(false);
    });

    // Listen for bubble update event (for processing state)
    const unlistenUpdate = listen<BubblePayload>('bubble:update', (event) => {
      console.log('[BubbleWindow] bubble:update received:', event.payload);
      setText(event.payload.text);
      setIsProcessing(event.payload.isProcessing ?? false);
    });

    return () => {
      console.log('[BubbleWindow] Cleaning up listeners');
      unlistenShow.then(f => f());
      unlistenHide.then(f => f());
      unlistenUpdate.then(f => f());
    };
  }, []);

  // Always show container, hide content when not visible
  return (
    <div className="bubble-container">
      {isVisible ? (
        <div className={`bubble ${isProcessing ? 'processing' : ''}`}>
          <div className="bubble-content">
            {isProcessing && !text ? (
              <div className="bubble-loading">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            ) : (
              text || '...'
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
