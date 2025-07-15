import React, { useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';
import { FrontView } from './FrontView';
import { BackView } from './BackView';
import { MuscleInfo, getMuscleById } from './MuscleData.ts';
import styles from './BodyMapViewer.module.css';

export type DisplayMode = 'fatigue' | 'activation' | 'selection' | 'custom';
export type ViewSize = 'small' | 'medium' | 'large';
export type ViewMode = 'single' | 'side-by-side';

export interface MuscleDisplayState {
  color: string;
  intensity: number; // 0-1
  label?: string;
}

interface BodyMapViewerProps {
  muscleStates?: Map<number, MuscleDisplayState>;
  displayMode?: DisplayMode;
  interactive?: boolean;
  size?: ViewSize;
  viewMode?: ViewMode;
  showControls?: boolean;
  showLabels?: boolean;
  onMuscleClick?: (muscleId: number, muscle: MuscleInfo) => void;
  className?: string;
  initialView?: 'front' | 'back';
}

export const BodyMapViewer: React.FC<BodyMapViewerProps> = ({
  muscleStates = new Map(),
  displayMode = 'custom',
  interactive = true,
  size = 'medium',
  viewMode = 'single',
  showControls = true,
  showLabels = false,
  onMuscleClick,
  className = '',
  initialView = 'front'
}) => {
  const [isFrontView, setIsFrontView] = useState(initialView === 'front');
  const [hoveredMuscle, setHoveredMuscle] = useState<number | undefined>(undefined);

  const handleMuscleClick = useCallback((muscleId: number) => {
    if (!interactive) return;
    
    const muscle = getMuscleById(muscleId);
    if (muscle) {
      onMuscleClick?.(muscleId, muscle);
    }
  }, [interactive, onMuscleClick]);

  const handleMuscleHover = useCallback((muscleId: number | undefined) => {
    if (!interactive) return;
    setHoveredMuscle(muscleId);
  }, [interactive]);

  const handleViewToggle = useCallback(() => {
    setIsFrontView(prev => !prev);
  }, []);

  // Set up swipe gesture detection
  const bind = useDrag((state) => {
    if (!showControls) return;
    
    const { swipe: [swipeX] } = state;
    if (swipeX !== 0) {
      setIsFrontView(prev => !prev);
    }
  }, {
    filterTaps: true,
  });

  // Get muscle display properties
  const getMuscleStyles = (muscleId: number) => {
    const state = muscleStates.get(muscleId);
    if (!state) return {};

    return {
      fill: state.color,
      fillOpacity: state.intensity,
      cursor: interactive ? 'pointer' : 'default'
    };
  };

  // Render side-by-side view
  if (viewMode === 'side-by-side') {
    return (
      <div className={`${styles.bodyMapViewer} ${styles[size]} ${styles.sideBySide} ${className}`}>
        {showControls && hoveredMuscle && showLabels && (
          <div className={styles.controlsTop}>
            <div className={styles.muscleLabel}>
              {getMuscleById(hoveredMuscle)?.name}
            </div>
          </div>
        )}
        
        <div className={styles.viewsContainer}>
          {/* Front View */}
          <div className={styles.viewWrapper}>
            <div className={styles.viewLabel}>Front</div>
            <div className={styles.svgContainer}>
              <FrontView 
                onMuscleClick={handleMuscleClick}
                selectedMuscleId={hoveredMuscle}
                muscleStyles={getMuscleStyles}
                onMuscleHover={handleMuscleHover}
              />
            </div>
          </div>
          
          {/* Back View */}
          <div className={styles.viewWrapper}>
            <div className={styles.viewLabel}>Back</div>
            <div className={styles.svgContainer}>
              <BackView 
                onMuscleClick={handleMuscleClick}
                selectedMuscleId={hoveredMuscle}
                muscleStyles={getMuscleStyles}
                onMuscleHover={handleMuscleHover}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render single view (original behavior)
  return (
    <div className={`${styles.bodyMapViewer} ${styles[size]} ${className}`}>
      {showControls && (
        <div className={styles.controls}>
          {hoveredMuscle && showLabels && (
            <div className={styles.muscleLabel}>
              {getMuscleById(hoveredMuscle)?.name}
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
      )}

      <div 
        className={styles.svgContainer}
        {...(showControls ? bind() : {})}
        style={{
          touchAction: showControls ? 'pan-y' : 'auto'
        }}
      >
        <div className={styles.svgWrapper}>
          {isFrontView ? (
            <FrontView 
              onMuscleClick={handleMuscleClick}
              selectedMuscleId={hoveredMuscle}
              muscleStyles={getMuscleStyles}
              onMuscleHover={handleMuscleHover}
            />
          ) : (
            <BackView 
              onMuscleClick={handleMuscleClick}
              selectedMuscleId={hoveredMuscle}
              muscleStyles={getMuscleStyles}
              onMuscleHover={handleMuscleHover}
            />
          )}
          
          {/* Overlay for muscle labels */}
          {showLabels && hoveredMuscle && (
            <div className={styles.labelOverlay}>
              <span className={styles.label}>
                {muscleStates.get(hoveredMuscle)?.label || getMuscleById(hoveredMuscle)?.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};