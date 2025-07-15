import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import YesCoachBodyMap, { MuscleInfo } from './components/BodyMap';
import { searchMuscles } from './components/BodyMap/MuscleData';
import { ExerciseList } from './components/ExerciseList';
import WorkoutBuilder from './components/WorkoutBuilder/WorkoutBuilder';
import { useWorkoutStore } from './stores/workoutStore';
import { SimpleExercise } from './types/SimpleExerciseTypes';
import { CalendarPage } from './components/Calendar/CalendarPage';
import { AccountPage } from './components/Account/AccountPage';
import { BottomNavigation } from './components/Navigation/BottomNavigation';

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

// Header content interface
interface HeaderContent {
  title: string;
  hint: string;
  stats?: string;
}

// Header component with contextual hints
const AppHeader: React.FC = () => {
  const location = useLocation();
  const { workoutExercises } = useWorkoutStore();
  
  const getHeaderContent = useCallback((): HeaderContent => {
    const pathname = location.pathname;
    
    // Browse Tab (Body Map and Exercises)
    if (pathname === '/') {
      return {
        title: 'Browse Exercises',
        hint: 'Click on any muscle to see exercises'
      };
    }
    
    if (pathname.startsWith('/exercises/')) {
      const muscleName = pathname.split('/')[2];
      const capitalizedMuscle = muscleName.charAt(0).toUpperCase() + muscleName.slice(1);
      return {
        title: `${capitalizedMuscle} Exercises`,
        hint: 'Tap any exercise to add to your workout'
      };
    }
    
    // Plan Tab (Workout Builder)
    if (pathname === '/workout') {
      if (workoutExercises.length === 0) {
        return {
          title: 'Plan Workout',
          hint: 'Add exercises to get started'
        };
      }
      return {
        title: 'Plan Workout',
        hint: 'Build your perfect workout routine',
        stats: `${workoutExercises.length} exercise${workoutExercises.length !== 1 ? 's' : ''} added`
      };
    }
    
    // Track Tab (Calendar)
    if (pathname === '/calendar') {
      return {
        title: 'Track Progress',
        hint: 'View your workout history'
      };
    }
    
    // Account Tab
    if (pathname === '/account') {
      return {
        title: 'Account',
        hint: 'Manage your preferences'
      };
    }
    
    // Default
    return {
      title: 'YesCoach',
      hint: 'Your personal fitness companion'
    };
  }, [location.pathname, workoutExercises.length]);

  const headerContent = getHeaderContent();

  return (
    <header style={{ 
      background: '#2c3e50', 
      color: 'white', 
      padding: '1rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          {headerContent.title}
        </h1>
        {headerContent.stats && (
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#e74c3c', 
            fontWeight: '600',
            background: 'rgba(231, 76, 60, 0.1)',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px'
          }}>
            {headerContent.stats}
          </span>
        )}
      </div>
      <p style={{ 
        margin: 0, 
        fontSize: '0.875rem', 
        color: '#bdc3c7',
        opacity: 0.9
      }}>
        {headerContent.hint}
      </p>
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
      <main style={{ flex: 1, display: 'flex', minHeight: 0 }} className="main-content-with-nav">
        <NavigationErrorBoundary>
          <Routes key={location.pathname}>
            <Route path="/" element={<BodyMapPage key="body-map" />} />
            <Route path="/exercises/:muscleName" element={<ExercisesPage key={location.pathname} />} />
            <Route path="/workout" element={<WorkoutBuilder key="workout-builder" />} />
            <Route path="/calendar" element={<CalendarPage key="calendar" />} />
            <Route path="/account" element={<AccountPage key="account" />} />
          </Routes>
        </NavigationErrorBoundary>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
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