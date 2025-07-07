// Exercise System Utility Functions
// Core operations for exercise database and muscle activation

import { 
  ExerciseInfo, 
  ExerciseRelationships, 
  ExerciseSearchQuery, 
  ExerciseSearchResult,
  SourceMuscleMapping,
  MuscleOverlapAnalysis,
  ExerciseIndexes,
  EquipmentType,
  DifficultyLevel,
  TrainingType,
  MovementPattern
} from '../types/ExerciseTypes';

import { 
  MuscleActivation,
  ActivationRole,
  ExerciseActivationPattern,
  ActivationSimilarity 
} from '../types/MuscleActivationTypes';

import { muscleData, MuscleInfo } from '../components/BodyMap/MuscleData';

// Exercise search and filtering utilities
export class ExerciseSearchUtils {
  
  /**
   * Search exercises by muscle targets with intelligent ranking
   */
  static findExercisesByMuscles(
    exercises: Record<number, ExerciseInfo>,
    targetMuscleIds: number[],
    role: ActivationRole = 'target'
  ): ExerciseSearchResult[] {
    const results: ExerciseSearchResult[] = [];
    
    Object.values(exercises).forEach(exercise => {
      const relevantMuscles = this.getMusclesByRole(exercise, role);
      const matchCount = targetMuscleIds.filter(id => relevantMuscles.includes(id)).length;
      
      if (matchCount > 0) {
        const relevanceScore = matchCount / targetMuscleIds.length;
        results.push({
          exercise,
          relevanceScore,
          muscleMatchCount: matchCount,
          missingEquipment: []
        });
      }
    });
    
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Filter exercises by available equipment
   */
  static filterByEquipment(
    exercises: ExerciseInfo[],
    availableEquipment: EquipmentType[]
  ): ExerciseInfo[] {
    return exercises.filter(exercise => 
      exercise.equipment.every(required => availableEquipment.includes(required))
    );
  }

  /**
   * Filter exercises by difficulty level
   */
  static filterByDifficulty(
    exercises: ExerciseInfo[],
    maxDifficulty: DifficultyLevel
  ): ExerciseInfo[] {
    const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
    const maxLevel = difficultyOrder[maxDifficulty];
    
    return exercises.filter(exercise => 
      difficultyOrder[exercise.difficulty] <= maxLevel
    );
  }

  /**
   * Get muscles by activation role from exercise
   */
  private static getMusclesByRole(exercise: ExerciseInfo, role: ActivationRole): number[] {
    switch (role) {
      case 'target': return exercise.muscleActivation.target;
      case 'synergist': return exercise.muscleActivation.synergists;
      case 'stabilizer': return exercise.muscleActivation.stabilizers;
      default: return [];
    }
  }
}

// Muscle activation analysis utilities
export class MuscleActivationUtils {
  
  /**
   * Calculate muscle overlap between two exercises
   */
  static calculateMuscleOverlap(
    exerciseA: ExerciseInfo,
    exerciseB: ExerciseInfo
  ): MuscleOverlapAnalysis {
    const targetOverlap = this.getArrayIntersection(
      exerciseA.muscleActivation.target,
      exerciseB.muscleActivation.target
    ).length;
    
    const synergistOverlap = this.getArrayIntersection(
      exerciseA.muscleActivation.synergists,
      exerciseB.muscleActivation.synergists
    ).length;
    
    const totalOverlap = targetOverlap + synergistOverlap;
    const totalMusclesA = exerciseA.muscleActivation.target.length + 
                         exerciseA.muscleActivation.synergists.length;
    
    const overlapScore = totalMusclesA > 0 ? totalOverlap / totalMusclesA : 0;
    const equipmentCompatibility = this.calculateEquipmentCompatibility(exerciseA, exerciseB);
    const difficultyGap = this.calculateDifficultyGap(exerciseA.difficulty, exerciseB.difficulty);
    
    return {
      exerciseA: exerciseA.id,
      exerciseB: exerciseB.id,
      targetOverlap,
      synergistOverlap,
      totalOverlap,
      overlapScore,
      equipmentCompatibility,
      difficultyGap
    };
  }

