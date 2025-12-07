import { useState, useEffect } from 'react';
import { getEnergyLevel } from '../../types/mood';
import { useStatChangeDetector } from '../../hooks/useStatChangeDetector';
import './EnergyBar.css';

interface EnergyBarProps {
  energy: number; // 0-100
  isVisible: boolean;
  isSleeping?: boolean;
}

export function EnergyBar({ energy, isVisible, isSleeping = false }: EnergyBarProps) {
  const energyChange = useStatChangeDetector(energy);
  // Counter to force new DOM element for animation restart
  const [changeKey, setChangeKey] = useState(0);

  // Increment key when change appears to restart animation
  useEffect(() => {
    if (energyChange !== null) {
      setChangeKey(k => k + 1);
    }
  }, [energyChange]);

  if (!isVisible) return null;

  // Use centralized thresholds from mood.ts
  const energyLevel = getEnergyLevel(energy);
  const containerClass = `energy-bar-container ${energyLevel}${isSleeping ? ' sleeping' : ''}`;

  return (
    <div className={containerClass}>
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
        <div
          key={changeKey}
          className={`energy-change ${energyChange > 0 ? 'positive' : 'negative'}`}
        >
          {energyChange > 0 ? '+' : ''}{energyChange}
        </div>
      )}
    </div>
  );
}
