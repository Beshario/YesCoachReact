import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Workout } from '../../types/models';
import { SimpleExercise } from '../../types/SimpleExerciseTypes';
import { db as database } from '../../services/database';
import { BodyMapViewer, MuscleDisplayState } from '../BodyMap';
import styles from './WorkoutDetail.module.css';

interface WorkoutDetailProps {
  workout: Workout;
  date: Date;
  onClose: () => void;
}

export const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ workout, date, onClose }) => {
  const [exercises, setExercises] = useState<Map<string, SimpleExercise>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load exercise details
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const exerciseMap = new Map<string, SimpleExercise>();
        
        // Load unique exercises
        const uniqueExerciseIds = Array.from(new Set(workout.exercises.map(e => e.exerciseId)));
        
        for (const id of uniqueExerciseIds) {
          const exercise = await database.getExercise(id);
          if (exercise) {
            exerciseMap.set(id, exercise);
          }
        }
        
        setExercises(exerciseMap);
      } catch (error) {
        console.error('Failed to load exercise details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [workout]);

  // Calculate muscle states from workout
  const muscleStates = useMemo(() => {
    const states = new Map<number, MuscleDisplayState>();
    
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
    
    return states;
  }, [exercises, workout]);

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Calculate total volume
  const totalVolume = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + (set.reps * (set.weight || 0));
    }, 0);
  }, 0);

  const totalSets = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length;
  }, 0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <h2>Workout Details</h2>
        </div>

        {/* Date and summary */}
        <div className={styles.workoutSummary}>
          <div className={styles.dateRow}>
            <span className={styles.date}>{formatDate(date)}</span>
          </div>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{workout.exercises.length}</span>
              <span className={styles.statLabel}>Exercises</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalSets}</span>
              <span className={styles.statLabel}>Total Sets</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalVolume.toLocaleString()}</span>
              <span className={styles.statLabel}>Volume (kg)</span>
            </div>
          </div>
        </div>

        {/* Body map */}
        <div className={styles.bodyMapSection}>
          <h3>Muscles Worked</h3>
          <div className={styles.bodyMapContainer}>
            <BodyMapViewer
              muscleStates={muscleStates}
              displayMode="custom"
              interactive={false}
              size="small"
              viewMode="side-by-side"
              showControls={false}
              showLabels={true}
            />
          </div>
        </div>

        {/* Exercise list */}
        <div className={styles.exerciseList}>
          <h3>Exercises Performed</h3>
          {loading ? (
            <div className={styles.loading}>Loading exercises...</div>
          ) : (
            workout.exercises.map((exercise, index) => {
              const exerciseInfo = exercises.get(exercise.exerciseId);
              return (
                <div key={index} className={styles.exerciseItem}>
                  <h4>{exerciseInfo?.name || 'Unknown Exercise'}</h4>
                  <div className={styles.setsContainer}>
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className={styles.setItem}>
                        <span className={styles.setNumber}>Set {setIndex + 1}</span>
                        <span className={styles.setDetails}>
                          {set.reps} reps
                          {set.weight && ` × ${set.weight}kg`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {workout.notes && (
          <div className={styles.notesSection}>
            <h3>Notes</h3>
            <p>{workout.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};