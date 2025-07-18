import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { BodyMapViewer } from '../BodyMap';
import { muscleStateService } from '../../services/muscleStateService';
import ExerciseRelationshipsModal from './ExerciseRelationshipsModal';
import styles from './ExerciseDetailModal.module.css';

interface ExerciseDetailModalProps {
  exercise: SimpleExercise | null;
  onClose: () => void;
  onExerciseSelect?: (exercise: SimpleExercise) => void;
}

// Image component with click-to-alternate functionality
const ClickableExerciseImage: React.FC<{ 
  imageUrls: string[]; 
  exerciseName: string; 
}> = ({ imageUrls, exerciseName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }
  
  const handleImageClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };
  
  return (
    <div className={styles.imageContainer}>
      <img 
        src={imageUrls[currentIndex]}
        alt={`${exerciseName} demonstration ${currentIndex + 1}`}
        onClick={handleImageClick}
        className={styles.exerciseImage}
        style={{ cursor: imageUrls.length > 1 ? 'pointer' : 'default' }}
      />
      {imageUrls.length > 1 && (
        <div className={styles.imageIndicator}>
          {currentIndex + 1} / {imageUrls.length}
        </div>
      )}
    </div>
  );
};

const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose, onExerciseSelect }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);

  // Get muscle activation display states
  const muscleStates = useMemo(() => {
    if (!exercise) return new Map();
    
    // Get primary and secondary muscles from exercise
    const primaryMuscles = exercise.primaryMuscles || [];
    const secondaryMuscles = exercise.secondaryMuscles || [];
    
    return muscleStateService.getMuscleActivationDisplay(
      primaryMuscles,
      secondaryMuscles
    );
  }, [exercise]);

  useEffect(() => {
    if (exercise) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [exercise]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!exercise) return null;

  const modalContent = (
    <div 
      className={`${styles.modalBackdrop} ${isClosing ? styles.closing : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <button 
            className={styles.backButton}
            onClick={handleClose}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h2>{exercise.name}</h2>
          <div className={styles.spacer}></div>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Exercise Images */}
          {exercise.imageUrls && exercise.imageUrls.length > 0 && (
            <div className={styles.imageSection}>
              <ClickableExerciseImage 
                imageUrls={exercise.imageUrls} 
                exerciseName={exercise.name}
              />
            </div>
          )}

          {/* Exercise Info */}
          <div className={styles.exerciseInfo}>
            <div className={styles.metadataRow}>
              <span className={`${styles.difficulty} ${styles[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
              {exercise.equipment.map((eq, index) => (
                <span key={index} className={styles.equipment}>
                  {eq || 'Bodyweight'}
                </span>
              ))}
            </div>

            <div className={styles.categoryRow}>
              <span className={styles.category}>Category: {exercise.category}</span>
            </div>
          </div>

          {/* Muscle Map */}
          <div className={styles.muscleMapSection}>
            <h3>Muscles Targeted</h3>
            <div className={styles.muscleMapContainer}>
              <BodyMapViewer
                muscleStates={muscleStates}
                displayMode="activation"
                interactive={false}
                size="small"
                viewMode="side-by-side"
                showControls={false}
                showLabels={true}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructionsSection}>
            <h3>Instructions</h3>
            <ol className={styles.instructionsList}>
              {exercise.instructions && Array.isArray(exercise.instructions) ? (
                exercise.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))
              ) : exercise.instructions ? (
                <li>{exercise.instructions}</li>
              ) : (
                <li>No instructions available</li>
              )}
            </ol>
          </div>

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className={styles.tipsSection}>
              <h3>Tips</h3>
              <ul className={styles.tipsList}>
                {Array.isArray(exercise.tips) ? (
                  exercise.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))
                ) : (
                  <li>{exercise.tips}</li>
                )}
              </ul>
            </div>
          )}

          {/* Tags */}
          {exercise.tags && exercise.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <h3>Tags</h3>
              <div className={styles.tagsList}>
                {exercise.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Related Exercises Button */}
          <div className={styles.relatedExercisesSection}>
            <button 
              className={styles.relatedExercisesButton}
              onClick={() => setShowRelationships(true)}
            >
              View Related Exercises
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleRelatedExerciseSelect = (selectedExercise: SimpleExercise) => {
    setShowRelationships(false);
    if (onExerciseSelect) {
      onExerciseSelect(selectedExercise);
    }
  };

  // Render modal using React Portal
  return (
    <>
      {ReactDOM.createPortal(modalContent, document.body)}
      {showRelationships && exercise && (
        <ExerciseRelationshipsModal
          exercise={exercise}
          onClose={() => setShowRelationships(false)}
          onExerciseSelect={handleRelatedExerciseSelect}
        />
      )}
    </>
  );
};

export default ExerciseDetailModal;