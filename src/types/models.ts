// src/types/models.ts

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
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizers?: MuscleGroup[];
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
  muscleId: MuscleGroup;
  volume: number; // Weekly volume count
  lastWorked: Date;
  fatigue: number; // 0-100
  fiberActivation: {
    slow: number; // 0-100
    fast: number; // 0-100
  };
  flexibility: number; // 0-100
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

// User preferences
export interface UserProfile {
  id: string;
  availableEquipment: string[];
  goals: TrainingGoal[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  injuries?: MuscleGroup[];
}