import React, { useState } from 'react';
import { useWorkoutStore, WorkoutExercise } from '../../stores/workoutStore';
import ExerciseReplacementModal from './ExerciseReplacementModal';
import SetLoggingModal from './SetLoggingModal';
import styles from './WorkoutExerciseCard.module.css';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
  index: number;
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({ 
  workoutExercise, 
  index 
}) => {
  const { removeExercise } = useWorkoutStore();
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showSetLoggingModal, setShowSetLoggingModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const { exercise } = workoutExercise;

  const handleRemove = () => {
    if (window.confirm(`Remove ${exercise.name} from workout?`)) {
      removeExercise(exercise.id);
    }
  };

  const handleReplace = () => {
    setShowReplaceModal(true);
  };

  const handleLogSets = () => {
    setShowSetLoggingModal(true);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = index;
    
    if (fromIndex !== toIndex) {
      useWorkoutStore.getState().reorderExercises(fromIndex, toIndex);
    }
  };

  // Format equipment list
  const formatEquipment = (equipment: string[]) => {
    if (equipment.length === 0) return 'Bodyweight';
    if (equipment.length === 1) return equipment[0];
    if (equipment.length === 2) return equipment.join(' + ');
    return `${equipment[0]} + ${equipment.length - 1} more`;
  };

  const completedSets = workoutExercise.sets.filter(s => s.completed).length;
  const totalSets = workoutExercise.sets.length;

  return (
    <>
      <div 
        className={`${styles.exerciseCard} ${isDragging ? styles.dragging : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag Handle */}
        <div className={styles.dragHandle}>
          <span className={styles.exerciseNumber}>{index + 1}</span>
          <div className={styles.dragIcon}>⋮⋮</div>
        </div>

        {/* Exercise Info */}
        <div className={styles.exerciseInfo}>
          <h3 className={styles.exerciseName}>{exercise.name}</h3>
          <div className={styles.metadata}>
            <span className={styles.category}>{exercise.category}</span>
            <span className={styles.equipment}>
              {formatEquipment(exercise.equipment)}
            </span>
            <span className={`${styles.difficulty} ${styles[exercise.difficulty]}`}>
              {exercise.difficulty}
            </span>
          </div>
          
          {/* Sets summary */}
          {totalSets > 0 && (
            <div className={styles.setSummary}>
              Sets: {completedSets}/{totalSets}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            className={styles.logSetsButton}
            onClick={handleLogSets}
            title="Log sets for this exercise"
          >
            {totalSets > 0 ? `${completedSets}/${totalSets}` : 'Log Sets'}
          </button>
          <button 
            className={styles.replaceButton}
            onClick={handleReplace}
            title="Replace exercise"
          >
            ↔
          </button>
          <button 
            className={styles.removeButton}
            onClick={handleRemove}
            title="Remove exercise"
          >
            ×
          </button>
        </div>
      </div>

      {/* Replacement Modal */}
      {showReplaceModal && (
        <ExerciseReplacementModal
          currentExercise={exercise}
          onReplace={(newExercise) => {
            useWorkoutStore.getState().replaceExercise(exercise.id, newExercise);
            setShowReplaceModal(false);
          }}
          onClose={() => setShowReplaceModal(false)}
        />
      )}

      {/* Set Logging Modal */}
      {showSetLoggingModal && (
        <SetLoggingModal
          workoutExercise={workoutExercise}
          onClose={() => setShowSetLoggingModal(false)}
        />
      )}
    </>
  );
};

export default WorkoutExerciseCard;