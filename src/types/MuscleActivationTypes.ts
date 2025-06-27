// Muscle Activation System Types - Based on Exercise Science Standards
// Professional muscle activation interfaces aligned with exercise science terminology

// Core Exercise Classifications
export type UtilityClassification = 'basic' | 'auxiliary';
export type MechanicsClassification = 'compound' | 'isolated';
export type ForceClassification = 'push' | 'pull';
export type ChainClassification = 'closed_chain' | 'open_chain';

// Muscle Activation Levels (Exercise Science Standard)
export type ActivationRole = 'target' | 'synergist' | 'stabilizer' | 'antagonist';

// Contraction Types
export type ContractionType = 'concentric' | 'eccentric' | 'isometric';

// Training Adaptations (from exercise science)
export type TrainingAdaptation = 'hypertrophy' | 'hyperplasia' | 'strength' | 'power' | 'endurance';

// Muscle Fiber Types
export type FiberType = 'fast_twitch' | 'slow_twitch' | 'mixed';

// Tempo Training Components (4-point system)
export interface TempoPhases {
  eccentric: number;          // Lowering phase (seconds)
  stretched: number;          // Bottom position pause (seconds)
  concentric: number;         // Lifting phase (seconds)
  contracted: number;         // Top position pause (seconds)
}

// Primary muscle activation interface
export interface MuscleActivation {
  muscleId: number;                        // References MuscleData.ts
  role: ActivationRole;                    // ExRx classification
  intensity: number;                       // 0-100 activation percentage
  primaryContraction: ContractionType;     // Main contraction type
  rangeOfMotion: 'full' | 'partial' | 'end_range';
  isGravityDependent: boolean;             // Basic exercise characteristic
}

// Advanced muscle activation with exercise biomechanics
export interface DetailedMuscleActivation extends MuscleActivation {
  contractionPhases: {
    eccentric: number;                     // Activation during lowering
    concentric: number;                    // Activation during lifting
    isometric: number;                     // Activation during pauses
  };
  forceVector: ForceClassification;        // Push/pull classification
  jointMovements: string[];                // Anatomical joint actions
  stabilizationDemand: 'low' | 'moderate' | 'high';
  coordinationComplexity: 'simple' | 'moderate' | 'complex';
}

// Exercise Classification System
export interface ExerciseClassification {
  utility: UtilityClassification;           // Basic vs Auxiliary
  mechanics: MechanicsClassification;       // Compound vs Isolated
  force: ForceClassification;               // Push vs Pull
  chain: ChainClassification;               // Closed vs Open chain
  isFunctional: boolean;                    // Functional movement classification
  isGravityDependent: boolean;              // Requires gravity for resistance
}

// Muscle activation pattern for complete exercise
export interface ExerciseActivationPattern {
  exerciseId: number;
  classification: ExerciseClassification;
  
  // Primary muscle groups (ExRx standard)
  target: MuscleActivation[];              // Primary muscles (70-100%)
  synergists: MuscleActivation[];          // Assistant muscles (30-70%)
  stabilizers: MuscleActivation[];         // Stabilizing muscles (10-30%)
  
  // Advanced activation analysis
  dominantFiberType: FiberType;            // Overall fiber type bias
  coordinationDemand: 'low' | 'moderate' | 'high';
  stabilityDemand: 'low' | 'moderate' | 'high';
  
  // Training prescription factors
  optimalTempo: TempoPhases;               // Standard tempo notation
  intensityRange: {                        // % 1RM recommendations
    strength: [number, number];            // e.g., [85, 95]
    hypertrophy: [number, number];         // e.g., [65, 85]
    endurance: [number, number];           // e.g., [40, 65]
  };
  
  // Recovery characteristics
  recoveryDemand: 'low' | 'moderate' | 'high';
  metabolicStress: 'low' | 'moderate' | 'high';
  mechanicalTension: 'low' | 'moderate' | 'high';
}

// Muscle activation comparison for exercise relationships
export interface ActivationSimilarity {
  exerciseA: number;
  exerciseB: number;
  
  // Muscle overlap analysis
  targetOverlap: {
    sharedMuscles: number[];               // Common target muscles
    overlapPercentage: number;             // 0-100% similarity
    intensityCorrelation: number;          // -1 to 1 activation intensity match
  };
  
  synergistOverlap: {
    sharedMuscles: number[];
    overlapPercentage: number;
    intensityCorrelation: number;
  };
  
  stabilizerOverlap: {
    sharedMuscles: number[];
    overlapPercentage: number;
    intensityCorrelation: number;
  };
  
