import { useEffect, useState, useRef } from 'react';
import './HappinessBar.css';

interface HappinessBarProps {
  happiness: number; // 0-100
  isVisible: boolean;
  isSleeping?: boolean;
}

export function HappinessBar({ happiness, isVisible, isSleeping = false }: HappinessBarProps) {
  const [happinessChange, setHappinessChange] = useState<number | null>(null);
  const prevHappinessRef = useRef(happiness);

  // Detect happiness changes and show floating indicator
  useEffect(() => {
    const diff = happiness - prevHappinessRef.current;
    // Always update prevRef FIRST, before any early returns
    prevHappinessRef.current = happiness;

    if (diff !== 0 && Math.abs(diff) < 50) { // Ignore large jumps (initial load, etc.)
      setHappinessChange(diff);
      const timer = setTimeout(() => setHappinessChange(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [happiness]);

  if (!isVisible || isSleeping) return null;

  const getHappinessClass = () => {
    if (happiness < 20) return 'miserable';
    if (happiness < 40) return 'sad';
    if (happiness < 60) return 'content';
    if (happiness < 80) return 'happy';
    return 'ecstatic';
  };

  const getHappinessIcon = () => {
    if (happiness < 20) return '😢';
    if (happiness < 40) return '😔';
    if (happiness < 60) return '😊';
    if (happiness < 80) return '😄';
    return '🥰';
  };

  return (
    <div className={`happiness-bar-container ${getHappinessClass()}`}>
      <div className="happiness-label">
        <span className="happiness-icon">{getHappinessIcon()}</span>
        <span className="happiness-value">{Math.round(happiness)}</span>
      </div>
      <div className="happiness-bar-track" title={`Happiness: ${Math.round(happiness)}%`}>
        <div
          className="happiness-bar-fill"
          style={{ width: `${happiness}%` }}
        />
      </div>
      {happinessChange !== null && (
        <div className={`happiness-change ${happinessChange > 0 ? 'positive' : 'negative'}`}>
          {happinessChange > 0 ? '+' : ''}{happinessChange}
        </div>
      )}
    </div>
  );
}
