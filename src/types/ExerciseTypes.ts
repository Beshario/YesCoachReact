// Exercise System Types - Phase 1 Implementation
// Static exercise interfaces with exercise database integration

export type UtilityType = 'basic' | 'auxiliary';
export type MechanicsType = 'compound' | 'isolated';
export type ForceType = 'push' | 'pull';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivationLevel = 'target' | 'synergist' | 'stabilizer';
export type TrainingType = 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'stability';
export type MovementPattern = 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotate' | 'gait';
export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'resistance_band' | 'kettlebell' | 'suspension' | 'medicine_ball' | 'plate' | 'bench' | 'pull_up_bar';

// Muscle activation with percentage intensity
export interface MuscleActivation {
  muscleId: number;                        // References MuscleData.ts ID
  activationLevel: ActivationLevel;        // Classification level
  percentage?: number;                     // Optional activation percentage (0-100)
}

// Exercise relationship with context
export interface ExerciseLink {
  exerciseId: number;                      // Target exercise ID
  similarity: number;                      // 0-1 similarity score
  difficultyDelta: number;                 // Percentage difficulty change (-100 to +100)
  context: string;                         // "equipment", "stability", "technique", "angle"
  reason: string;                          // Human readable explanation
}

// Exercise relationships for intelligent substitution
export interface ExerciseRelationships {
  alternatives: ExerciseLink[];            // Same difficulty, different equipment/style
  progressions: ExerciseLink[];            // Harder variations
  regressions: ExerciseLink[];             // Easier variations
  antagonists: ExerciseLink[];             // Opposing movement patterns
}

// Core exercise information from exercise database
export interface ExerciseInfo {
  id: number;
  name: string;
  sourceId?: string;                       // Source reference for validation
  
  // Exercise Classification Data
  utility: UtilityType;                    // Basic/Auxiliary classification
  mechanics: MechanicsType;                // Compound/Isolated classification  
  force: ForceType;                        // Push/Pull classification
  
  // Exercise Instructions
  preparation: string;                     // Setup instructions
  execution: string;                       // Movement execution steps
  comments?: string;                       // Additional notes and variations
  
  // Muscle Analysis (core of the system)
  muscleActivation: {
    target: number[];                      // Primary muscles (70-100% activation)
    synergists: number[];                  // Secondary muscles (30-70% activation)
    stabilizers: number[];                 // Support muscles (10-30% activation)
  };
  
  // Training Characteristics
  equipment: EquipmentType[];              // Required equipment
  difficulty: DifficultyLevel;             // User experience level
  trainingTypes: TrainingType[];           // Suitable training goals
  movementPattern: MovementPattern;        // Primary movement classification
  fiberBias: 1 | 2 | 3;                  // 1=fast twitch, 2=mixed, 3=slow twitch
  
  // Pre-computed relationships (populated after scraping)
  relationships?: ExerciseRelationships;
  
  // Media and Discovery
  instagramQuery?: string;                 // For video demonstrations
  searchTags: string[];                    // Keywords for filtering
  
  // Metadata
  dateAdded: Date;
  lastUpdated: Date;
  isVerified: boolean;                     // Quality validation status
}

// Detailed muscle activation (for advanced analysis)
export interface DetailedMuscleActivation extends MuscleActivation {
  role: 'prime_mover' | 'assistant_mover' | 'stabilizer' | 'antagonist';
  contraction: 'concentric' | 'eccentric' | 'isometric';
  rangeOfMotion: 'full' | 'partial' | 'end_range';
}

// Exercise catalog entry (what gets stored in database)
export interface ExerciseCatalogEntry extends ExerciseInfo {
  // Additional computed fields for performance
  muscleActivationMap: Map<number, MuscleActivation>;  // Fast lookup by muscle ID
  alternativeIds: number[];                            // Direct IDs for performance
  progressionIds: number[];
  regressionIds: number[];
  antagonistIds: number[];
}

// Exercise database raw data structure
export interface ExerciseRawData {
  url: string;
  title: string;
  utility?: string;
  mechanics?: string;
  force?: string;
  preparation?: string;
  execution?: string;
  comments?: string;
  targetMuscles: string[];                 // Raw muscle names from source
  synergistMuscles: string[];
  stabilizerMuscles: string[];
  scrapedAt: Date;
}

// Muscle name mapping for source → MuscleData.ts conversion
export interface SourceMuscleMapping {
  sourceName: string;                      // Exact name from source
  muscleId: number;                        // Corresponding MuscleData.ts ID
  confidence: number;                      // 0-1 mapping confidence
  aliases: string[];                       // Alternative source names for same muscle
  notes?: string;                          // Manual mapping notes
}

// Exercise database statistics and metadata
export interface ExerciseDatabase {
  exercises: Record<number, ExerciseCatalogEntry>;
  muscleMappings: Record<string, SourceMuscleMapping>;
  metadata: {
    totalExercises: number;
    lastScraped: Date;
    version: string;
    musclesCovered: number[];              // All muscle IDs referenced
    equipmentTypes: EquipmentType[];       // All equipment types available
    categories: string[];                  // Movement pattern categories
  };
}

// Search and filtering interfaces
export interface ExerciseSearchQuery {
  name?: string;
  muscleIds?: number[];                    // Target specific muscles
  equipment?: EquipmentType[];             // Available equipment
  difficulty?: DifficultyLevel[];          // User skill level
  trainingTypes?: TrainingType[];          // Training goals
  movementPatterns?: MovementPattern[];    // Movement preferences
  excludeExerciseIds?: number[];           // Exercises to avoid
}

export interface ExerciseSearchResult {
  exercise: ExerciseInfo;
  relevanceScore: number;                  // 0-1 match quality
  muscleMatchCount: number;                // How many target muscles matched
  missingEquipment: EquipmentType[];       // Required but unavailable equipment
}

// Performance optimization indexes
export interface ExerciseIndexes {
  byMuscle: Record<number, number[]>;      // muscle ID → exercise IDs
  byEquipment: Record<EquipmentType, number[]>;  // equipment → exercise IDs
  byMovementPattern: Record<MovementPattern, number[]>;  // pattern → exercise IDs
  byDifficulty: Record<DifficultyLevel, number[]>;  // difficulty → exercise IDs
}

// Utility types for relationship discovery algorithms
export interface MuscleOverlapAnalysis {
  exerciseA: number;
  exerciseB: number;
  targetOverlap: number;                   // Number of shared target muscles
  synergistOverlap: number;                // Number of shared synergist muscles
  totalOverlap: number;                    // Total shared muscles
  overlapScore: number;                    // 0-1 similarity based on muscle overlap
  equipmentCompatibility: number;          // 0-1 equipment similarity
  difficultyGap: number;                   // Difficulty difference (-2 to +2)
}

export interface RelationshipDiscovery {
  sourceExerciseId: number;
  candidates: MuscleOverlapAnalysis[];
  alternatives: ExerciseLink[];
  progressions: ExerciseLink[];
  regressions: ExerciseLink[];
  antagonists: ExerciseLink[];
}