// Types unified export
export * from './SimpleExerciseTypes';
export * from './models';

// Re-export for backwards compatibility
export type { SimpleExercise as Exercise } from './SimpleExerciseTypes';
export type { SimpleExercise as ExerciseInfo } from './SimpleExerciseTypes'; // Legacy compatibility
export type { SimpleExerciseRelations as ExerciseRelations } from './SimpleExerciseTypes';