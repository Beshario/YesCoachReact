// Services unified export
export { ExerciseService } from './exerciseService';
export { simpleExerciseImporter } from './SimpleExerciseImporter';
export { db } from './database';
export { preferencesService } from './preferencesService';

// Create singleton instance
import { ExerciseService } from './exerciseService';
export const exerciseService = new ExerciseService();