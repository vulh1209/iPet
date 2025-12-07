import { useEffect, useState, useRef } from 'react';

/**
 * Hook to detect and display stat changes (happiness, energy, etc.)
 * Shows a floating indicator when value changes within threshold.
 *
 * @param value - Current stat value
 * @param threshold - Max change to show indicator (ignores large jumps like initial load)
 * @param duration - How long to show the change indicator (ms)
 * @returns The change value to display, or null if no recent change
 */
export function useStatChangeDetector(
  value: number,
  threshold = 50,
  duration = 1500
): number | null {
  const [change, setChange] = useState<number | null>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const diff = value - prevRef.current;
    // Always update prevRef FIRST, before any early returns
    prevRef.current = value;

    if (diff !== 0 && Math.abs(diff) < threshold) {
      setChange(diff);
      const timer = setTimeout(() => setChange(null), duration);
      return () => clearTimeout(timer);
    }
  }, [value, threshold, duration]);

  return change;
}