  /**
   * Find exercise alternatives based on muscle activation similarity
   */
  static findAlternativeExercises(
    sourceExercise: ExerciseInfo,
    exerciseDatabase: Record<number, ExerciseInfo>,
    minSimilarity: number = 0.6
  ): ExerciseInfo[] {
    const alternatives: Array<{exercise: ExerciseInfo, similarity: number}> = [];
    
    Object.values(exerciseDatabase).forEach(targetExercise => {
      if (targetExercise.id === sourceExercise.id) return;
      
      const overlap = this.calculateMuscleOverlap(sourceExercise, targetExercise);
      if (overlap.overlapScore >= minSimilarity) {
        alternatives.push({
          exercise: targetExercise,
          similarity: overlap.overlapScore
        });
      }
    });
    
    return alternatives
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.exercise);
  }

  /**
   * Calculate activation similarity for relationship discovery
   */
  static calculateActivationSimilarity(
    exerciseA: ExerciseInfo,
    exerciseB: ExerciseInfo
  ): ActivationSimilarity {
    const targetOverlap = this.getArrayIntersection(
      exerciseA.muscleActivation.target,
      exerciseB.muscleActivation.target
    );
    
    const synergistOverlap = this.getArrayIntersection(
      exerciseA.muscleActivation.synergists,
      exerciseB.muscleActivation.synergists
    );
    
    const stabilizerOverlap = this.getArrayIntersection(
      exerciseA.muscleActivation.stabilizers,
      exerciseB.muscleActivation.stabilizers
    );
    
    const mechanicsCompatibility = exerciseA.mechanics === exerciseB.mechanics ? 1 : 0;
    const forceCompatibility = exerciseA.force === exerciseB.force ? 1 : 0;
    
    // Calculate total similarity weighted by importance
    const targetWeight = 0.6;
    const synergistWeight = 0.3;
    const stabilizerWeight = 0.1;
    
    const muscleScore = (
      (targetOverlap.length / Math.max(exerciseA.muscleActivation.target.length, 1)) * targetWeight +
      (synergistOverlap.length / Math.max(exerciseA.muscleActivation.synergists.length, 1)) * synergistWeight +
      (stabilizerOverlap.length / Math.max(exerciseA.muscleActivation.stabilizers.length, 1)) * stabilizerWeight
    );
    
    const totalSimilarity = (muscleScore + mechanicsCompatibility + forceCompatibility) / 3;
    
    let substituteViability: 'excellent' | 'good' | 'fair' | 'poor';
    if (totalSimilarity >= 0.8) substituteViability = 'excellent';
    else if (totalSimilarity >= 0.6) substituteViability = 'good';
    else if (totalSimilarity >= 0.4) substituteViability = 'fair';
    else substituteViability = 'poor';
    
    return {
      exerciseA: exerciseA.id,
      exerciseB: exerciseB.id,
      targetOverlap: {
        sharedMuscles: targetOverlap,
        overlapPercentage: (targetOverlap.length / exerciseA.muscleActivation.target.length) * 100,
        intensityCorrelation: 1 // Simplified for now
      },
      synergistOverlap: {
        sharedMuscles: synergistOverlap,
        overlapPercentage: (synergistOverlap.length / Math.max(exerciseA.muscleActivation.synergists.length, 1)) * 100,
        intensityCorrelation: 1
      },
      stabilizerOverlap: {
        sharedMuscles: stabilizerOverlap,
        overlapPercentage: (stabilizerOverlap.length / Math.max(exerciseA.muscleActivation.stabilizers.length, 1)) * 100,
        intensityCorrelation: 1
      },
      mechanicsCompatibility,
      forceCompatibility,
      chainCompatibility: 1, // Simplified for now
      totalSimilarity,
      substituteViability
    };
  }

  /**
   * Array intersection helper
   */
  private static getArrayIntersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => array2.includes(item));
  }

  /**
   * Calculate equipment compatibility score
   */
  private static calculateEquipmentCompatibility(
    exerciseA: ExerciseInfo,
    exerciseB: ExerciseInfo
  ): number {
    const sharedEquipment = this.getArrayIntersection(exerciseA.equipment, exerciseB.equipment);
    const totalUniqueEquipment = new Set([...exerciseA.equipment, ...exerciseB.equipment]).size;
    return totalUniqueEquipment > 0 ? sharedEquipment.length / totalUniqueEquipment : 0;
  }

  /**
   * Calculate difficulty gap between exercises
   */
  private static calculateDifficultyGap(
    difficultyA: DifficultyLevel,
    difficultyB: DifficultyLevel
  ): number {
    const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 };
    return difficultyOrder[difficultyB] - difficultyOrder[difficultyA];
  }
}

