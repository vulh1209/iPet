import './MoodIndicator.css';

interface MoodIndicatorProps {
  happiness: number;
  energy: number;
  isSleeping: boolean;
  isActive?: boolean;
}

export function MoodIndicator({
  happiness,
  energy,
  isSleeping,
  isActive = false,
}: MoodIndicatorProps) {
  if (isSleeping) {
    return (
      <div className="mood-indicator sleep-mode">
        <span className="sleep-indicator">💤</span>
      </div>
    );
  }

  return (
    <div className={`mood-indicator ${isActive ? 'active' : ''}`}>
      <div className="mood-bar mood-bar-happiness" title={`Happiness: ${Math.round(happiness)}%`}>
        <div
          className="mood-bar-fill"
          style={{ width: `${happiness}%` }}
        />
        <span className="mood-icon">💗</span>
      </div>
      <div className="mood-bar mood-bar-energy" title={`Energy: ${Math.round(energy)}%`}>
        <div
          className="mood-bar-fill"
          style={{ width: `${energy}%` }}
        />
        <span className="mood-icon">⚡</span>
      </div>
    </div>
  );
}
