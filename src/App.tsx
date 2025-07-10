import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import YesCoachBodyMap, { MuscleInfo } from './components/BodyMap';
import { searchMuscles } from './components/BodyMap/MuscleData';
import { ExerciseList } from './components/ExerciseList';
import WorkoutBuilder from './components/WorkoutBuilder/WorkoutBuilder';
import { useWorkoutStore } from './stores/workoutStore';
import { SimpleExercise } from './types/SimpleExerciseTypes';

// Component for handling muscle exercises with URL params
const ExercisesPage: React.FC = () => {
  const { muscleName } = useParams<{ muscleName: string }>();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleInfo | undefined>();
  
  // Find muscle info based on URL param
  React.useEffect(() => {
    if (muscleName) {
      // Search for the actual muscle in the database
      const foundMuscles = searchMuscles(muscleName);
      if (foundMuscles.length > 0) {
        // Use the first matching muscle
        setSelectedMuscle(foundMuscles[0]);
      } else {
        // Fallback: try searching by category
        const categoryMuscles = searchMuscles(muscleName.charAt(0).toUpperCase() + muscleName.slice(1));
        if (categoryMuscles.length > 0) {
          setSelectedMuscle(categoryMuscles[0]);
        }
      }
    }
  }, [muscleName]);

  const handleExerciseSelect = (exercise: SimpleExercise): void => {
    console.log('Selected exercise:', exercise);
  };

  const handleAddToWorkout = (exercise: SimpleExercise): void => {
    console.log('Added to workout:', exercise);
  };

  return (
    <ExerciseList
      selectedMuscle={selectedMuscle}
      onExerciseSelect={handleExerciseSelect}
      onAddToWorkout={handleAddToWorkout}
    />
  );
};

// Component for body map with navigation
const BodyMapPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleMuscleSelected = (muscle: MuscleInfo): void => {
    console.log('Selected muscle:', muscle);
    navigate(`/exercises/${muscle.name.toLowerCase()}`);
  };

  return <YesCoachBodyMap onMuscleSelected={handleMuscleSelected} />;
};

// Header component with navigation
const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workoutExercises } = useWorkoutStore();
  
  const getViewTitle = (): string => {
    if (location.pathname === '/') return 'YesCoach';
    if (location.pathname === '/workout') return 'Workout Builder';
    if (location.pathname.startsWith('/exercises/')) {
      const muscleName = location.pathname.split('/')[2];
      return `${muscleName.charAt(0).toUpperCase() + muscleName.slice(1)} Exercises`;
    }
    return 'YesCoach';
  };

  return (
    <header style={{ 
      background: '#2c3e50', 
      color: 'white', 
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{getViewTitle()}</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Always show Workout button */}
        <button 
          onClick={() => navigate('/workout')}
          style={{
            background: location.pathname === '/workout' ? '#e74c3c' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: location.pathname === '/workout' ? 'bold' : 'normal'
          }}
        >
          Workout {workoutExercises.length > 0 ? `(${workoutExercises.length})` : ''}
        </button>
        
        {location.pathname !== '/' && (
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Body Map
          </button>
        )}
      </div>
    </header>
  );
};

// Main App component
function AppContent(): React.JSX.Element {

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      
      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<BodyMapPage />} />
          <Route path="/exercises/:muscleName" element={<ExercisesPage />} />
          <Route path="/workout" element={<WorkoutBuilder />} />
        </Routes>
      </main>
    </div>
  );
}

// Root App component with Router
function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;