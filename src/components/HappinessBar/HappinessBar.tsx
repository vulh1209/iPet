import { useStatChangeDetector } from '../../hooks/useStatChangeDetector';
import './HappinessBar.css';

interface HappinessBarProps {
  happiness: number; // 0-100
  isVisible: boolean;
  isSleeping?: boolean;
}

export function HappinessBar({ happiness, isVisible, isSleeping = false }: HappinessBarProps) {
  const happinessChange = useStatChangeDetector(happiness);

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
