// src/services/exerciseData.ts
import { Exercise, MuscleGroup } from '../types/models';

// Sample exercises based on ExRx patterns
export const exerciseDatabase: Exercise[] = [
  // Chest exercises
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    type: 'strength',
    equipment: ['barbell', 'bench'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front_delts', 'triceps'],
    stabilizers: ['abs', 'lats'],
    mechanics: 'compound',
    force: 'push',
    fiberBias: 'mixed',
    recommendedGoals: ['strength', 'hypertrophy', 'power'],
    instagramDemo: 'bench press form'
  },
  {
    id: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    type: 'strength',
    equipment: ['dumbbells', 'bench'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front_delts', 'triceps'],
    mechanics: 'compound',
    force: 'push',
    fiberBias: 'mixed',
    recommendedGoals: ['hypertrophy'],
    instagramDemo: 'incline dumbbell press'
  },
  
  // Back exercises
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    type: 'strength',
    equipment: ['barbell'],
    primaryMuscles: ['lower_back', 'glutes', 'hamstrings'],
    secondaryMuscles: ['traps', 'lats', 'quads'],
    stabilizers: ['abs', 'forearms'],
    mechanics: 'compound',
    force: 'pull',
    fiberBias: 'fast',
    recommendedGoals: ['strength', 'power'],
    instagramDemo: 'deadlift form technique'
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    type: 'strength',
    equipment: ['pull-up bar'],
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'mid_back', 'rear_delts'],
    stabilizers: ['abs'],
    mechanics: 'compound',
    force: 'pull',
    fiberBias: 'mixed',
    recommendedGoals: ['strength', 'hypertrophy'],
    instagramDemo: 'pull up progression'
  },
  
  // Legs
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    type: 'strength',
    equipment: ['barbell', 'squat rack'],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    stabilizers: ['abs', 'lower_back'],
    mechanics: 'compound',
    force: 'push',
    fiberBias: 'mixed',
    recommendedGoals: ['strength', 'hypertrophy', 'power'],
    instagramDemo: 'squat depth form'
  },
  
  // Cardio
  {
    id: 'running',
    name: 'Running',
    type: 'cardio',
    equipment: [],
    primaryMuscles: ['calves', 'quads', 'hamstrings'],
    secondaryMuscles: ['glutes', 'hip_flexors'],
    mechanics: 'compound',
    force: 'push',
    fiberBias: 'slow',
    recommendedGoals: ['endurance'],
    instagramDemo: 'running form tips'
  },
  
  // Stretches
  {
    id: 'chest-doorway-stretch',
    name: 'Chest Doorway Stretch',
    type: 'stretch',
    equipment: ['doorway'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front_delts'],
    mechanics: 'isolation',
    force: 'static',
    fiberBias: 'slow',
    recommendedGoals: ['endurance'],
    instagramDemo: 'chest stretch flexibility'
  },
  {
    id: 'hamstring-stretch',
    name: 'Standing Hamstring Stretch',
    type: 'stretch',
    equipment: [],
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    mechanics: 'isolation',
    force: 'static',
    fiberBias: 'slow',
    recommendedGoals: ['endurance'],
    instagramDemo: 'hamstring stretch routine'
  }
];

// Helper functions
export function getExercisesByMuscle(muscle: MuscleGroup): Exercise[] {
  return exerciseDatabase.filter(
    ex => ex.primaryMuscles.includes(muscle) || ex.secondaryMuscles.includes(muscle)
  );
}

export function getExercisesByEquipment(equipment: string[]): Exercise[] {
  return exerciseDatabase.filter(
    ex => ex.equipment.every(eq => equipment.includes(eq)) || ex.equipment.length === 0
  );
}