// src/services/exerciseData.ts
// Backward compatibility layer for existing Exercise interface
import { Exercise, MuscleGroup } from '../types/models';
import { exerciseService } from './exerciseService';
import { ExerciseInfo } from '../types/ExerciseTypes';

// Muscle ID mapping from new system to old system
const muscleIdToMuscleGroup: Record<number, MuscleGroup> = {
  // Upper body - push
  161: 'chest',      // Pectoralis Major (Sternal)
  162: 'chest',      // Pectoralis Major (Clavicular)
  111: 'front_delts', // Anterior Deltoid
  112: 'side_delts',  // Lateral Deltoid
  113: 'rear_delts',  // Posterior Deltoid
  121: 'triceps',     // Triceps Brachii
  
  // Upper body - pull
  141: 'lats',        // Latissimus Dorsi
  143: 'traps',       // Upper Trapezius
  144: 'traps',       // Middle Trapezius
  145: 'traps',       // Lower Trapezius
  147: 'rhomboids',   // Rhomboids
  122: 'biceps',      // Biceps Brachii
  131: 'forearms',    // Brachioradialis
  
  // Core
  171: 'abs',         // Rectus Abdominis
  173: 'obliques',    // Obliques
  172: 'transverse',  // Transverse Abdominis
  175: 'lower_back', // Erector Spinae
  
  // Lower body
  191: 'quads',       // Quadriceps
  192: 'hamstrings',  // Hamstrings
  181: 'glutes',      // Gluteus Maximus
  201: 'calves',      // Gastrocnemius
  // Add more mappings as needed
};

/**
 * Convert ExerciseInfo to legacy Exercise format
 */
function convertToLegacyExercise(exerciseInfo: ExerciseInfo): Exercise {
  // Map muscle IDs to muscle groups
  const primaryMuscles = exerciseInfo.muscleActivation.target
    .map(id => muscleIdToMuscleGroup[id])
    .filter(muscle => muscle !== undefined);

  const secondaryMuscles = exerciseInfo.muscleActivation.synergists
    .map(id => muscleIdToMuscleGroup[id])
    .filter(muscle => muscle !== undefined);

  const stabilizers = exerciseInfo.muscleActivation.stabilizers
    .map(id => muscleIdToMuscleGroup[id])
    .filter(muscle => muscle !== undefined);

  // Map training types to legacy goals
  const goalMapping: Record<string, any> = {
    'strength': 'strength',
    'hypertrophy': 'hypertrophy',
    'power': 'power',
    'endurance': 'endurance'
  };

  const recommendedGoals = exerciseInfo.trainingTypes
    .map(type => goalMapping[type])
    .filter(goal => goal !== undefined);

  // Map fiber bias
  const fiberBiasMapping: Record<number, any> = {
    1: 'fast',
    2: 'mixed',
    3: 'slow'
  };

  return {
    id: exerciseInfo.id.toString(),
    name: exerciseInfo.name,
    type: 'strength', // Default to strength for now
    equipment: exerciseInfo.equipment,
    primaryMuscles,
    secondaryMuscles,
    stabilizers,
    mechanics: exerciseInfo.mechanics === 'isolated' ? 'isolation' : 'compound',
    force: exerciseInfo.force === 'pull' ? 'pull' : exerciseInfo.force === 'push' ? 'push' : 'static',
    fiberBias: fiberBiasMapping[exerciseInfo.fiberBias] || 'mixed',
    recommendedGoals,
    preparation: exerciseInfo.preparation,
    execution: exerciseInfo.execution,
    instagramDemo: exerciseInfo.instagramQuery
  };
}

// Cache for converted exercises
let cachedExercises: Exercise[] | null = null;

/**
 * Get all exercises in legacy format
 */
export async function getExerciseDatabase(): Promise<Exercise[]> {
  if (cachedExercises) return cachedExercises;

  try {
    await exerciseService.initialize();
    const exerciseInfos = await exerciseService.getStats();
    
    // For now, get a subset of exercises for compatibility
    const allExerciseInfos = await exerciseService.quickSearch('', 100); // Limit to 100 for performance
    
    cachedExercises = allExerciseInfos.map(convertToLegacyExercise);
    return cachedExercises;
  } catch (error) {
    console.error('Failed to load exercise database:', error);
    // Return empty array as fallback
    return [];
  }
}

// Backward compatible helper functions
export async function getExercisesByMuscle(muscle: MuscleGroup): Promise<Exercise[]> {
  const exercises = await getExerciseDatabase();
  return exercises.filter(
    ex => ex.primaryMuscles.includes(muscle) || ex.secondaryMuscles.includes(muscle)
  );
}

export async function getExercisesByEquipment(equipment: string[]): Promise<Exercise[]> {
  const exercises = await getExerciseDatabase();
  return exercises.filter(
    ex => ex.equipment.every(eq => equipment.includes(eq)) || ex.equipment.length === 0
  );
}

// Legacy export for backward compatibility
export const exerciseDatabase: Exercise[] = [];