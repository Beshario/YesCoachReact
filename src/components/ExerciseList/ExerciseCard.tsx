import React from 'react';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { MuscleInfo } from '../BodyMap/MuscleData';
import { useWorkoutStore } from '../../stores/workoutStore';
import styles from './ExerciseCard.module.css';

interface ExerciseCardProps {
  exercise: SimpleExercise;
  selectedMuscle?: MuscleInfo;
  onClick: () => void;
  onAddToWorkout?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  selectedMuscle,
  onClick,
  onAddToWorkout
}) => {
  const { addExercise, workoutExercises } = useWorkoutStore();
  
  // Check if exercise is already in workout
  const isInWorkout = workoutExercises.some(we => we.exercise.id === exercise.id);

  const handleAddToWorkout = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInWorkout) {
      // If already in workout, don't add again
      return;
    }
    
    addExercise(exercise);
    
    // Call original handler if provided
    onAddToWorkout?.();
  };

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


  return (
    <div className={styles.exerciseCard} onClick={onClick}>
      <div className={styles.header}>
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
            className={`${styles.addButton} ${isInWorkout ? styles.added : ''}`}
            onClick={handleAddToWorkout}
            title={isInWorkout ? "Already in workout" : "Add to workout"}
            disabled={isInWorkout}
          >
            {isInWorkout ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;