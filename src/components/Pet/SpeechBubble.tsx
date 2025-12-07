interface SpeechBubbleProps {
  text: string;
}

/**
 * Speech bubble component for displaying transcript/response
 * Includes decorative sparkles and glass effect
 */
export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <div className="speech-bubble">
      {/* Floating sparkle decorations */}
      <span className="speech-sparkle speech-sparkle--1" />
      <span className="speech-sparkle speech-sparkle--2" />
      <span className="speech-sparkle speech-sparkle--3" />
      <span className="speech-sparkle speech-sparkle--4" />
      <span className="speech-star" />

      {/* Glass content area */}
      <div className="speech-bubble-content">
        {text}
      </div>
    </div>
  );
}
