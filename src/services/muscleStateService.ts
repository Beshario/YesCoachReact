import { db as database } from './database';
import { MuscleState, Exercise, WorkoutSet } from '../types/models';
import { MuscleDisplayState } from '../components/BodyMap/BodyMapViewer';

export interface MuscleWorkoutImpact {
  muscleId: number;
  fatigueAdded: number;
  role: 'primary' | 'secondary';
  volumeLifted: number;
}

// Muscle size categories for volume normalization
export enum MuscleSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

// Volume thresholds for fatigue calculation (in kg)
const VOLUME_THRESHOLDS = {
  [MuscleSize.Small]: {
    light: 2000,
    moderate: 4000,
    heavy: 6000
  },
  [MuscleSize.Medium]: {
    light: 4000,
    moderate: 8000,
    heavy: 12000
  },
  [MuscleSize.Large]: {
    light: 6000,
    moderate: 12000,
    heavy: 18000
  }
};

// Default body weight for bodyweight exercises (kg)
const DEFAULT_BODY_WEIGHT = 70;

// Bodyweight exercise multipliers
const BODYWEIGHT_MULTIPLIERS: Record<string, number> = {
  'push-up': 0.7,
  'push-ups': 0.7,
  'pushup': 0.7,
  'pull-up': 1.0,
  'pull-ups': 1.0,
  'pullup': 1.0,
  'chin-up': 1.0,
  'dip': 0.85,
  'dips': 0.85,
  'pistol squat': 0.8,
  'squat': 0.6, // air squat
  'lunge': 0.5,
  'lunges': 0.5
};

export class MuscleStateService {
  private static instance: MuscleStateService;

  private constructor() {}

  static getInstance(): MuscleStateService {
    if (!MuscleStateService.instance) {
      MuscleStateService.instance = new MuscleStateService();
    }
    return MuscleStateService.instance;
  }

  /**
   * Get muscle size category based on muscle ID
   */
  private getMuscleSize(muscleId: number): MuscleSize {
    // Small muscles: biceps, triceps, calves, forearms, abs
    const smallMuscles = [122, 123, 124, 125, 130, 131, 132, 133, 171, 172, 173];
    
    // Large muscles: chest, back, quads, glutes
    const largeMuscles = [160, 161, 162, 150, 151, 152, 153, 180, 181, 182, 183, 190, 191];
    
    if (smallMuscles.includes(muscleId)) {
      return MuscleSize.Small;
    } else if (largeMuscles.includes(muscleId)) {
      return MuscleSize.Large;
    } else {
      return MuscleSize.Medium;
    }
  }

  /**
   * Calculate volume for an exercise
   */
  private calculateExerciseVolume(
    exercise: Exercise,
    sets: WorkoutSet[]
  ): number {
    let totalVolume = 0;

    sets.forEach(set => {
      let setVolume = 0;
      
      if (set.weight && set.weight > 0) {
        // Weighted exercise
        setVolume = set.weight * set.reps;
      } else {
        // Bodyweight exercise - check for multiplier
        const exerciseName = exercise.name.toLowerCase();
        let bodyweightMultiplier = 0.5; // default for unknown exercises
        
        // Check for specific bodyweight exercise
        for (const [key, multiplier] of Object.entries(BODYWEIGHT_MULTIPLIERS)) {
          if (exerciseName.includes(key)) {
            bodyweightMultiplier = multiplier;
            break;
          }
        }
        
        setVolume = DEFAULT_BODY_WEIGHT * bodyweightMultiplier * set.reps;
      }
      
      totalVolume += setVolume;
    });

    return totalVolume;
  }

  /**
   * Normalize volume to fatigue percentage based on muscle size
   */
  private normalizeVolumeToFatigue(volume: number, muscleSize: MuscleSize): number {
    const thresholds = VOLUME_THRESHOLDS[muscleSize];
    
    if (volume <= thresholds.light) {
      // 0 to light threshold = 0-33% fatigue
      return (volume / thresholds.light) * 33;
    } else if (volume <= thresholds.moderate) {
      // light to moderate = 33-66% fatigue
      const range = thresholds.moderate - thresholds.light;
      const progress = volume - thresholds.light;
      return 33 + (progress / range) * 33;
    } else if (volume <= thresholds.heavy) {
      // moderate to heavy = 66-90% fatigue
      const range = thresholds.heavy - thresholds.moderate;
      const progress = volume - thresholds.moderate;
      return 66 + (progress / range) * 24;
    } else {
      // heavy+ = 90-100% fatigue (with diminishing returns)
      const excess = volume - thresholds.heavy;
      const additionalFatigue = Math.min(10, excess / thresholds.heavy * 10);
      return 90 + additionalFatigue;
    }
  }

