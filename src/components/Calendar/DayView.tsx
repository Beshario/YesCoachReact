import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Workout } from '../../types/models';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { db as database } from '../../services/database';
import { BodyMapViewer, MuscleDisplayState } from '../BodyMap';
import { useWorkoutStore } from '../../stores/workoutStore';
import styles from './DayView.module.css';

export const DayView: React.FC = () => {
  const { date: dateParam } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { setWorkoutDate, setSessionId, loadWorkoutSession } = useWorkoutStore();
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Map<string, SimpleExercise>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Parse date from URL parameter
  useEffect(() => {
    if (dateParam) {
      const date = new Date(dateParam);
      setSelectedDate(date);
      setWorkoutDate(date);
    }
  }, [dateParam, setWorkoutDate]);

  // Load workouts for the selected date
  useEffect(() => {
    const loadWorkouts = async () => {
      if (!selectedDate) return;
      
      try {
        setLoading(true);
        const dateWorkouts = await database.getWorkoutsForDate(selectedDate);
        setWorkouts(dateWorkouts);
        
        // Load exercise details for all workouts
        const exerciseMap = new Map<string, SimpleExercise>();
        const uniqueExerciseIds = Array.from(new Set(
          dateWorkouts.flatMap(workout => workout.exercises.map(e => e.exerciseId))
        ));
        
        for (const id of uniqueExerciseIds) {
          const exercise = await database.getExercise(id);
          if (exercise) {
            exerciseMap.set(id, exercise);
          }
        }
        
        setExercises(exerciseMap);
      } catch (error) {
        console.error('Failed to load workouts for date:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [selectedDate]);

  // Calculate combined muscle states from all workouts
  const combinedMuscleStates = useMemo(() => {
    const states = new Map<number, MuscleDisplayState>();
    
    workouts.forEach(workout => {
      workout.exercises.forEach(({ exerciseId }) => {
        const exercise = exercises.get(exerciseId);
        if (!exercise) return;
        
        // Primary muscles
        (exercise.primaryMuscles || []).forEach(muscleId => {
          states.set(muscleId, {
            color: '#dc2626',
            intensity: 0.8,
            label: 'Primary'
          });
        });
        
        // Secondary muscles
        (exercise.secondaryMuscles || []).forEach(muscleId => {
          // Don't override if already marked as primary
          if (!states.has(muscleId)) {
            states.set(muscleId, {
              color: '#f59e0b',
              intensity: 0.5,
              label: 'Secondary'
            });
          }
        });
      });
    });
    
    return states;
  }, [exercises, workouts]);

  // Format date for display
  const formatDate = (date: Date) => {
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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
  };

  const handleBackToCalendar = () => {
    navigate('/calendar');
  };

  const handleAddNewWorkout = () => {
    if (!selectedDate) return;
    setSessionId(null); // Clear session ID for new workout
    navigate(`/calendar/${dateParam}/workout`);
  };

  const handleEditWorkout = (workout: Workout) => {
    loadWorkoutSession(workout);
    navigate(`/calendar/${dateParam}/workout/${workout.id}`);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Delete this workout session?')) {
      // TODO: Implement delete workout in database
      console.log('Delete workout:', workoutId);
      // Reload workouts after deletion
      if (selectedDate) {
        const dateWorkouts = await database.getWorkoutsForDate(selectedDate);
        setWorkouts(dateWorkouts);
      }
    }
  };

  if (!selectedDate) {
    return <div>Invalid date</div>;
  }

  return (
    <div className={styles.dayView}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBackToCalendar}
        >
          ← Calendar
        </button>
        <h1>{formatDate(selectedDate)}</h1>
        <div className={styles.spacer}></div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading workouts...</div>
      ) : (
        <>
          {/* Workout Sessions */}
          <div className={styles.workoutSessions}>
            {workouts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <h3>No workouts planned</h3>
                <p>Add your first workout session for this day</p>
              </div>
            ) : (
              workouts.map((workout, index) => (
                <div key={workout.id} className={styles.workoutCard}>
                  <div className={styles.workoutHeader}>
                    <h3>
                      {workout.sessionName || `Session ${index + 1}`}
                    </h3>
                    <div className={styles.workoutActions}>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditWorkout(workout)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteWorkout(workout.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.workoutStats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{workout.exercises.length}</span>
                      <span className={styles.statLabel}>Exercises</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
                      </span>
                      <span className={styles.statLabel}>Sets</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {workout.exercises.reduce((total, ex) => 
                          total + ex.sets.reduce((setTotal, set) => 
                            setTotal + (set.reps * (set.weight || 0)), 0), 0
                        ).toLocaleString()}
                      </span>
                      <span className={styles.statLabel}>Volume (kg)</span>
                    </div>
                  </div>

                  <div className={styles.exerciseList}>
                    {workout.exercises.map((exercise, exIndex) => {
                      const exerciseInfo = exercises.get(exercise.exerciseId);
                      return (
                        <div key={exIndex} className={styles.exerciseItem}>
                          <span className={styles.exerciseName}>
                            {exerciseInfo?.name || 'Unknown Exercise'}
                          </span>
                          <span className={styles.exerciseSets}>
                            {exercise.sets.length} sets
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Workout Button */}
          <div className={styles.addWorkoutSection}>
            <button 
              className={styles.addWorkoutButton}
              onClick={handleAddNewWorkout}
            >
              + Add New Workout
            </button>
          </div>

          {/* Combined Body Map */}
          {workouts.length > 0 && (
            <div className={styles.bodyMapSection}>
              <h3>Muscles Worked Today</h3>
              <div className={styles.bodyMapContainer}>
                <BodyMapViewer
                  muscleStates={combinedMuscleStates}
                  displayMode="custom"
                  interactive={false}
                  size="small"
                  viewMode="side-by-side"
                  showControls={false}
                  showLabels={true}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};