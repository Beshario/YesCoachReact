// Exercise Service
// High-level API for exercise database operations optimized for mobile performance

import { db } from './database';
import { exerciseDataImporter } from './ExerciseDataImporter';
import { preferencesService } from './preferencesService';
import { ExerciseInfo, ExerciseSearchQuery, ExerciseSearchResult, ExerciseRelationships, DifficultyLevel, EquipmentType, MovementPattern, TrainingType } from '../types/ExerciseTypes';
import { SortType } from '../types/models';
import { getMuscleById, getChildMuscles } from '../components/BodyMap/MuscleData';

export class ExerciseService {
  private isInitialized = false;

  /**
   * Initialize the exercise database (import data if needed)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const existingExercises = await db.getAllExercises();
    
    if (existingExercises.length === 0) {
      console.log('📚 No exercises found in database, importing...');
      await exerciseDataImporter.importFromJsonFile('/data/exercises.json');
      console.log('✅ Exercise database initialized');
    } else {
      console.log(`📚 Exercise database already loaded with ${existingExercises.length} exercises`);
    }

    this.isInitialized = true;
  }

  /**
   * Get exercise by ID
   */
  async getExercise(id: number): Promise<ExerciseInfo | null> {
    await this.initialize();
    const exercise = await db.getExercise(id);
    return exercise || null;
  }

  /**
   * Get exercises targeting specific muscle(s) - optimized for body map clicks
   * Supports parent/child muscle expansion based on user preferences
   */
  async getExercisesForMuscle(
    muscleId: number, 
    activationType: 'target' | 'synergist' | 'stabilizer' = 'target',
    options?: {
      difficulty?: DifficultyLevel[];
      equipment?: EquipmentType[];
      limit?: number;
      sortBy?: SortType;
    }
  ): Promise<ExerciseInfo[]> {
    await this.initialize();
    
    // Get user preferences
    const userPrefs = await preferencesService.getUserPreferences();
    
    // Collect all muscle IDs to query
    const muscleIds = [muscleId];
    
    // Add child muscles if user preference is enabled
    if (userPrefs.autoExpandChildMuscles) {
      const muscle = getMuscleById(muscleId);
      if (muscle?.children && muscle.children.length > 0) {
        muscleIds.push(...muscle.children);
      }
    }
    
    // Get exercises for all relevant muscles
    const allExercises = new Map<number, ExerciseInfo>();
    
    for (const id of muscleIds) {
      const muscleExercises = await db.getExercisesByMuscle(id, activationType);
      
      // Add exercises to map to avoid duplicates
      muscleExercises.forEach(exercise => {
        allExercises.set(exercise.id, exercise);
      });
    }
    
    let exercises = Array.from(allExercises.values());

    // Apply filters
    if (options?.difficulty) {
      exercises = exercises.filter(ex => options.difficulty!.includes(ex.difficulty));
    }

    if (options?.equipment) {
      exercises = exercises.filter(ex => 
        ex.equipment.some(eq => options.equipment!.includes(eq))
      );
    }

    // Apply sorting
    const sortBy = options?.sortBy || userPrefs.defaultSortBy;
    exercises = this.sortExercises(exercises, sortBy, muscleId);

    // Limit results for mobile performance
    if (options?.limit) {
      exercises = exercises.slice(0, options.limit);
    }

    return exercises;
  }

  /**
   * Get alternative exercises for equipment substitution
   */
  async getAlternatives(
    exerciseId: number, 
    context?: 'equipment' | 'difficulty' | 'injury'
  ): Promise<ExerciseInfo[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const alternativeIds = (relationships.alternatives || []).map(link => link.exerciseId);

    // Get exercise details
    const alternatives: ExerciseInfo[] = [];
    for (const id of alternativeIds) {
      const exercise = await db.getExercise(id);
      if (exercise) alternatives.push(exercise);
    }

    return alternatives;
  }

  /**
   * Get exercise progressions for strength building
   */
  async getProgressions(exerciseId: number): Promise<ExerciseInfo[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const progressionIds = (relationships.progressions || []).map(link => link.exerciseId);
    
    const progressions: ExerciseInfo[] = [];
    for (const id of progressionIds) {
      const exercise = await db.getExercise(id);
      if (exercise) progressions.push(exercise);
    }

    return progressions;
  }

  /**
   * Get exercise regressions for easier variations
   */
  async getRegressions(exerciseId: number): Promise<ExerciseInfo[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const regressionIds = (relationships.regressions || []).map(link => link.exerciseId);
    
    const regressions: ExerciseInfo[] = [];
    for (const id of regressionIds) {
      const exercise = await db.getExercise(id);
      if (exercise) regressions.push(exercise);
    }

    return regressions;
  }

