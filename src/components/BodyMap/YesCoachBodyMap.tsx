import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleMuscleClick = useCallback((muscleId: number) => {
    const muscle = getMuscleById(muscleId);
    if (muscle) {
      setSelectedMuscle(muscle);
      onMuscleSelected?.(muscle);
      setIsZoomed(true);
      calculateZoomTransform(muscleId);
      console.log('Selected muscle:', muscle);
    }
  }, [onMuscleSelected]);

  const handleBackClick = useCallback(() => {
    setIsZoomed(false);
    setSelectedMuscle(null);
    setZoomTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const calculateZoomTransform = (muscleId: number) => {
    // Define zoom areas for each muscle group
    const muscleZoomAreas: Record<number, { scale: number; x: number; y: number }> = {
      160: { scale: 1, x: 0, y: 0 },   // Chest
      110: { scale: 1, x: 0, y: 0 },   // Shoulders
      143: { scale: 1, x: 0, y: 0 },   // Upper Traps
      122: { scale: 1, x: 0, y: 0 },   // Biceps
      130: { scale: 1, x: 0, y: 0 },   // Forearms
      171: { scale: 1, x: 0, y: 0 },   // Core/Abs
      164: { scale: 1, x: 0, y: 0 },   // Serratus Anterior
      173: { scale: 1, x: 0, y: 0 },   // Obliques
      193: { scale: 1, x: 0, y: 0 },   // Hip Adductors
      191: { scale: 1, x: 0, y: 0 },   // Quads
      201: { scale: 1, x: 0, y: 0 },   // Calves
      121: { scale: 1, x: 0, y: 0 },   // Triceps
      142: { scale: 1, x: 0, y: 0 },   // Teres Major
      113: { scale: 1, x: 0, y: 0 },   // Posterior Deltoid
      141: { scale: 1, x: 0, y: 0 },   // Latissimus Dorsi
      175: { scale: 1, x: 0, y: 0 },   // Lower Back
      181: { scale: 1, x: 0, y: 0 },   // Glutes
      192: { scale: 1, x: 0, y: 0 },   // Hamstrings
      210: { scale: 1, x: 0, y: 0 },   // Heart
    };

    const zoomArea = muscleZoomAreas[muscleId] || { scale: 2, x: -50, y: -50 };
    setZoomTransform(zoomArea);
  };

  const handleSwipe = useCallback(() => {
    setIsFrontView(prev => !prev);
  }, []);

  const handleViewToggle = useCallback(() => {
    setIsFrontView(prev => !prev);
  }, []);

  return (
    <div className={`${styles.bodyMapContainer} ${className}`}>
      <div className={styles.controls}>
        {isZoomed && (
          <button 
            className={styles.backButton}
            onClick={handleBackClick}
            aria-label="Back to full view"
          >
            Back
          </button>
        )}
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
        className={`${styles.svgContainer} ${isZoomed ? styles.zoomed : ''}`}
        onTouchStart={handleSwipe}
        style={{
          transform: isZoomed 
            ? `scale(${zoomTransform.scale}) translate(${zoomTransform.x}%, ${zoomTransform.y}%)`
            : 'none',
          transformOrigin: 'center center',
          transition: 'transform 0.5s ease-in-out'
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