  // Movement pattern similarity
  mechanicsCompatibility: number;          // 0-1 compound/isolated match
  forceCompatibility: number;              // 0-1 push/pull match
  chainCompatibility: number;              // 0-1 open/closed chain match
  
  // Overall similarity scores
  totalSimilarity: number;                 // 0-1 overall match
  substituteViability: 'excellent' | 'good' | 'fair' | 'poor';
}

// Training prescription based on muscle activation
export interface ActivationBasedPrescription {
  exerciseId: number;
  
  // Volume recommendations based on activation
  setsRange: [number, number];             // Min-max sets
  repsRange: {
    strength: [number, number];
    hypertrophy: [number, number];
    endurance: [number, number];
  };
  
  // Rest periods based on activation demand
  restPeriods: {
    strength: number;                      // Seconds between sets
    hypertrophy: number;
    endurance: number;
  };
  
  // Frequency based on recovery demand
  weeklyFrequency: {
    beginner: number;                      // Sessions per week
    intermediate: number;
    advanced: number;
  };
  
  // Progression strategies
  progressionMethods: Array<'weight' | 'reps' | 'sets' | 'tempo' | 'range_of_motion'>;
  deloadRecommendation: number;            // Weeks between deloads
}

// Muscle fatigue calculation based on activation
export interface MuscleActivationLoad {
  muscleId: number;
  
  // Recent activation history
  recentSessions: Array<{
    sessionDate: Date;
    exercises: Array<{
      exerciseId: number;
      activation: MuscleActivation;
      volume: number;                      // Sets × reps × weight
      intensity: number;                   // % 1RM
    }>;
  }>;
  
  // Calculated fatigue metrics
  currentFatigue: number;                  // 0-100 fatigue level
  recoveryNeeded: number;                  // Hours to full recovery
  readinessScore: number;                  // 0-100 training readiness
  
  // Adaptation tracking
  adaptationTrend: 'improving' | 'maintaining' | 'declining';
  volumeProgression: number;               // Weekly volume change %
  strengthProgression: number;             // Weekly strength change %
}

// Exercise selection algorithm based on muscle activation
export interface ActivationBasedSelection {
  targetMuscles: number[];                 // Desired muscle targets
  availableEquipment: string[];            // Equipment constraints
  trainingGoal: TrainingAdaptation;        // Primary goal
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Current state constraints
  fatigued Muscles: number[];              // Muscles needing recovery
  injuredMuscles: number[];                // Muscles to avoid
  timeConstraint: number;                  // Minutes available
  
  // Selection results
  recommendedExercises: Array<{
    exerciseId: number;
    relevanceScore: number;                // 0-1 match to criteria
    activationMatch: number;               // 0-1 muscle target match
    feasibilityScore: number;              // 0-1 equipment/constraint match
    rationale: string;                     // Why this exercise was selected
  }>;
}

// Muscle imbalance detection based on activation patterns
export interface ActivationImbalanceAnalysis {
  userId: string;
  analysisDate: Date;
  
  // Muscle group balance ratios
  balanceRatios: Array<{
    muscleGroupA: number[];                // e.g., quadriceps
    muscleGroupB: number[];                // e.g., hamstrings
    idealRatio: number;                    // Expected strength ratio
    currentRatio: number;                  // User's actual ratio
    imbalancePercentage: number;           // Deviation from ideal
    riskLevel: 'low' | 'moderate' | 'high';
  }>;
  
  // Activation frequency analysis
  activationFrequency: Array<{
    muscleId: number;
    weeklyActivations: number;             // Times trained per week
    averageIntensity: number;              // Average activation level
    volumeDistribution: number;            // % of total weekly volume
    isUnderTrained: boolean;
    isOverTrained: boolean;
  }>;
  
  // Recommendations
  recommendations: Array<{
    type: 'increase_volume' | 'decrease_volume' | 'add_exercise' | 'modify_technique';
    muscleIds: number[];
    specificActions: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Export utility functions interface
export interface MuscleActivationUtils {
  calculateActivationSimilarity: (exerciseA: number, exerciseB: number) => ActivationSimilarity;
  findExercisesByActivation: (muscles: number[], role: ActivationRole) => number[];
  calculateMuscleLoad: (muscleId: number, sessions: any[]) => MuscleActivationLoad;
  generatePrescription: (exerciseId: number, goal: TrainingAdaptation) => ActivationBasedPrescription;
  detectImbalances: (userId: string) => ActivationImbalanceAnalysis;
  selectExercises: (criteria: ActivationBasedSelection) => number[];
}