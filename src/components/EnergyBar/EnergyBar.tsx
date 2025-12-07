import { useEffect, useState, useRef } from 'react';
import './EnergyBar.css';

interface EnergyBarProps {
  energy: number; // 0-100
  isVisible: boolean;
  isSleeping?: boolean;
}

export function EnergyBar({ energy, isVisible, isSleeping = false }: EnergyBarProps) {
  const [energyChange, setEnergyChange] = useState<number | null>(null);
  const prevEnergyRef = useRef(energy);

  // Detect energy changes and show floating indicator
  useEffect(() => {
    const diff = energy - prevEnergyRef.current;
    if (diff !== 0 && Math.abs(diff) < 50) { // Ignore large jumps (initial load, etc.)
      setEnergyChange(diff);
      const timer = setTimeout(() => setEnergyChange(null), 1500);
      return () => clearTimeout(timer);
    }
    prevEnergyRef.current = energy;
  }, [energy]);

  if (!isVisible || isSleeping) return null;

  const getEnergyClass = () => {
    if (energy < 15) return 'exhausted';
    if (energy < 35) return 'tired';
    if (energy < 60) return 'normal';
    if (energy < 85) return 'energetic';
    return 'hyperactive';
  };

  return (
    <div className={`energy-bar-container ${getEnergyClass()}`}>
      <div className="energy-label">
        <span className="energy-icon">⚡</span>
        <span className="energy-value">{Math.round(energy)}</span>
      </div>
      <div className="energy-bar-track" title={`Energy: ${Math.round(energy)}%`}>
        <div
          className="energy-bar-fill"
          style={{ width: `${energy}%` }}
        />
      </div>
      {energyChange !== null && (
        <div className={`energy-change ${energyChange > 0 ? 'positive' : 'negative'}`}>
          {energyChange > 0 ? '+' : ''}{energyChange}
        </div>
      )}
    </div>
  );
}
