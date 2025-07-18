// Exercise Service
// High-level API for exercise database operations optimized for mobile performance

import { db } from './database';
import { simpleExerciseImporter } from './SimpleExerciseImporter';
import { preferencesService } from './preferencesService';
import { SimpleExercise } from '../types/SimpleExerciseTypes';
import { SortType, DifficultyLevel, ActivationLevel, EquipmentType } from '../types/SimpleExerciseTypes';
import { getMuscleById, getChildMuscles } from '../components/BodyMap/MuscleData';

export class ExerciseService {
  private isInitialized = false;
  private muscleExerciseCache = new Map<string, { exercises: SimpleExercise[], timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize the exercise database (import data if needed)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const existingExercises = await db.getAllExercises();
    
    // Force re-import if exercises don't have imageUrls (old data)
    const needsReimport = existingExercises.length === 0 || 
                         !existingExercises.some(ex => ex.imageUrls && ex.imageUrls.length > 0);
    
    if (needsReimport) {
      console.log('📚 Re-importing exercises with image URLs...');
      await simpleExerciseImporter.importFromConverterOutput();
      console.log('✅ Exercise database initialized with images');
    } else {
      console.log(`📚 Exercise database already loaded with ${existingExercises.length} exercises`);
    }

    this.isInitialized = true;
  }

  /**
   * Get exercise by ID
   */
  async getExercise(id: string): Promise<SimpleExercise | null> {
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
    activationType: ActivationLevel = 'high',
    options?: {
      difficulty?: DifficultyLevel[];
      equipment?: string[];
      limit?: number;
      sortBy?: SortType;
      category?: string;
    }
  ): Promise<SimpleExercise[]> {
    await this.initialize();
    
    // Create cache key including all parameters that affect results
    const userPrefs = await preferencesService.getUserPreferences();
    const cacheKey = this.createCacheKey(muscleId, activationType, options, userPrefs);
    
    // Check cache first
    const cached = this.muscleExerciseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.exercises;
    }
    
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
    const allExercises = new Map<string, SimpleExercise>();
    
    for (const id of muscleIds) {
      const muscleExercises = await db.getExercisesByMuscle(id, activationType);
      
      // Add exercises to map to avoid duplicates
      muscleExercises.forEach(exercise => {
        allExercises.set(exercise.id, exercise);
      });
    }
    
    
    let exercises = Array.from(allExercises.values());

    // Apply category filter if specified
    if (options?.category && options.category !== 'all') {
      exercises = exercises.filter(ex => ex.category === options.category);
    }

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

    // Cache the results
    this.muscleExerciseCache.set(cacheKey, {
      exercises,
      timestamp: Date.now()
    });

    return exercises;
  }

  /**
   * Get similar exercises (same movement pattern, different equipment/setup)
   */
  async getSimilar(exerciseId: string): Promise<SimpleExercise[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const similarIds = relationships.similar || [];

    // Get exercise details
    const similar: SimpleExercise[] = [];
    for (const id of similarIds) {
      const exercise = await db.getExercise(id);
      if (exercise) similar.push(exercise);
    }

    return similar;
  }

  /**
   * Get alternative exercises for equipment substitution
   */
  async getAlternatives(
    exerciseId: string, 
    context?: 'equipment' | 'difficulty' | 'injury'
  ): Promise<SimpleExercise[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const alternativeIds = relationships.alternatives || [];

    // Get exercise details
    const alternatives: SimpleExercise[] = [];
    for (const id of alternativeIds) {
      const exercise = await db.getExercise(id);
      if (exercise) alternatives.push(exercise);
    }

    return alternatives;
  }

  /**
   * Get exercise progressions for strength building
   */
  async getProgressions(exerciseId: string): Promise<SimpleExercise[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const progressionIds = relationships.progressions || [];
    
    const progressions: SimpleExercise[] = [];
    for (const id of progressionIds) {
      const exercise = await db.getExercise(id);
      if (exercise) progressions.push(exercise);
    }

    return progressions;
  }

  /**
   * Get exercise regressions for easier variations
   */
  async getRegressions(exerciseId: string): Promise<SimpleExercise[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    const regressionIds = relationships.regressions || [];
    
    const regressions: SimpleExercise[] = [];
    for (const id of regressionIds) {
      const exercise = await db.getExercise(id);
      if (exercise) regressions.push(exercise);
    }

    return regressions;
  }

  /**
   * Simple exercise search (MVP version)
   */
  async searchExercises(searchTerm?: string, muscleIds?: number[], difficulty?: DifficultyLevel[], equipment?: string[]): Promise<SimpleExercise[]> {
    await this.initialize();
    
    let candidates: SimpleExercise[] = [];

    // Start with muscle-based search if specified
    if (muscleIds && muscleIds.length > 0) {
      const muscleResults = new Set<SimpleExercise>();
      
      for (const muscleId of muscleIds) {
        const exercises = await this.getExercisesForMuscle(muscleId, 'high');
        exercises.forEach(ex => muscleResults.add(ex));
      }
      
      candidates = Array.from(muscleResults);
    } else {
      // Get all exercises for general search
      candidates = await db.getAllExercises();
    }

    // Apply filters
    if (equipment) {
      candidates = candidates.filter(ex => 
        ex.equipment.some(eq => equipment.includes(eq))
      );
    }

    if (difficulty) {
      candidates = candidates.filter(ex => 
        difficulty.includes(ex.difficulty)
      );
    }

    // Apply text search if provided
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      candidates = candidates.filter(ex => 
        ex.name.toLowerCase().includes(searchTermLower) ||
        ex.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    }

    return candidates.slice(0, 50); // Limit for performance
  }

  /**
   * Get exercises by equipment availability
   */
  async getExercisesByEquipment(availableEquipment: EquipmentType[]): Promise<SimpleExercise[]> {
    await this.initialize();
    return await db.getExercisesByEquipment(availableEquipment);
  }

  /**
   * Get exercises by difficulty level
   */
  async getExercisesByDifficulty(difficulty: DifficultyLevel): Promise<SimpleExercise[]> {
    await this.initialize();
    return await db.getExercisesByDifficulty(difficulty);
  }

  /**
   * Quick text search across exercise names and tags
   */
  async quickSearch(searchTerm: string, limit: number = 20): Promise<SimpleExercise[]> {
    await this.initialize();
    const results = await db.searchExercises(searchTerm);
    return results.slice(0, limit);
  }

  /**
   * Get antagonist exercises for balanced training
   */
  async getAntagonists(exerciseId: string): Promise<SimpleExercise[]> {
    await this.initialize();
    
    const relationships = await db.getExerciseRelationships(exerciseId);
    if (!relationships) return [];

    // SimpleExerciseRelations doesn't have antagonists, use alternatives for now
    const antagonistIds = relationships.alternatives || [];
    
    const antagonists: SimpleExercise[] = [];
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
    excludeExercises: string[] = []
  ): Promise<{
    primary: SimpleExercise[];
    alternatives: SimpleExercise[];
    antagonists: SimpleExercise[];
  }> {
    await this.initialize();

    const primary: SimpleExercise[] = [];
    const alternatives: SimpleExercise[] = [];
    const antagonists: SimpleExercise[] = [];

    // Get primary exercises for each target muscle
    for (const muscleId of targetMuscles) {
      const exercises = await this.getExercisesForMuscle(muscleId, 'high', {
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
   * Clear exercise cache - call when preferences change
   */
  clearCache(): void {
    this.muscleExerciseCache.clear();
  }

  /**
   * Create cache key for muscle exercise queries
   */
  private createCacheKey(
    muscleId: number, 
    activationType: ActivationLevel, 
    options: any, 
    userPrefs: any
  ): string {
    const key = JSON.stringify({
      muscleId,
      activationType,
      category: options?.category,
      difficulty: options?.difficulty?.sort(),
      equipment: options?.equipment?.sort(),
      limit: options?.limit,
      sortBy: options?.sortBy || userPrefs.defaultSortBy,
      autoExpandChildMuscles: userPrefs.autoExpandChildMuscles,
      autoFilterByEquipment: userPrefs.autoFilterByEquipment,
      autoFilterByDifficulty: userPrefs.autoFilterByDifficulty,
      availableEquipment: userPrefs.availableEquipment?.sort(),
      defaultDifficultyFilter: userPrefs.defaultDifficultyFilter?.sort()
    });
    return key;
  }

  /**
   * Private helper methods
   */

  private countMuscleMatches(exercise: SimpleExercise, targetMuscles: number[]): number {
    const allExerciseMuscles = [
      ...exercise.primaryMuscles,
      ...exercise.secondaryMuscles
    ];

    return targetMuscles.filter(muscle => allExerciseMuscles.includes(muscle)).length;
  }

  private findMissingEquipment(exercise: SimpleExercise, availableEquipment: EquipmentType[]): EquipmentType[] {
    return exercise.equipment.filter(eq => !availableEquipment.includes(eq));
  }

  /**
   * Sort exercises based on user preference and context
   */
  private sortExercises(exercises: SimpleExercise[], sortBy: SortType, selectedMuscleId?: number): SimpleExercise[] {
    switch (sortBy) {
      case 'muscle_recruitment':
        return exercises.sort((a, b) => {
          // Count total recruited muscles (primary + secondary + activation levels)
          const aMuscleCount = this.getTotalMuscleCount(a);
          const bMuscleCount = this.getTotalMuscleCount(b);
          
          if (aMuscleCount !== bMuscleCount) {
            return bMuscleCount - aMuscleCount; // Higher muscle count first
          }
          
          // Secondary sort: compound before isolated
          const aIsCompound = a.tags.includes('compound');
          const bIsCompound = b.tags.includes('compound');
          
          if (aIsCompound && !bIsCompound) return -1;
          if (!aIsCompound && bIsCompound) return 1;
          
          // Tertiary sort: alphabetical
          return a.name.localeCompare(b.name);
        });
      
      case 'relevance':
        return exercises.sort((a, b) => {
          if (!selectedMuscleId) return 0;
          
          const aRelevance = this.getMuscleRelevanceScore(a, selectedMuscleId);
          const bRelevance = this.getMuscleRelevanceScore(b, selectedMuscleId);
          
          if (aRelevance !== bRelevance) {
            return bRelevance - aRelevance; // Higher relevance first
          }
          
          // Secondary sort: compound before isolated (based on tags)
          const aIsCompound = a.tags.includes('compound');
          const bIsCompound = b.tags.includes('compound');
          
          if (aIsCompound && !bIsCompound) return -1;
          if (!aIsCompound && bIsCompound) return 1;
          
          return 0;
        });
      
      case 'type':
        return exercises.sort((a, b) => {
          // Sort by compound/isolation based on tags
          const aIsCompound = a.tags.includes('compound');
          const bIsCompound = b.tags.includes('compound');
          
          if (aIsCompound && !bIsCompound) return -1;
          if (!aIsCompound && bIsCompound) return 1;
          
          // Secondary sort by category
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
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
   * Get total muscle recruitment count for sorting
   */
  private getTotalMuscleCount(exercise: SimpleExercise): number {
    // Use the new muscleActivation field if available (more accurate)
    if (exercise.muscleActivation && Object.keys(exercise.muscleActivation).length > 0) {
      return Object.keys(exercise.muscleActivation).length;
    }
    
    // Fallback to legacy system
    const allMuscles = new Set([
      ...exercise.primaryMuscles,
      ...exercise.secondaryMuscles,
      ...Object.keys(exercise.activationLevels).map(id => parseInt(id))
    ]);
    
    return allMuscles.size;
  }

  /**
   * Get muscle relevance score for sorting
   */
  private getMuscleRelevanceScore(exercise: SimpleExercise, muscleId: number): number {
    if (exercise.primaryMuscles.includes(muscleId)) {
      return 3; // Primary muscle = highest relevance
    }
    if (exercise.secondaryMuscles.includes(muscleId)) {
      return 2; // Secondary muscle = medium relevance
    }
    // Check activation levels for more precise scoring
    if (exercise.activationLevels[muscleId] === 'high') {
      return 3;
    }
    if (exercise.activationLevels[muscleId] === 'medium') {
      return 2;
    }
    if (exercise.activationLevels[muscleId] === 'low') {
      return 1;
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
      
      exercise.primaryMuscles.forEach(m => muscleSet.add(m));
      exercise.secondaryMuscles.forEach(m => muscleSet.add(m));
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