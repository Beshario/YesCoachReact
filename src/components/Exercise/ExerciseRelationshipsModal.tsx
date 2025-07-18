import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { exerciseService } from '../../services/exerciseService';
import styles from './ExerciseRelationshipsModal.module.css';

interface ExerciseRelationshipsModalProps {
  exercise: SimpleExercise;
  onClose: () => void;
  onExerciseSelect?: (exercise: SimpleExercise) => void;
}

type RelationshipType = 'similar' | 'alternatives' | 'progressions' | 'regressions';

interface RelationshipData {
  similar: SimpleExercise[];
  alternatives: SimpleExercise[];
  progressions: SimpleExercise[];
  regressions: SimpleExercise[];
}

const ExerciseRelationshipsModal: React.FC<ExerciseRelationshipsModalProps> = ({
  exercise,
  onClose,
  onExerciseSelect
}) => {
  const [activeTab, setActiveTab] = useState<RelationshipType>('similar');
  const [relationships, setRelationships] = useState<RelationshipData>({
    similar: [],
    alternatives: [],
    progressions: [],
    regressions: []
  });
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    loadRelationships();
  }, [exercise.id]);

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

  const loadRelationships = async () => {
    setLoading(true);
    try {
      await exerciseService.initialize();
      
      const [similar, alternatives, progressions, regressions] = await Promise.all([
        exerciseService.getSimilar(exercise.id),
        exerciseService.getAlternatives(exercise.id),
        exerciseService.getProgressions(exercise.id),
        exerciseService.getRegressions(exercise.id)
      ]);

      setRelationships({
        similar,
        alternatives,
        progressions,
        regressions
      });
    } catch (error) {
      console.error('Failed to load exercise relationships:', error);
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

  const handleExerciseClick = (selectedExercise: SimpleExercise) => {
    if (onExerciseSelect) {
      onExerciseSelect(selectedExercise);
    }
  };

  const getTabLabel = (type: RelationshipType) => {
    switch (type) {
      case 'similar': return 'Similar';
      case 'alternatives': return 'Alternatives';
      case 'progressions': return 'Progressions';
      case 'regressions': return 'Regressions';
    }
  };

  const getTabDescription = (type: RelationshipType) => {
    switch (type) {
      case 'similar': return 'Exercises with same movement pattern';
      case 'alternatives': return 'Different exercises for same muscles';
      case 'progressions': return 'Harder variations of this exercise';
      case 'regressions': return 'Easier variations of this exercise';
    }
  };

  const getCurrentExercises = (): SimpleExercise[] => {
    return relationships[activeTab] || [];
  };

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
          <div className={styles.headerText}>
            <h2>Related Exercises</h2>
            <p className={styles.exerciseName}>{exercise.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['similar', 'alternatives', 'progressions', 'regressions'] as RelationshipType[]).map(type => (
            <button
              key={type}
              className={`${styles.tab} ${activeTab === type ? styles.active : ''}`}
              onClick={() => setActiveTab(type)}
            >
              <span className={styles.tabLabel}>{getTabLabel(type)}</span>
              <span className={styles.tabCount}>
                {relationships[type]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <div className={styles.tabDescription}>
          {getTabDescription(activeTab)}
        </div>

        {/* Exercise List */}
        <div className={styles.exerciseList}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading related exercises...</p>
            </div>
          ) : getCurrentExercises().length > 0 ? (
            getCurrentExercises().map(relatedExercise => (
              <div 
                key={relatedExercise.id}
                className={styles.exerciseItem}
                onClick={() => handleExerciseClick(relatedExercise)}
              >
                <div className={styles.exerciseInfo}>
                  <h4>{relatedExercise.name}</h4>
                  <div className={styles.exerciseMeta}>
                    <span className={styles.category}>{relatedExercise.category}</span>
                    <span className={`${styles.difficulty} ${styles[relatedExercise.difficulty]}`}>
                      {relatedExercise.difficulty}
                    </span>
                    {relatedExercise.equipment.length > 0 && (
                      <span className={styles.equipment}>
                        {relatedExercise.equipment[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.viewArrow}>→</div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>No {activeTab} found</p>
              <small>This exercise doesn't have any {activeTab} in our database</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ExerciseRelationshipsModal;