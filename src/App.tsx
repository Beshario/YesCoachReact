import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import YesCoachBodyMap, { MuscleInfo } from './components/BodyMap';
import { searchMuscles } from './components/BodyMap/MuscleData';
import { ExerciseList } from './components/ExerciseList';
import WorkoutBuilder from './components/WorkoutBuilder/WorkoutBuilder';
import { useWorkoutStore } from './stores/workoutStore';
import { SimpleExercise } from './types/SimpleExerciseTypes';
import { CalendarPage } from './components/Calendar/CalendarPage';

// Error Boundary Component for Navigation
class NavigationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#e74c3c',
          background: '#f8f9fa',
          borderRadius: '8px',
          margin: '2rem'
        }}>
          <h2>Navigation Error</h2>
          <p>Something went wrong while navigating. Please try again.</p>
          <button 
            onClick={() => { 
              this.setState({ hasError: false }); 
              window.location.href = '/'; 
            }}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component for handling muscle exercises with URL params
const ExercisesPage: React.FC = () => {
  const { muscleName } = useParams<{ muscleName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
        } else {
          // Invalid muscle name - redirect to home
          navigate('/');
        }
      }
    }
  }, [muscleName, navigate]);

  const handleExerciseSelect = useCallback((exercise: SimpleExercise): void => {
    console.log('Selected exercise:', exercise);
    // Could navigate to exercise detail page in the future
    // navigate(`/exercises/${muscleName}/exercise/${exercise.id}`);
  }, []);

  const handleAddToWorkout = useCallback((exercise: SimpleExercise): void => {
    console.log('Added to workout:', exercise);
    // Could navigate to workout with pre-selected exercise
    // navigate('/workout', { state: { preselectedExercise: exercise } });
  }, []);

  return (
    <ExerciseList
      key={`${location.pathname}-${muscleName}`}
      selectedMuscle={selectedMuscle}
      onExerciseSelect={handleExerciseSelect}
      onAddToWorkout={handleAddToWorkout}
    />
  );
};

// Component for body map with navigation
const BodyMapPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleMuscleSelected = useCallback((muscle: MuscleInfo): void => {
    console.log('Selected muscle:', muscle);
    navigate(`/exercises/${muscle.name.toLowerCase()}`);
  }, [navigate]);

  return (
    <YesCoachBodyMap 
      key={location.pathname} 
      onMuscleSelected={handleMuscleSelected} 
    />
  );
};

// Header component with navigation
const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workoutExercises } = useWorkoutStore();
  
  const getViewTitle = useCallback((): string => {
    if (location.pathname === '/') return 'YesCoach';
    if (location.pathname === '/workout') return 'Workout Builder';
    if (location.pathname === '/calendar') return 'Workout Calendar';
    if (location.pathname.startsWith('/exercises/')) {
      const muscleName = location.pathname.split('/')[2];
      return `${muscleName.charAt(0).toUpperCase() + muscleName.slice(1)} Exercises`;
    }
    return 'YesCoach';
  }, [location.pathname]);

  const navigateToCalendar = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  const navigateToWorkout = useCallback(() => {
    navigate('/workout');
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

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
        {/* Calendar button */}
        <button 
          onClick={navigateToCalendar}
          style={{
            background: location.pathname === '/calendar' ? '#e74c3c' : '#9b59b6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: location.pathname === '/calendar' ? 'bold' : 'normal'
          }}
        >
          📅 Calendar
        </button>
        
        {/* Always show Workout button */}
        <button 
          onClick={navigateToWorkout}
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
            onClick={navigateToHome}
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
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [previousPath, setPreviousPath] = useState<string>('');

  // Track navigation state changes
  useEffect(() => {
    if (previousPath && previousPath !== location.pathname) {
      setIsNavigating(true);
      console.log(`Navigation: ${previousPath} → ${location.pathname}`);
      
      // Reset navigation state after a short delay
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    setPreviousPath(location.pathname);
  }, [location.pathname, previousPath]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      
      {/* Navigation Loading Indicator */}
      {isNavigating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #e74c3c, #f39c12)',
          zIndex: 1000,
          animation: 'pulse 0.5s ease-in-out infinite'
        }} />
      )}
      
      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <NavigationErrorBoundary>
          <Routes key={location.pathname}>
            <Route path="/" element={<BodyMapPage key="body-map" />} />
            <Route path="/exercises/:muscleName" element={<ExercisesPage key={location.pathname} />} />
            <Route path="/workout" element={<WorkoutBuilder key="workout-builder" />} />
            <Route path="/calendar" element={<CalendarPage key="calendar" />} />
          </Routes>
        </NavigationErrorBoundary>
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