import './EnergyBar.css';

interface EnergyBarProps {
  energy: number; // 0-100
  isVisible: boolean;
  isSleeping?: boolean;
}

export function EnergyBar({ energy, isVisible, isSleeping = false }: EnergyBarProps) {
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
      <div className="energy-bar-track" title={`Energy: ${Math.round(energy)}%`}>
        <div
          className="energy-bar-fill"
          style={{ width: `${energy}%` }}
        />
      </div>
    </div>
  );
}
