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

  if (!isVisible || isSleeping) return null;

  // Use centralized thresholds from mood.ts
  const energyLevel = getEnergyLevel(energy);

  return (
    <div className={`energy-bar-container ${energyLevel}`}>
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