  /**
   * Calculate muscle fatigue from a completed workout
   */
  async calculateWorkoutImpact(
    exercises: Array<{ exercise: Exercise; sets: WorkoutSet[] }>
  ): Promise<MuscleWorkoutImpact[]> {
    const muscleVolumes = new Map<number, { primary: number; secondary: number; role: 'primary' | 'secondary' }>();

    // Accumulate volume for each muscle
    exercises.forEach(({ exercise, sets }) => {
      const exerciseVolume = this.calculateExerciseVolume(exercise, sets);

      // Primary muscles get 100% of the volume
      exercise.primaryMuscles.forEach(muscleId => {
        const existing = muscleVolumes.get(muscleId) || { primary: 0, secondary: 0, role: 'primary' as const };
        existing.primary += exerciseVolume;
        existing.role = 'primary'; // Primary role takes precedence
        muscleVolumes.set(muscleId, existing);
      });

      // Secondary muscles get 40% of the volume
      exercise.secondaryMuscles?.forEach(muscleId => {
        const existing = muscleVolumes.get(muscleId) || { primary: 0, secondary: 0, role: 'secondary' as const };
        existing.secondary += exerciseVolume * 0.4;
        // Keep existing role if already set as primary
        if (existing.role !== 'primary') {
          existing.role = 'secondary';
        }
        muscleVolumes.set(muscleId, existing);
      });
    });

    // Convert volumes to fatigue percentages
    const impacts: MuscleWorkoutImpact[] = [];
    
    muscleVolumes.forEach((volumes, muscleId) => {
      const totalVolume = volumes.primary + volumes.secondary;
      const muscleSize = this.getMuscleSize(muscleId);
      const fatiguePercentage = this.normalizeVolumeToFatigue(totalVolume, muscleSize);
      
      impacts.push({
        muscleId,
        fatigueAdded: fatiguePercentage,
        role: volumes.role,
        volumeLifted: totalVolume
      });
    });

    return impacts;
  }

  /**
   * Update muscle states after a workout
   */
  async updateMuscleStates(impacts: MuscleWorkoutImpact[]): Promise<void> {
    const currentStates = await this.getAllMuscleStates();
    const now = new Date();

    for (const impact of impacts) {
      const currentState = currentStates.get(impact.muscleId);
      
      // Calculate new fatigue level
      let newFatigue = impact.fatigueAdded;
      
      if (currentState) {
        // Apply recovery since last workout
        const recoveredFatigue = this.calculateRecovery(
          currentState.currentFatigue,
          currentState.lastUpdated,
          now
        );
        newFatigue = Math.min(100, recoveredFatigue + impact.fatigueAdded);
      }

      const newState: MuscleState = {
        muscleId: impact.muscleId,
        currentFatigue: newFatigue,
        lastUpdated: now,
        lastWorkoutRole: impact.role
      };

      console.log('Attempting to save muscle state:', {
        state: newState,
        muscleIdType: typeof impact.muscleId,
        dateType: typeof now,
        isValidDate: now instanceof Date,
        keyToUse: impact.muscleId.toString()
      });

      // await database.saveMuscleState(newState);
    }
  }

  /**
   * Calculate recovery based on time elapsed
   */
  private calculateRecovery(
    currentFatigue: number,
    lastUpdated: Date,
    now: Date
  ): number {
    const hoursElapsed = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    // Simple recovery: 50% recovery per 24 hours
    const recoveryRate = 0.5;
    const dailyRecovery = currentFatigue * recoveryRate;
    const recovery = (dailyRecovery / 24) * hoursElapsed;
    
    return Math.max(0, currentFatigue - recovery);
  }

  /**
   * Get all current muscle states
   */
  async getAllMuscleStates(): Promise<Map<number, MuscleState>> {
    const states = await database.getAllMuscleStates();
    const stateMap = new Map<number, MuscleState>();
    const now = new Date();

    states.forEach(state => {
      // Apply recovery calculation
      const recoveredFatigue = this.calculateRecovery(
        state.currentFatigue,
        state.lastUpdated,
        now
      );
      
      stateMap.set(state.muscleId, {
        ...state,
        currentFatigue: recoveredFatigue
      });
    });

    return stateMap;
  }

  /**
   * Convert muscle states to display states for the body map
   */
  async getMuscleDisplayStates(): Promise<Map<number, MuscleDisplayState>> {
    const muscleStates = await this.getAllMuscleStates();
    const displayStates = new Map<number, MuscleDisplayState>();

    muscleStates.forEach((state, muscleId) => {
      const { color, label } = this.getFatigueDisplay(state.currentFatigue, muscleId);
      
      displayStates.set(muscleId, {
        color,
        intensity: state.currentFatigue / 100,
        label
      });
    });

    return displayStates;
  }

  /**
   * Get color and label based on fatigue level
   */
  private getFatigueDisplay(fatigue: number, muscleId?: number): { color: string; label: string } {
    // Special case: Heart muscle should always be red
    if (muscleId === 210) {
      return { color: '#e74c3c', label: 'Heart' };
    }
    
    if (fatigue >= 75) {
      return { color: '#dc2626', label: 'Very Fatigued' }; // Red
    } else if (fatigue >= 50) {
      return { color: '#f59e0b', label: 'Fatigued' }; // Amber
    } else if (fatigue >= 25) {
      return { color: '#eab308', label: 'Recovering' }; // Yellow
    } else if (fatigue > 0) {
      return { color: '#22c55e', label: 'Nearly Recovered' }; // Green
    }
    return { color: '#92949c', label: 'Fresh' }; // Default muscle color (was 'transparent')
  }

  /**
   * Get display states for specific muscles (e.g., for exercise preview)
   */
  getMuscleActivationDisplay(
    primaryMuscles: number[],
    secondaryMuscles: number[] = []
  ): Map<number, MuscleDisplayState> {
    const displayStates = new Map<number, MuscleDisplayState>();

    primaryMuscles.forEach(muscleId => {
      displayStates.set(muscleId, {
        color: '#dc2626', // Red for primary
        intensity: 0.8,
        label: 'Primary'
      });
    });

    secondaryMuscles.forEach(muscleId => {
      displayStates.set(muscleId, {
        color: '#f59e0b', // Amber for secondary
        intensity: 0.5,
        label: 'Secondary'
      });
    });

    return displayStates;
  }
}

export const muscleStateService = MuscleStateService.getInstance();