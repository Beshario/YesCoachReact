// SimpleExerciseTypes.ts
// MVP-aligned exercise types matching the converter output

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivationLevel = 'high' | 'medium' | 'low';
export type EquipmentType = string; // Dynamic from free-exercise-db
export type SortType = 'relevance' | 'alphabetical' | 'type';

export interface SimpleExercise {
  id: string;
  name: string;
  
  // From free-exercise-db
  category: string;
  equipment: string[];
  primaryMuscles: number[];  // Muscle IDs from MuscleData.ts
  secondaryMuscles: number[];
  
  // Our additions (pre-computed)
  activationLevels: {
    [muscleId: number]: ActivationLevel;
  };
  
  // Simple categorization for relationships
  tags: string[];  // ['compound', 'push', 'upper', 'strength']
  difficulty: DifficultyLevel;
  
  // Instructions
  instructions: string[];
  tips?: string[];
  
  // Legacy compatibility fields
  searchTags: string[]; // Alias for tags
  
  // Future biomechanics extension (optional)
  biomechanics?: {
    forceVector?: { x: number; y: number; z: number };
    jointAngles?: { [joint: string]: number };
    muscleActivationMap?: { [muscleId: number]: number }; // 0-100%
    movementPlane?: 'sagittal' | 'frontal' | 'transverse' | 'multiplanar';
    contractionType?: 'concentric' | 'eccentric' | 'isometric' | 'mixed';
  };
}

// Pre-computed relationships
export interface SimpleExerciseRelations {
  exerciseId: string;
  similar: string[];      // Same muscles, different equipment
  alternatives: string[]; // Different muscles, same movement pattern
  progressions: string[]; // Harder version
  regressions: string[];  // Easier version
}

// For backwards compatibility
export type MVPExercise = SimpleExercise;
export type MVPExerciseRelations = SimpleExerciseRelations;