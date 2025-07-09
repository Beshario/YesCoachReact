import React, { useState } from 'react';
import YesCoachBodyMap, { MuscleInfo } from './components/BodyMap';
import { ExerciseList } from './components/ExerciseList';
import { SimpleExercise } from './types/SimpleExerciseTypes';

function App(): React.JSX.Element {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleInfo | undefined>();
  const [showExercises, setShowExercises] = useState(false);

  const handleMuscleSelected = (muscle: MuscleInfo): void => {
    console.log('Selected muscle:', muscle);
    setSelectedMuscle(muscle);
    setShowExercises(true);
  };

  const handleExerciseSelect = (exercise: SimpleExercise): void => {
    console.log('Selected exercise:', exercise);
    // TODO: Navigate to exercise detail view
  };

  const handleAddToWorkout = (exercise: SimpleExercise): void => {
    console.log('Added to workout:', exercise);
    // TODO: Add to workout plan
  };

  const handleBackToBodyMap = (): void => {
    setShowExercises(false);
    setSelectedMuscle(undefined);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: '#2c3e50', 
        color: 'white', 
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>YesCoach</h1>
        {showExercises && (
          <button 
            onClick={handleBackToBodyMap}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Body Map
          </button>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {!showExercises ? (
          <YesCoachBodyMap onMuscleSelected={handleMuscleSelected} />
        ) : (
          <ExerciseList
            selectedMuscle={selectedMuscle}
            onExerciseSelect={handleExerciseSelect}
            onAddToWorkout={handleAddToWorkout}
          />
        )}
      </main>
    </div>
  );
}

export default App;