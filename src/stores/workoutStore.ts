import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SimpleExercise } from '../types/SimpleExerciseTypes';

// Types for workout management
export interface WorkoutSet {
  id: string;
  reps: number;
  weight?: number;
  time?: number; // For cardio exercises in seconds
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: SimpleExercise;
  order: number;
  sets: WorkoutSet[];
}

interface WorkoutStore {
  // Workout State
  workoutExercises: WorkoutExercise[];
  
  // Actions
  addExercise: (exercise: SimpleExercise) => void;
  removeExercise: (exerciseId: string) => void;
  replaceExercise: (oldExerciseId: string, newExercise: SimpleExercise) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  clearWorkout: () => void;
  
  // Set Actions
  addSet: (exerciseId: string, set: Omit<WorkoutSet, 'id' | 'completed'>) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  
  // Workout Completion
  submitWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    workoutExercises: [],
    
    // Builder Actions
    addExercise: (exercise) => {
      const { workoutExercises } = get();
      const existingExercise = workoutExercises.find(we => we.exercise.id === exercise.id);
      
      if (existingExercise) {
        // Don't add duplicate exercises
        return;
      }
      
      const newWorkoutExercise: WorkoutExercise = {
        id: `workout-exercise-${Date.now()}-${Math.random()}`,
        exercise,
        order: workoutExercises.length,
        sets: []
      };
      
      set({
        workoutExercises: [...workoutExercises, newWorkoutExercise]
      });
    },
    
    removeExercise: (exerciseId) => {
      const { workoutExercises } = get();
      const filtered = workoutExercises.filter(we => we.exercise.id !== exerciseId);
      
      // Reorder remaining exercises
      const reordered = filtered.map((we, index) => ({
        ...we,
        order: index
      }));
      
      set({ workoutExercises: reordered });
    },
    
    replaceExercise: (oldExerciseId, newExercise) => {
      const { workoutExercises } = get();
      const updated = workoutExercises.map(we => 
        we.exercise.id === oldExerciseId 
          ? { ...we, exercise: newExercise }
          : we
      );
      
      set({ workoutExercises: updated });
    },
    
    reorderExercises: (fromIndex, toIndex) => {
      const { workoutExercises } = get();
      const items = [...workoutExercises];
      const [reorderedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, reorderedItem);
      
      // Update order values
      const reordered = items.map((item, index) => ({
        ...item,
        order: index
      }));
      
      set({ workoutExercises: reordered });
    },
    
    clearWorkout: () => {
      set({ workoutExercises: [] });
    },
    
    // Set Actions
    addSet: (exerciseId, setData) => {
      const { workoutExercises } = get();
      
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}-${Math.random()}`,
        ...setData,
        completed: false
      };
      
      const updatedExercises = workoutExercises.map(we =>
        we.exercise.id === exerciseId
          ? { ...we, sets: [...we.sets, newSet] }
          : we
      );
      
      set({ workoutExercises: updatedExercises });
    },
    
    completeSet: (exerciseId, setId) => {
      const { workoutExercises } = get();
      
      const updatedExercises = workoutExercises.map(we =>
        we.exercise.id === exerciseId
          ? {
              ...we,
              sets: we.sets.map(set =>
                set.id === setId ? { ...set, completed: true } : set
              )
            }
          : we
      );
      
      set({ workoutExercises: updatedExercises });
    },
    
    deleteSet: (exerciseId, setId) => {
      const { workoutExercises } = get();
      
      const updatedExercises = workoutExercises.map(we =>
        we.exercise.id === exerciseId
          ? { ...we, sets: we.sets.filter(set => set.id !== setId) }
          : we
      );
      
      set({ workoutExercises: updatedExercises });
    },
    
    // Workout Completion
    submitWorkout: () => {
      const { workoutExercises } = get();
      
      // Create workout summary
      const workoutSummary = {
        id: `workout-${Date.now()}`,
        exercises: workoutExercises.map(we => ({
          exercise: we.exercise,
          sets: we.sets.filter(set => set.completed)
        })),
        completedAt: new Date(),
        totalSets: workoutExercises.reduce((total, we) => total + we.sets.filter(s => s.completed).length, 0)
      };
      
      // TODO: Save workout to database
      console.log('Workout submitted:', workoutSummary);
      
      // Clear workout after submission
      set({ workoutExercises: [] });
      
      // Show success message
      alert(`Workout completed! ${workoutSummary.totalSets} sets logged.`);
    }
  }))
);

// Auto-save to localStorage on state changes
useWorkoutStore.subscribe(
  (state) => ({
    workoutExercises: state.workoutExercises
  }),
  (workoutData) => {
    localStorage.setItem('yescoach-workout', JSON.stringify(workoutData));
  }
);

// Load from localStorage on initialization
const savedData = localStorage.getItem('yescoach-workout');
if (savedData) {
  try {
    const parsed = JSON.parse(savedData);
    useWorkoutStore.setState({
      workoutExercises: parsed.workoutExercises || []
    });
  } catch (error) {
    console.error('Failed to load saved workout data:', error);
  }
}