  /**
   * Smart exercise search with scoring
   */
  async searchExercises(query: ExerciseSearchQuery): Promise<ExerciseSearchResult[]> {
    await this.initialize();
    
    let candidates: ExerciseInfo[] = [];

    // Start with muscle-based search if specified
    if (query.muscleIds && query.muscleIds.length > 0) {
      const muscleResults = new Set<ExerciseInfo>();
      
      for (const muscleId of query.muscleIds) {
        const exercises = await this.getExercisesForMuscle(muscleId, 'target');
        exercises.forEach(ex => muscleResults.add(ex));
      }
      
      candidates = Array.from(muscleResults);
    } else {
      // Get all exercises for general search
      candidates = await db.getAllExercises();
    }

    // Apply filters
    if (query.equipment) {
      candidates = candidates.filter(ex => 
        ex.equipment.some(eq => query.equipment!.includes(eq))
      );
    }

    if (query.difficulty) {
      candidates = candidates.filter(ex => 
        query.difficulty!.includes(ex.difficulty)
      );
    }

    if (query.trainingTypes) {
      candidates = candidates.filter(ex => 
        ex.trainingTypes.some(type => query.trainingTypes!.includes(type))
      );
    }

    if (query.movementPatterns) {
      candidates = candidates.filter(ex => 
        query.movementPatterns!.includes(ex.movementPattern)
      );
    }

    if (query.excludeExerciseIds) {
      candidates = candidates.filter(ex => 
        !query.excludeExerciseIds!.includes(ex.id)
      );
    }

    // Text search
    if (query.name) {
      const searchTerm = query.name.toLowerCase();
      candidates = candidates.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm) ||
        ex.searchTags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Calculate relevance scores
    const results: ExerciseSearchResult[] = candidates.map(exercise => {
      const relevanceScore = this.calculateRelevanceScore(exercise, query);
      const muscleMatchCount = query.muscleIds ? 
        this.countMuscleMatches(exercise, query.muscleIds) : 0;
      const missingEquipment = this.findMissingEquipment(exercise, query.equipment || []);

      return {
        exercise,
        relevanceScore,
        muscleMatchCount,
        missingEquipment
      };
    });

    // Sort by relevance and return
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50); // Limit for mobile performance
  }

  /**
   * Get exercises by equipment availability
   */
  async getExercisesByEquipment(availableEquipment: EquipmentType[]): Promise<ExerciseInfo[]> {
    await this.initialize();
    return await db.getExercisesByEquipment(availableEquipment);
  }

  /**
   * Get exercises by difficulty level
   */
  async getExercisesByDifficulty(difficulty: DifficultyLevel): Promise<ExerciseInfo[]> {
    await this.initialize();
    return await db.getExercisesByDifficulty(difficulty);
  }

  /**
   * Quick text search across exercise names and tags
   */
  async quickSearch(searchTerm: string, limit: number = 20): Promise<ExerciseInfo[]> {
    await this.initialize();
    const results = await db.searchExercises(searchTerm);
    return results.slice(0, limit);
  }

  /**
   * Get antagonist exercises for balanced training
   */
  async getAntagonists(exerciseId: number): Promise<ExerciseInfo[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const antagonistIds = (relationships.antagonists || []).map(link => link.exerciseId);
    
    const antagonists: ExerciseInfo[] = [];
    for (const id of antagonistIds) {
      const exercise = await db.getExercise(id);
      if (exercise) antagonists.push(exercise);
    }

    return antagonists;
  }

  /**
   * Get comprehensive exercise recommendations for workout planning
   */
  async getRecommendations(
    targetMuscles: number[],
    availableEquipment: EquipmentType[],
    userLevel: DifficultyLevel,
    excludeExercises: number[] = []
  ): Promise<{
    primary: ExerciseInfo[];
    alternatives: ExerciseInfo[];
    antagonists: ExerciseInfo[];
  }> {
    await this.initialize();

    const primary: ExerciseInfo[] = [];
    const alternatives: ExerciseInfo[] = [];
    const antagonists: ExerciseInfo[] = [];

    // Get primary exercises for each target muscle
    for (const muscleId of targetMuscles) {
      const exercises = await this.getExercisesForMuscle(muscleId, 'target', {
        difficulty: [userLevel],
        equipment: availableEquipment,
        limit: 3
      });

      const filtered = exercises.filter(ex => !excludeExercises.includes(ex.id));
      primary.push(...filtered);
    }

    // Get alternatives for the first primary exercise
    if (primary.length > 0) {
      const alts = await this.getAlternatives(primary[0].id, 'equipment');
      alternatives.push(...alts.slice(0, 3));
    }

    // Get antagonists for balanced training
    if (primary.length > 0) {
      const ants = await this.getAntagonists(primary[0].id);
      antagonists.push(...ants.slice(0, 2));
    }

    return { primary, alternatives, antagonists };
  }

  /**
   * Private helper methods
   */
  private calculateRelevanceScore(exercise: ExerciseInfo, query: ExerciseSearchQuery): number {
    let score = 0;

    // Muscle match scoring
    if (query.muscleIds) {
      const muscleMatches = this.countMuscleMatches(exercise, query.muscleIds);
      score += muscleMatches * 0.4;
    }

    // Equipment match scoring
    if (query.equipment) {
      const equipmentMatches = exercise.equipment.filter(eq => 
        query.equipment!.includes(eq)
      ).length;
      score += equipmentMatches * 0.2;
    }

    // Difficulty match scoring
    if (query.difficulty && query.difficulty.includes(exercise.difficulty)) {
      score += 0.2;
    }

    // Training type match scoring
    if (query.trainingTypes) {
      const typeMatches = exercise.trainingTypes.filter(type => 
        query.trainingTypes!.includes(type)
      ).length;
      score += typeMatches * 0.1;
    }

    // Movement pattern match scoring
    if (query.movementPatterns && query.movementPatterns.includes(exercise.movementPattern)) {
      score += 0.1;
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  private countMuscleMatches(exercise: ExerciseInfo, targetMuscles: number[]): number {
    const allExerciseMuscles = [
      ...exercise.muscleActivation.target,
      ...exercise.muscleActivation.synergists,
      ...exercise.muscleActivation.stabilizers
    ];

    return targetMuscles.filter(muscle => allExerciseMuscles.includes(muscle)).length;
  }

  private findMissingEquipment(exercise: ExerciseInfo, availableEquipment: EquipmentType[]): EquipmentType[] {
    return exercise.equipment.filter(eq => !availableEquipment.includes(eq));
  }

  /**
   * Sort exercises based on user preference and context
   */
  private sortExercises(exercises: ExerciseInfo[], sortBy: SortType, selectedMuscleId?: number): ExerciseInfo[] {
    switch (sortBy) {
      case 'relevance':
        return exercises.sort((a, b) => {
          if (!selectedMuscleId) return 0;
          
          const aRelevance = this.getMuscleRelevanceScore(a, selectedMuscleId);
          const bRelevance = this.getMuscleRelevanceScore(b, selectedMuscleId);
          
          if (aRelevance !== bRelevance) {
            return bRelevance - aRelevance; // Higher relevance first
          }
          
          // Secondary sort: compound before isolated
          if (a.mechanics !== b.mechanics) {
            return a.mechanics === 'compound' ? -1 : 1;
          }
          
          return 0;
        });
      
      case 'type':
        return exercises.sort((a, b) => {
          // Primary sort: compound vs isolated
          if (a.mechanics !== b.mechanics) {
            return a.mechanics === 'compound' ? -1 : 1;
          }
          
          // Secondary sort: utility (basic vs auxiliary)
          if (a.utility !== b.utility) {
            return a.utility === 'basic' ? -1 : 1;
          }
          
          // Tertiary sort: alphabetical
          return a.name.localeCompare(b.name);
        });
      
      case 'alphabetical':
        return exercises.sort((a, b) => a.name.localeCompare(b.name));
      
      default:
        return exercises;
    }
  }

  /**
   * Get muscle relevance score for sorting
   */
  private getMuscleRelevanceScore(exercise: ExerciseInfo, muscleId: number): number {
    if (exercise.muscleActivation.target.includes(muscleId)) {
      return 3; // Target muscle = highest relevance
    }
    if (exercise.muscleActivation.synergists.includes(muscleId)) {
      return 2; // Synergist muscle = medium relevance
    }
    if (exercise.muscleActivation.stabilizers.includes(muscleId)) {
      return 1; // Stabilizer muscle = low relevance
    }
    return 0; // No involvement = no relevance
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalExercises: number;
    byDifficulty: Record<DifficultyLevel, number>;
    byEquipment: Record<string, number>;
    musclesCovered: number;
  }> {
    await this.initialize();
    
    const allExercises = await db.getAllExercises();
    
    const byDifficulty: Record<DifficultyLevel, number> = {
      'beginner': 0,
      'intermediate': 0,
      'advanced': 0
    };
    
    const equipmentCounts: Record<string, number> = {};
    const muscleSet = new Set<number>();
    
    for (const exercise of allExercises) {
      byDifficulty[exercise.difficulty]++;
      
      for (const equipment of exercise.equipment) {
        equipmentCounts[equipment] = (equipmentCounts[equipment] || 0) + 1;
      }
      
      exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
      exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
      exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
    }
    
    return {
      totalExercises: allExercises.length,
      byDifficulty,
      byEquipment: equipmentCounts,
      musclesCovered: muscleSet.size
    };
  }
}

// Export singleton instance
export const exerciseService = new ExerciseService();