import React, { useState } from 'react';
import { ExerciseInfo } from '../../types/ExerciseTypes';
import { MuscleInfo } from '../BodyMap/MuscleData';
import styles from './ExerciseCard.module.css';

interface ExerciseCardProps {
  exercise: ExerciseInfo;
  selectedMuscle?: MuscleInfo;
  onSelect?: () => void;
  onAddToWorkout?: () => void;
  onGetAlternatives?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  selectedMuscle,
  onSelect,
  onAddToWorkout,
  onGetAlternatives
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Get muscle activation percentage for selected muscle
  const getMuscleActivation = () => {
    if (!selectedMuscle) return null;
    
    const targetMuscles = exercise.muscleActivation.target;
    const synergistMuscles = exercise.muscleActivation.synergists;
    const stabilizerMuscles = exercise.muscleActivation.stabilizers;
    
    if (targetMuscles.includes(selectedMuscle.id)) {
      return { level: 'Primary', percentage: '85-100%', color: '#4CAF50' };
    } else if (synergistMuscles.includes(selectedMuscle.id)) {
      return { level: 'Secondary', percentage: '40-70%', color: '#FF9800' };
    } else if (stabilizerMuscles.includes(selectedMuscle.id)) {
      return { level: 'Stabilizer', percentage: '15-30%', color: '#2196F3' };
    }
    
    return null;
  };

  const muscleActivation = getMuscleActivation();

  // Format equipment list
  const formatEquipment = (equipment: string[]) => {
    if (equipment.length === 0) return 'Bodyweight';
    if (equipment.length === 1) return equipment[0];
    if (equipment.length === 2) return equipment.join(' + ');
    return `${equipment[0]} + ${equipment.length - 1} more`;
  };

  // Open Instagram for exercise demo
  const openInstagramDemo = () => {
    const query = exercise.instagramQuery || exercise.name.replace(/\s+/g, '_').toLowerCase();
    const instagramUrl = `instagram://search?q=${encodeURIComponent(query)}_form`;
    const webFallback = `https://www.instagram.com/explore/tags/${encodeURIComponent(query.replace(/\s+/g, ''))}/`;
    
    // Try Instagram app first, fallback to web
    window.location.href = instagramUrl;
    setTimeout(() => {
      window.open(webFallback, '_blank');
    }, 500);
  };

  return (
    <div className={`${styles.exerciseCard} ${isExpanded ? styles.expanded : ''}`}>
      {/* Header */}
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.titleSection}>
          <h3 className={styles.exerciseName}>{exercise.name}</h3>
          <div className={styles.metadata}>
            <span 
              className={styles.difficulty}
              style={{ backgroundColor: getDifficultyColor(exercise.difficulty) }}
            >
              {exercise.difficulty}
            </span>
            <span className={styles.equipment}>
              {formatEquipment(exercise.equipment)}
            </span>
            {muscleActivation && (
              <span 
                className={styles.activation}
                style={{ color: muscleActivation.color }}
              >
                {muscleActivation.level} ({muscleActivation.percentage})
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.addButton}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWorkout?.();
            }}
            title="Add to workout"
          >
            +
          </button>
          <span className={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className={styles.content}>
          {/* Exercise classification */}
          <div className={styles.classification}>
            <div className={styles.tag}>
              <strong>Type:</strong> {exercise.mechanics} • {exercise.force}
            </div>
            <div className={styles.tag}>
              <strong>Pattern:</strong> {exercise.movementPattern}
            </div>
            <div className={styles.tag}>
              <strong>Training:</strong> {exercise.trainingTypes.join(', ')}
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructions}>
            <div className={styles.instructionSection}>
              <h4>Setup</h4>
              <p>{exercise.preparation}</p>
            </div>
            <div className={styles.instructionSection}>
              <h4>Execution</h4>
              <p>{exercise.execution}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.actionButtons}>            
            <button 
              className={styles.alternativesButton}
              onClick={(e) => {
                e.stopPropagation();
                onGetAlternatives?.();
              }}
            >
              ⚡ Alternatives
            </button>
            
            <button 
              className={styles.detailsButton}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
            >
              📊 Details
            </button>
          </div>

          {/* Muscle breakdown */}
          <div className={styles.muscleBreakdown}>
            <h4>Muscle Activation</h4>
            <div className={styles.muscleList}>
              <div className={styles.muscleGroup}>
                <strong>Primary:</strong> {exercise.muscleActivation.target.length} muscles
              </div>
              <div className={styles.muscleGroup}>
                <strong>Secondary:</strong> {exercise.muscleActivation.synergists.length} muscles  
              </div>
              <div className={styles.muscleGroup}>
                <strong>Stabilizers:</strong> {exercise.muscleActivation.stabilizers.length} muscles
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;