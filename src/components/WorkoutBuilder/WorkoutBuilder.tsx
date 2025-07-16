import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../stores/workoutStore';
import WorkoutExerciseCard from './WorkoutExerciseCard';
import styles from './WorkoutBuilder.module.css';

const WorkoutBuilder: React.FC = () => {
  const { date: dateParam, sessionId } = useParams<{ date?: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { 
    workoutExercises, 
    selectedDate,
    sessionName,
    clearWorkout,
    submitWorkout,
    setWorkoutDate,
    setSessionId,
    setSessionName
  } = useWorkoutStore();

  // Initialize workout context from URL parameters
  useEffect(() => {
    if (dateParam) {
      const date = new Date(dateParam);
      setWorkoutDate(date);
    }
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [dateParam, sessionId, setWorkoutDate, setSessionId]);

  const totalCompletedSets = workoutExercises.reduce(
    (total, we) => total + we.sets.filter(s => s.completed).length, 
    0
  );

  const handleSubmitWorkout = async () => {
    if (totalCompletedSets === 0) return;
    
    const sessionText = sessionName || 'workout session';
    if (window.confirm(`Submit ${sessionText}? (${totalCompletedSets} sets)`)) {
      await submitWorkout();
      
      // Navigate back to day view or calendar after submission
      if (dateParam) {
        navigate(`/calendar/${dateParam}`);
      } else {
        navigate('/calendar');
      }
    }
  };

  const handleClearWorkout = () => {
    if (window.confirm('Clear all exercises from workout?')) {
      clearWorkout();
    }
  };

  // Calculate workout stats
  const totalSets = workoutExercises.reduce((total, we) => total + we.sets.length, 0);

  // Format date for display
  const formatDateForHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  return (
    <div className={styles.workoutBuilder}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          {selectedDate ? (
            <>
              <h2>Building workout for {formatDateForHeader(selectedDate)}</h2>
              {sessionId && <p className={styles.sessionInfo}>Editing session</p>}
            </>
          ) : (
            <h2>Workout Builder</h2>
          )}
        </div>
        <div className={styles.headerActions}>
          {workoutExercises.length > 0 && (
            <>
              <div className={styles.workoutStats}>
                <span>Sets: {totalCompletedSets}/{totalSets}</span>
              </div>
              <button 
                className={styles.clearButton}
                onClick={handleClearWorkout}
              >
                Clear All
              </button>
              {totalCompletedSets > 0 && (
                <button 
                  className={styles.submitButton}
                  onClick={handleSubmitWorkout}
                  disabled={totalCompletedSets === 0}
                  title={totalCompletedSets === 0 ? 'Complete some sets first' : `Submit ${totalCompletedSets} sets`}
                >
                  Submit Workout
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Session Name Input */}
      {workoutExercises.length > 0 && (
        <div className={styles.sessionNameSection}>
          <input
            type="text"
            placeholder="Session name (optional)"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className={styles.sessionNameInput}
          />
        </div>
      )}

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
      {workoutExercises.length > 0 && totalCompletedSets > 0 && (
        <div className={styles.footer}>
          <button 
            className={styles.submitButtonLarge}
            onClick={handleSubmitWorkout}
            disabled={totalCompletedSets === 0}
            title={totalCompletedSets === 0 ? 'Complete some sets first' : `Submit ${totalCompletedSets} sets`}
          >
            Submit Workout ({totalCompletedSets} sets)
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;