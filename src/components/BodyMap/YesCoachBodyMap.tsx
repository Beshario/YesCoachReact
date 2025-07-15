import React, { useState, useCallback, useEffect } from 'react';
import { BodyMapViewer, MuscleDisplayState } from './BodyMapViewer';
import { MuscleInfo, getMuscleById } from './MuscleData';
import { muscleStateService } from '../../services/muscleStateService';
import styles from './styles.module.css';

interface YesCoachBodyMapProps {
  onMuscleSelected?: (muscle: MuscleInfo) => void;
  className?: string;
}

export const YesCoachBodyMap: React.FC<YesCoachBodyMapProps> = ({
  onMuscleSelected,
  className = ''
}) => {
  const [muscleStates, setMuscleStates] = useState<Map<number, MuscleDisplayState>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load muscle fatigue states
  useEffect(() => {
    const loadMuscleStates = async () => {
      try {
        setLoading(true);
        const states = await muscleStateService.getMuscleDisplayStates();
        setMuscleStates(states);
      } catch (error) {
        console.error('Failed to load muscle states:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMuscleStates();

    // Refresh muscle states every 30 seconds
    const interval = setInterval(loadMuscleStates, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMuscleClick = useCallback((muscleId: number, muscle: MuscleInfo) => {
    onMuscleSelected?.(muscle);
    console.log('Selected muscle:', muscle);
  }, [onMuscleSelected]);

  return (
    <div className={`${styles.bodyMapContainer} ${className}`}>
      {loading && (
        <div className={styles.loadingOverlay}>
          Loading muscle states...
        </div>
      )}
      <BodyMapViewer
        muscleStates={muscleStates}
        displayMode="fatigue"
        interactive={true}
        size="large"
        showControls={true}
        showLabels={false}
        onMuscleClick={handleMuscleClick}
        className={styles.mainBodyMap}
      />
    </div>
  );
};

export default YesCoachBodyMap;