import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SimpleExercise } from '../types/SimpleExerciseTypes';
import { db as database } from '../services/database';
import { muscleStateService } from '../services/muscleStateService';
import { Workout, WorkoutSet as DBWorkoutSet, Exercise } from '../types/models';

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
  updateSet: (exerciseId: string, setId: string, setData: Partial<Omit<WorkoutSet, 'id'>>) => void;
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
        completed: true // Changed to true - sets are completed when added
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
    
    updateSet: (exerciseId, setId, setData) => {
      const { workoutExercises } = get();
      
      const updatedExercises = workoutExercises.map(we =>
        we.exercise.id === exerciseId
          ? {
              ...we,
              sets: we.sets.map(set =>
                set.id === setId ? { ...set, ...setData } : set
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
    submitWorkout: async () => {
      const { workoutExercises } = get();
      
      // Filter to only completed sets
      const exercisesWithCompletedSets = workoutExercises
        .map(we => ({
          exerciseId: we.exercise.id,
          exercise: we.exercise,
          sets: we.sets.filter(set => set.completed)
        }))
        .filter(e => e.sets.length > 0);
      
      if (exercisesWithCompletedSets.length === 0) {
        alert('No completed sets to save!');
        return;
      }
      
      // Create workout for database
      const workout: Workout = {
        id: `workout-${Date.now()}`,
        date: new Date(),
        goal: 'strength', // Default for now
        exercises: exercisesWithCompletedSets.map(e => ({
          exerciseId: e.exerciseId,
          sets: e.sets.map(set => ({
            exerciseId: e.exerciseId,
            reps: set.reps,
            weight: set.weight,
            rpe: 7, // Default RPE
            rest: 60 // Default rest
          } as DBWorkoutSet))
        }))
      };
      
      try {
        // Save workout to database
        await database.saveWorkout(workout);
        
        // Convert SimpleExercise to Exercise format for muscle state calculation
        const exercisesForMuscleCalc = exercisesWithCompletedSets.map(e => ({
          exercise: {
            id: e.exercise.id,
            name: e.exercise.name,
            type: 'strength' as const,
            equipment: e.exercise.equipment,
            primaryMuscles: e.exercise.primaryMuscles || [],
            secondaryMuscles: e.exercise.secondaryMuscles || [],
            mechanics: 'compound' as const, // default value
            force: 'push' as const, // default value
            fiberBias: 'mixed' as const, // default value
            recommendedGoals: ['strength'] // default value
          } as Exercise,
          sets: e.sets.map(set => ({
            exerciseId: e.exerciseId,
            reps: set.reps,
            weight: set.weight,
            rpe: 7,
            rest: 60
          } as DBWorkoutSet))
        }));
        
        // Calculate muscle impact
        const muscleImpacts = await muscleStateService.calculateWorkoutImpact(
          exercisesForMuscleCalc
        );
        
        // Update muscle states
        await muscleStateService.updateMuscleStates(muscleImpacts);
        
        // Clear workout after submission
        set({ workoutExercises: [] });
        
        // Clear localStorage
        localStorage.removeItem('yescoach-workout');
        
        // Success - workout saved
        console.log('Workout saved successfully:', {
          totalSets: exercisesWithCompletedSets.reduce((total, e) => total + e.sets.length, 0),
          exercises: exercisesWithCompletedSets.length
        });
        
      } catch (error) {
        console.error('Failed to save workout - Full error:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          workout,
          exercisesWithCompletedSets
        });
        alert('Failed to save workout. Please try again. Check console for details.');
      }
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