// Exercise relationship discovery algorithms
export class RelationshipDiscovery {
  
  /**
   * Generate exercise relationships using muscle overlap analysis
   */
  static generateExerciseRelationships(
    sourceExercise: ExerciseInfo,
    exerciseDatabase: Record<number, ExerciseInfo>
  ): ExerciseRelationships {
    const alternatives: Array<{id: number, similarity: number}> = [];
    const progressions: Array<{id: number, similarity: number, difficultyDelta: number}> = [];
    const regressions: Array<{id: number, similarity: number, difficultyDelta: number}> = [];
    
    Object.values(exerciseDatabase).forEach(targetExercise => {
      if (targetExercise.id === sourceExercise.id) return;
      
      const similarity = MuscleActivationUtils.calculateActivationSimilarity(
        sourceExercise, 
        targetExercise
      );
      
      if (similarity.totalSimilarity < 0.3) return; // Too dissimilar
      
      const difficultyGap = MuscleActivationUtils['calculateDifficultyGap'](
        sourceExercise.difficulty,
        targetExercise.difficulty
      );
      
      if (Math.abs(difficultyGap) <= 0.5) {
        // Similar difficulty - alternative
        alternatives.push({
          id: targetExercise.id,
          similarity: similarity.totalSimilarity
        });
      } else if (difficultyGap > 0.5) {
        // Harder - progression
        progressions.push({
          id: targetExercise.id,
          similarity: similarity.totalSimilarity,
          difficultyDelta: difficultyGap
        });
      } else if (difficultyGap < -0.5) {
        // Easier - regression
        regressions.push({
          id: targetExercise.id,
          similarity: similarity.totalSimilarity,
          difficultyDelta: Math.abs(difficultyGap)
        });
      }
    });
    
    // Sort and limit results
    const sortBySimilarity = (a: any, b: any) => b.similarity - a.similarity;
    
    return {
      alternatives: alternatives
        .sort(sortBySimilarity)
        .slice(0, 10)
        .map(item => ({
          exerciseId: item.id,
          similarity: item.similarity,
          difficultyDelta: 0,
          context: 'muscle_pattern',
          reason: 'Similar muscle activation pattern'
        })),
      progressions: progressions
        .sort(sortBySimilarity)
        .slice(0, 5)
        .map(item => ({
          exerciseId: item.id,
          similarity: item.similarity,
          difficultyDelta: item.difficultyDelta * 100,
          context: 'difficulty',
          reason: 'Harder variation with similar muscle pattern'
        })),
      regressions: regressions
        .sort(sortBySimilarity)
        .slice(0, 5)
        .map(item => ({
          exerciseId: item.id,
          similarity: item.similarity,
          difficultyDelta: -item.difficultyDelta * 100,
          context: 'difficulty',
          reason: 'Easier variation with similar muscle pattern'
        })),
      antagonists: [] // Will be implemented based on muscle opposition patterns
    };
  }
}

// Exercise database indexing for performance
export class ExerciseIndexing {
  
  /**
   * Create performance indexes for fast exercise lookups
   */
  static createExerciseIndexes(exerciseDatabase: Record<number, ExerciseInfo>): ExerciseIndexes {
    const byMuscle: Record<number, number[]> = {};
    const byEquipment: Partial<Record<EquipmentType, number[]>> = {};
    const byMovementPattern: Partial<Record<MovementPattern, number[]>> = {};
    const byDifficulty: Partial<Record<DifficultyLevel, number[]>> = {};
    
    // Initialize indexes
    Object.values(muscleData).forEach(muscle => {
      byMuscle[muscle.id] = [];
    });
    
    Object.values(exerciseDatabase).forEach(exercise => {
      // Index by muscle activation
      exercise.muscleActivation.target.forEach(muscleId => {
        if (!byMuscle[muscleId]) byMuscle[muscleId] = [];
        byMuscle[muscleId].push(exercise.id);
      });
      
      exercise.muscleActivation.synergists.forEach(muscleId => {
        if (!byMuscle[muscleId]) byMuscle[muscleId] = [];
        byMuscle[muscleId].push(exercise.id);
      });
      
      // Index by equipment
      exercise.equipment.forEach(equipment => {
        if (!byEquipment[equipment]) byEquipment[equipment] = [];
        byEquipment[equipment]!.push(exercise.id);
      });
      
      // Index by movement pattern
      if (!byMovementPattern[exercise.movementPattern]) {
        byMovementPattern[exercise.movementPattern] = [];
      }
      byMovementPattern[exercise.movementPattern]!.push(exercise.id);
      
      // Index by difficulty
      if (!byDifficulty[exercise.difficulty]) {
        byDifficulty[exercise.difficulty] = [];
      }
      byDifficulty[exercise.difficulty]!.push(exercise.id);
    });
    
    return {
      byMuscle,
      byEquipment,
      byMovementPattern,
      byDifficulty
    };
  }
  
