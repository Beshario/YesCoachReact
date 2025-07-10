import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { exerciseService } from '../../services/exerciseService';
import styles from './ExerciseReplacementModal.module.css';

interface ExerciseReplacementModalProps {
  currentExercise: SimpleExercise;
  onReplace: (newExercise: SimpleExercise) => void;
  onClose: () => void;
}

type ReplacementType = 'alternatives' | 'progressions' | 'regressions';

const ExerciseReplacementModal: React.FC<ExerciseReplacementModalProps> = ({
  currentExercise,
  onReplace,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<ReplacementType>('alternatives');
  const [exercises, setExercises] = useState<SimpleExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    loadExercises(activeTab);
  }, [activeTab, currentExercise.id]);

  useEffect(() => {
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
  }, []);

  const loadExercises = async (type: ReplacementType) => {
    setLoading(true);
    try {
      await exerciseService.initialize();
      
      let results: SimpleExercise[] = [];
      
      switch (type) {
        case 'alternatives':
          results = await exerciseService.getAlternatives(currentExercise.id);
          break;
        case 'progressions':
          // For now, find harder exercises in same category
          results = await exerciseService.quickSearch('', 100);
          results = results.filter(ex => 
            ex.category === currentExercise.category &&
            ex.difficulty === 'advanced' &&
            ex.id !== currentExercise.id
          ).slice(0, 10);
          break;
        case 'regressions':
          // For now, find easier exercises in same category
          results = await exerciseService.quickSearch('', 100);
          results = results.filter(ex => 
            ex.category === currentExercise.category &&
            ex.difficulty === 'beginner' &&
            ex.id !== currentExercise.id
          ).slice(0, 10);
          break;
      }
      
      setExercises(results);
    } catch (error) {
      console.error('Failed to load replacement exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleReplace = (newExercise: SimpleExercise) => {
    onReplace(newExercise);
  };

  const getTabLabel = (type: ReplacementType) => {
    switch (type) {
      case 'alternatives': return 'Alternatives';
      case 'progressions': return 'Harder';
      case 'regressions': return 'Easier';
    }
  };

  const getEmptyMessage = (type: ReplacementType) => {
    switch (type) {
      case 'alternatives': return 'No alternative exercises found';
      case 'progressions': return 'No harder exercises found';
      case 'regressions': return 'No easier exercises found';
    }
  };

  const modalContent = (
    <div 
      className={`${styles.modalBackdrop} ${isClosing ? styles.closing : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>Replace: {currentExercise.name}</h3>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['alternatives', 'progressions', 'regressions'] as ReplacementType[]).map(type => (
            <button
              key={type}
              className={`${styles.tab} ${activeTab === type ? styles.active : ''}`}
              onClick={() => setActiveTab(type)}
            >
              {getTabLabel(type)}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className={styles.exerciseList}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading exercises...</p>
            </div>
          ) : exercises.length > 0 ? (
            exercises.map(exercise => (
              <div 
                key={exercise.id}
                className={styles.exerciseItem}
                onClick={() => handleReplace(exercise)}
              >
                <div className={styles.exerciseInfo}>
                  <h4>{exercise.name}</h4>
                  <div className={styles.exerciseMeta}>
                    <span className={styles.category}>{exercise.category}</span>
                    <span className={`${styles.difficulty} ${styles[exercise.difficulty]}`}>
                      {exercise.difficulty}
                    </span>
                    {exercise.equipment.length > 0 && (
                      <span className={styles.equipment}>
                        {exercise.equipment[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.replaceArrow}>→</div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>{getEmptyMessage(activeTab)}</p>
              <small>Try checking other tabs or browse exercises manually</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ExerciseReplacementModal;