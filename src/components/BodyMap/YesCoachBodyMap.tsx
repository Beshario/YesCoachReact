import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import { FrontView } from './FrontView';
import { BackView } from './BackView';
import { MuscleInfo, getMuscleById } from './MuscleData';
import styles from './styles.module.css';

interface YesCoachBodyMapProps {
  onMuscleSelected?: (muscle: MuscleInfo) => void;
  className?: string;
}

export const YesCoachBodyMap: React.FC<YesCoachBodyMapProps> = ({
  onMuscleSelected,
  className = ''
}) => {
  const [isFrontView, setIsFrontView] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleInfo | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleMuscleClick = useCallback((muscleId: number) => {
    const muscle = getMuscleById(muscleId);
    if (muscle) {
      setSelectedMuscle(muscle);
      onMuscleSelected?.(muscle);
      console.log('Selected muscle:', muscle);
    }
  }, [onMuscleSelected]);



  const handleViewToggle = useCallback(() => {
    setIsFrontView(prev => !prev);
  }, []);

  // Set up swipe gesture detection
  const bind = useDrag((state) => {
    const { swipe: [swipeX] } = state;
    
    // If there's a horizontal swipe, toggle the view
    if (swipeX !== 0) {
      setIsFrontView(prev => !prev);
    }
  }, {
    filterTaps: true, // This ensures taps/clicks are not detected as swipes
  });

  return (
    <div className={`${styles.bodyMapContainer} ${className}`}>
      <div className={styles.controls}>
        {selectedMuscle && (
          <div className={styles.selectedMuscleHeader}>
            Selected: {selectedMuscle.name}
          </div>
        )}
        <button 
          className={styles.toggleButton}
          onClick={handleViewToggle}
          aria-label={`Switch to ${isFrontView ? 'back' : 'front'} view`}
        >
          {isFrontView ? 'Back View' : 'Front View'}
        </button>
      </div>

      <div 
        ref={svgContainerRef}
        className={styles.svgContainer}
        {...bind()}
        style={{
          touchAction: 'pan-y' // Allow vertical scrolling but handle horizontal swipes
        }}
      >
        {isFrontView ? (
          <FrontView 
            onMuscleClick={handleMuscleClick} 
            selectedMuscleId={selectedMuscle?.id}
          />
        ) : (
          <BackView 
            onMuscleClick={handleMuscleClick} 
            selectedMuscleId={selectedMuscle?.id}
          />
        )}
      </div>
    </div>
  );
};

export default YesCoachBodyMap;