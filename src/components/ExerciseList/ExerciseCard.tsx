import React, { useState } from 'react';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { MuscleInfo } from '../BodyMap/MuscleData';
import styles from './ExerciseCard.module.css';

// Simple image component with click-to-alternate functionality
const ClickableExerciseImage: React.FC<{ 
  imageUrls: string[]; 
  exerciseName: string; 
  className?: string; 
}> = ({ imageUrls, exerciseName, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }
  
  const handleImageClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };
  
  return (
    <div className={`${styles.imageContainer} ${className || ''}`}>
      <img 
        src={imageUrls[currentIndex]}
        alt={`${exerciseName} demonstration ${currentIndex + 1}`}
        onClick={handleImageClick}
        className={styles.clickableImage}
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

interface ExerciseCardProps {
  exercise: SimpleExercise;
  selectedMuscle?: MuscleInfo;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect?: () => void;
  onAddToWorkout?: () => void;
  onGetAlternatives?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  selectedMuscle,
  isExpanded,
  onToggleExpand,
  onSelect,
  onAddToWorkout,
  onGetAlternatives
}) => {

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
    
    // Check if we have precise percentage data
    if (exercise.muscleActivation && exercise.muscleActivation[selectedMuscle.id]) {
      const percentage = exercise.muscleActivation[selectedMuscle.id];
      const percentageDisplay = Math.round(percentage * 100);
      
      // Determine color based on percentage
      let color: string;
      let level: string;
      
      if (percentage >= 0.8) {
        color = '#4CAF50';
        level = 'Primary';
      } else if (percentage >= 0.4) {
        color = '#FF9800';
        level = 'Secondary';
      } else {
        color = '#2196F3';
        level = 'Stabilizer';
      }
      
      return { 
        level, 
        percentage: `${percentageDisplay}%`, 
        color,
        numericValue: percentage
      };
    }
    
    // Fallback to legacy categorical system
    const primaryMuscles = exercise.primaryMuscles;
    const secondaryMuscles = exercise.secondaryMuscles;
    const activationLevel = exercise.activationLevels[selectedMuscle.id];
    
    if (primaryMuscles.includes(selectedMuscle.id)) {
      return { level: 'Primary', percentage: '85-100%', color: '#4CAF50' };
    } else if (secondaryMuscles.includes(selectedMuscle.id)) {
      return { level: 'Secondary', percentage: '40-70%', color: '#FF9800' };
    } else if (activationLevel) {
      const levelInfo = {
        high: { level: 'High', percentage: '70-100%', color: '#4CAF50' },
        medium: { level: 'Medium', percentage: '40-70%', color: '#FF9800' },
        low: { level: 'Low', percentage: '15-30%', color: '#2196F3' }
      };
      return levelInfo[activationLevel];
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
    const query = exercise.name.replace(/\s+/g, '_').toLowerCase();
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
      <div className={styles.header} onClick={onToggleExpand}>
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
          {/* Exercise demonstration images */}
          {exercise.imageUrls && exercise.imageUrls.length > 0 && (
            <div className={styles.imageSection}>
              <h4>Demonstration</h4>
              <ClickableExerciseImage 
                imageUrls={exercise.imageUrls} 
                exerciseName={exercise.name}
              />
            </div>
          )}

          {/* Exercise classification */}
          <div className={styles.classification}>
            <div className={styles.tag}>
              <strong>Category:</strong> {exercise.category}
            </div>
            <div className={styles.tag}>
              <strong>Tags:</strong> {exercise.tags.join(', ')}
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructions}>
            <div className={styles.instructionSection}>
              <h4>Instructions</h4>
              <ol>
                {exercise.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
            {exercise.tips && exercise.tips.length > 0 && (
              <div className={styles.instructionSection}>
                <h4>Tips</h4>
                <ul>
                  {exercise.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
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
                <strong>Primary:</strong> {exercise.primaryMuscles.length} muscles
              </div>
              <div className={styles.muscleGroup}>
                <strong>Secondary:</strong> {exercise.secondaryMuscles.length} muscles  
              </div>
              <div className={styles.muscleGroup}>
                <strong>Total:</strong> {Object.keys(exercise.activationLevels).length} muscles
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;