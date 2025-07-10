import React from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import WorkoutExerciseCard from './WorkoutExerciseCard';
import styles from './WorkoutBuilder.module.css';

const WorkoutBuilder: React.FC = () => {
  const { 
    workoutExercises, 
    clearWorkout,
    submitWorkout 
  } = useWorkoutStore();

  const handleSubmitWorkout = () => {
    const totalCompletedSets = workoutExercises.reduce(
      (total, we) => total + we.sets.filter(s => s.completed).length, 
      0
    );
    
    if (totalCompletedSets === 0) {
      alert('Log some sets before submitting your workout!');
      return;
    }
    
    if (window.confirm(`Submit workout with ${totalCompletedSets} completed sets?`)) {
      submitWorkout();
    }
  };

  const handleClearWorkout = () => {
    if (window.confirm('Clear all exercises from workout?')) {
      clearWorkout();
    }
  };

  // Calculate workout stats
  const totalSets = workoutExercises.reduce((total, we) => total + we.sets.length, 0);
  const completedSets = workoutExercises.reduce((total, we) => total + we.sets.filter(s => s.completed).length, 0);

  return (
    <div className={styles.workoutBuilder}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Workout Builder</h2>
        <div className={styles.headerActions}>
          {workoutExercises.length > 0 && (
            <>
              <div className={styles.workoutStats}>
                <span>Sets: {completedSets}/{totalSets}</span>
              </div>
              <button 
                className={styles.clearButton}
                onClick={handleClearWorkout}
              >
                Clear All
              </button>
              {completedSets > 0 && (
                <button 
                  className={styles.submitButton}
                  onClick={handleSubmitWorkout}
                >
                  Submit Workout
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className={styles.exerciseList}>
        {workoutExercises.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💪</div>
            <h3>No exercises added yet</h3>
            <p>Browse muscles and add exercises using the "+" button</p>
          </div>
        ) : (
          <>
            <div className={styles.listHeader}>
              <span className={styles.exerciseCount}>
                {workoutExercises.length} exercise{workoutExercises.length !== 1 ? 's' : ''}
              </span>
              <span className={styles.reorderHint}>
                Hold and drag to reorder
              </span>
            </div>
            
            {workoutExercises
              .sort((a, b) => a.order - b.order)
              .map((workoutExercise, index) => (
                <WorkoutExerciseCard
                  key={workoutExercise.id}
                  workoutExercise={workoutExercise}
                  index={index}
                />
              ))
            }
          </>
        )}
      </div>

      {/* Footer Actions */}
      {workoutExercises.length > 0 && completedSets > 0 && (
        <div className={styles.footer}>
          <button 
            className={styles.submitButtonLarge}
            onClick={handleSubmitWorkout}
          >
            Submit Workout ({completedSets} sets)
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;