  /**
   * Fast exercise lookup by muscle ID
   */
  static getExercisesByMuscle(
    muscleId: number,
    indexes: ExerciseIndexes,
    role?: ActivationRole
  ): number[] {
    return indexes.byMuscle[muscleId] || [];
  }
  
  /**
   * Fast exercise lookup by equipment
   */
  static getExercisesByEquipment(
    equipment: EquipmentType,
    indexes: ExerciseIndexes
  ): number[] {
    return indexes.byEquipment[equipment] || [];
  }
}

// Muscle name mapping utilities
export class MuscleNameMapping {
  
  /**
   * Create muscle name mapping from source names to MuscleData.ts IDs
   */
  static createMuscleMapping(
    sourceMuscleNames: string[]
  ): Record<string, SourceMuscleMapping> {
    const mappings: Record<string, SourceMuscleMapping> = {};
    
    sourceMuscleNames.forEach(sourceName => {
      const muscleMatch = this.findMuscleByName(sourceName);
      if (muscleMatch) {
        mappings[sourceName] = {
          sourceName,
          muscleId: muscleMatch.id,
          confidence: muscleMatch.confidence,
          aliases: muscleMatch.aliases,
          notes: muscleMatch.notes
        };
      }
    });
    
    return mappings;
  }
  
  /**
   * Find muscle by name with fuzzy matching
   */
  private static findMuscleByName(sourceName: string): {
    id: number,
    confidence: number,
    aliases: string[],
    notes?: string
  } | null {
    const normalizedSource = sourceName.toLowerCase().trim();
    
    // Check for exact matches first
    for (const muscle of Object.values(muscleData)) {
      if (muscle.name.toLowerCase() === normalizedSource ||
          muscle.commonNames.some(name => name.toLowerCase() === normalizedSource)) {
        return {
          id: muscle.id,
          confidence: 1.0,
          aliases: muscle.commonNames
        };
      }
    }
    
    // Check for partial matches
    for (const muscle of Object.values(muscleData)) {
      if (muscle.name.toLowerCase().includes(normalizedSource) ||
          normalizedSource.includes(muscle.name.toLowerCase()) ||
          muscle.commonNames.some(name => 
            name.toLowerCase().includes(normalizedSource) ||
            normalizedSource.includes(name.toLowerCase())
          )) {
        return {
          id: muscle.id,
          confidence: 0.8,
          aliases: muscle.commonNames,
          notes: 'Partial match - please verify'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Validate muscle mapping completeness
   */
  static validateMappingCompleteness(
    mappings: Record<string, SourceMuscleMapping>
  ): {
    totalMappings: number,
    highConfidenceMappings: number,
    lowConfidenceMappings: number,
    unmappedMuscles: string[]
  } {
    const unmapped: string[] = [];
    let highConfidence = 0;
    let lowConfidence = 0;
    
    Object.entries(mappings).forEach(([sourceName, mapping]) => {
      if (mapping.confidence >= 0.9) {
        highConfidence++;
      } else if (mapping.confidence >= 0.7) {
        lowConfidence++;
      } else {
        unmapped.push(sourceName);
      }
    });
    
    return {
      totalMappings: Object.keys(mappings).length,
      highConfidenceMappings: highConfidence,
      lowConfidenceMappings: lowConfidence,
      unmappedMuscles: unmapped
    };
  }
}