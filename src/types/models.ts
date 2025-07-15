// src/types/models.ts
import { SortType } from './SimpleExerciseTypes';

// Re-export for convenience
export type { SortType };

// Muscle groups based on ExRx classification
export type MuscleGroup = 
  // Upper Body - Push
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts' | 'triceps'
  // Upper Body - Pull  
  | 'lats' | 'traps' | 'rhomboids' | 'mid_back' | 'biceps' | 'forearms'
  // Core
  | 'abs' | 'obliques' | 'transverse' | 'lower_back'
  // Lower Body
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'hip_flexors' | 'adductors' | 'abductors';

export type ExerciseType = 'strength' | 'cardio' | 'stretch' | 'mobility';
export type TrainingGoal = 'hypertrophy' | 'power' | 'endurance' | 'strength';
export type FiberType = 'slow' | 'fast' | 'mixed';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  equipment: string[];
  primaryMuscles: number[]; // Using muscle ID numbers from body map
  secondaryMuscles: number[];
  stabilizers?: number[];
  mechanics: 'compound' | 'isolation';
  force: 'push' | 'pull' | 'static';
  // Training specifics
  fiberBias: FiberType;
  recommendedGoals: TrainingGoal[];
  // Instructions
  preparation?: string;
  execution?: string;
  instagramDemo?: string; // Instagram post ID or search term
}

export interface MuscleState {
  muscleId: number; // Using muscle ID numbers from body map
  currentFatigue: number; // 0-100
  lastUpdated: Date;
  lastWorkoutRole?: 'primary' | 'secondary';
  // Future fields for expansion:
  // volume?: number; // Weekly volume count
  // fiberActivation?: {
  //   slow: number; // 0-100
  //   fast: number; // 0-100
  // };
  // flexibility?: number; // 0-100
}

export interface WorkoutSet {
  exerciseId: string;
  reps: number;
  weight?: number;
  duration?: number; // seconds (for cardio/stretches)
  distance?: number; // meters (for cardio)
  tempo?: string; // "3-1-2-0" format
  rpe: number; // 1-10 Rate of Perceived Exertion
  rest: number; // seconds between sets
}

export interface Workout {
  id: string;
  date: Date;
  goal: TrainingGoal;
  exercises: {
    exerciseId: string;
    sets: WorkoutSet[];
  }[];
  notes?: string;
}

// For calculating training effect
export interface TrainingEffect {
  muscleGroup: MuscleGroup;
  volumeAdded: number;
  fiberTypeStimulus: {
    slow: number;
    fast: number;
  };
  estimatedRecoveryTime: number; // hours
}

// User preferences and settings
// SortType moved to SimpleExerciseTypes.ts
export type ExerciseListView = 'compact' | 'detailed';

export interface UserPreferences {
  defaultSortBy: SortType;
  showSynergistExercises: boolean;
  showStabilizerExercises: boolean;
  exerciseListView: ExerciseListView;
  autoExpandChildMuscles: boolean;
}

export interface UserProfile {
  id: string;
  availableEquipment: string[];
  goals: TrainingGoal[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  injuries?: MuscleGroup[];
  preferences: UserPreferences;
  createdAt: Date;
  lastUpdated: Date;
}