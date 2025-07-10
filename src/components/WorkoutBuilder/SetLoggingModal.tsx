import React, { useState } from 'react';
import { useWorkoutStore, WorkoutExercise } from '../../stores/workoutStore';
import styles from './SetLoggingModal.module.css';

interface SetLoggingModalProps {
  workoutExercise: WorkoutExercise;
  onClose: () => void;
}

const SetLoggingModal: React.FC<SetLoggingModalProps> = ({ 
  workoutExercise, 
  onClose 
}) => {
  const { addSet, completeSet, deleteSet } = useWorkoutStore();
  const [newSetReps, setNewSetReps] = useState('');
  const [newSetWeight, setNewSetWeight] = useState('');
  const [newSetTime, setNewSetTime] = useState('');

  // Auto-populate with previous set values when modal opens
  React.useEffect(() => {
    const { sets } = workoutExercise;
    if (sets.length > 0) {
      const lastSet = sets[sets.length - 1];
      if (lastSet.reps) {
        setNewSetReps(lastSet.reps.toString());
      }
      if (lastSet.weight) {
        setNewSetWeight(lastSet.weight.toString());
      }
      if (lastSet.time) {
        setNewSetTime(lastSet.time.toString());
      }
    }
  }, [workoutExercise]);

  const { exercise, sets } = workoutExercise;

  const handleAddSet = () => {
    const reps = parseInt(newSetReps);
    const weight = newSetWeight ? parseFloat(newSetWeight) : undefined;
    const time = newSetTime ? parseInt(newSetTime) : undefined;

    if (!reps && !time) {
      alert('Please enter either reps or time');
      return;
    }

    addSet(exercise.id, {
      reps: reps || 0,
      weight,
      time
    });

    // Clear inputs
    setNewSetReps('');
    setNewSetWeight('');
    setNewSetTime('');
  };

  const handleCompleteSet = (setId: string) => {
    completeSet(exercise.id, setId);
  };

  const handleDeleteSet = (setId: string) => {
    if (window.confirm('Delete this set?')) {
      deleteSet(exercise.id, setId);
    }
  };

  const isCardioExercise = exercise.category.toLowerCase().includes('cardio') || 
                          exercise.tags.some(tag => tag.toLowerCase().includes('cardio'));

  const completedSets = sets.filter(s => s.completed).length;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2>{exercise.name}</h2>
            <div className={styles.exerciseMeta}>
              <span className={styles.category}>{exercise.category}</span>
              <span className={`${styles.difficulty} ${styles[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          <span>Sets completed: {completedSets}/{sets.length}</span>
        </div>

        {/* Sets Table */}
        <div className={styles.setsTable}>
          <table>
            <thead>
              <tr>
                <th>Set</th>
                {!isCardioExercise ? (
                  <>
                    <th>Reps</th>
                    <th>Weight (kg)</th>
                  </>
                ) : (
                  <th>Time</th>
                )}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set, index) => (
                <tr key={set.id} className={set.completed ? styles.completedRow : ''}>
                  <td>{index + 1}</td>
                  {!isCardioExercise ? (
                    <>
                      <td>{set.reps}</td>
                      <td>{set.weight || '-'}</td>
                    </>
                  ) : (
                    <td>
                      {set.time ? 
                        `${Math.floor(set.time / 60)}:${(set.time % 60).toString().padStart(2, '0')}` 
                        : '-'
                      }
                    </td>
                  )}
                  <td>
                    <span className={`${styles.status} ${set.completed ? styles.completed : styles.pending}`}>
                      {set.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {!set.completed && (
                        <button 
                          className={styles.completeButton}
                          onClick={() => handleCompleteSet(set.id)}
                          title="Mark as completed"
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteSet(set.id)}
                        title="Delete set"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Set Form */}
        <div className={styles.addSetForm}>
          <h3>Add New Set</h3>
          <div className={styles.formInputs}>
            {!isCardioExercise ? (
              <>
                <div className={styles.inputGroup}>
                  <label>Reps</label>
                  <input
                    type="number"
                    value={newSetReps}
                    onChange={(e) => setNewSetReps(e.target.value)}
                    placeholder="12"
                    min="1"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={newSetWeight}
                    onChange={(e) => setNewSetWeight(e.target.value)}
                    placeholder="Optional"
                    step="0.5"
                    min="0"
                  />
                </div>
              </>
            ) : (
              <div className={styles.inputGroup}>
                <label>Time (seconds)</label>
                <input
                  type="number"
                  value={newSetTime}
                  onChange={(e) => setNewSetTime(e.target.value)}
                  placeholder="60"
                  min="1"
                />
              </div>
            )}
            <button 
              className={styles.addButton}
              onClick={handleAddSet}
              disabled={(!newSetReps && !newSetTime)}
            >
              Add Set
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.doneButton} onClick={onClose}>
            Done ({completedSets} sets completed)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetLoggingModal;