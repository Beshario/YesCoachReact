import React, { useState } from 'react';
import { useWorkoutStore, WorkoutExercise, WorkoutSet } from '../../stores/workoutStore';
import styles from './SetLoggingModal.module.css';

interface SetLoggingModalProps {
  workoutExercise: WorkoutExercise;
  onClose: () => void;
}

const SetLoggingModal: React.FC<SetLoggingModalProps> = ({ 
  workoutExercise, 
  onClose 
}) => {
  const { addSet, updateSet, completeSet, deleteSet } = useWorkoutStore();
  const [newSetReps, setNewSetReps] = useState('');
  const [newSetWeight, setNewSetWeight] = useState('');
  const [newSetTime, setNewSetTime] = useState('');
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

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

  const clearForm = () => {
    // If we have previous sets, populate with last set values
    if (sets.length > 0 && !editingSetId) {
      const lastSet = sets[sets.length - 1];
      setNewSetReps(lastSet.reps?.toString() || '');
      setNewSetWeight(lastSet.weight?.toString() || '');
      setNewSetTime(lastSet.time?.toString() || '');
    } else {
      setNewSetReps('');
      setNewSetWeight('');
      setNewSetTime('');
    }
  };

  const handleRowClick = (set: WorkoutSet) => {
    if (editingSetId === set.id) {
      // Clicking same row - cancel edit
      setEditingSetId(null);
      clearForm();
    } else {
      // Clicking different row - switch to editing that row
      setEditingSetId(set.id);
      setNewSetReps(set.reps?.toString() || '');
      setNewSetWeight(set.weight?.toString() || '');
      setNewSetTime(set.time?.toString() || '');
    }
  };

  const handleAddOrUpdateSet = () => {
    const reps = parseInt(newSetReps);
    const weight = newSetWeight ? parseFloat(newSetWeight) : undefined;
    const time = newSetTime ? parseInt(newSetTime) : undefined;

    if (!reps && !time) {
      alert('Please enter either reps or time');
      return;
    }

    if (editingSetId) {
      // Update existing set
      updateSet(exercise.id, editingSetId, {
        reps: reps || 0,
        weight,
        time,
        completed: true
      });
      setEditingSetId(null);
    } else {
      // Add new set
      addSet(exercise.id, {
        reps: reps || 0,
        weight,
        time
      });
    }

    // Clear form after add/update
    clearForm();
  };

  const handleCompleteSet = (setId: string) => {
    completeSet(exercise.id, setId);
  };

  const handleDeleteSet = (setId: string) => {
    deleteSet(exercise.id, setId);
    // Clear editing state if we're deleting the set being edited
    if (editingSetId === setId) {
      setEditingSetId(null);
      clearForm();
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
                <tr 
                  key={set.id} 
                  className={`${set.completed ? styles.completedRow : ''} ${editingSetId === set.id ? styles.editingRow : ''}`}
                  onClick={() => handleRowClick(set)}
                  style={{ cursor: 'pointer' }}
                >
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteSet(set.id);
                          }}
                          title="Mark as completed"
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSet(set.id);
                        }}
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
          <h3>{editingSetId ? 'Edit Set' : 'Add New Set'}</h3>
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
              onClick={handleAddOrUpdateSet}
              disabled={(!newSetReps && !newSetTime)}
            >
              {editingSetId ? 'Update Set' : 'Add Set'}
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