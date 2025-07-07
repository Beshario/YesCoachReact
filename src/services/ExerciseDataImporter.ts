// src/services/ExerciseDataImporter.ts
import { db } from './database';
import { ExerciseInfo, ExerciseRelationships, ExerciseLink } from '../types/ExerciseTypes';

export class ExerciseDataImporter {
  
  async importFromJsonFile(filePath: string): Promise<void> {
    try {
      console.log('📦 Starting exercise data import...');
      
      // Fetch the data (for web environment, we need to serve this as a static file)
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch exercise data: ${response.statusText}`);
      }
      
      const exercises: ExerciseInfo[] = await response.json();
      console.log(`📊 Found ${exercises.length} exercises to import`);
      
      await this.importExercises(exercises);
      
    } catch (error) {
      console.error('❌ Failed to import exercise data:', error);
      throw error;
    }
  }
  
  async importExercises(exercises: ExerciseInfo[]): Promise<void> {
    console.log('🔄 Importing exercises into database...');
    
    // Initialize database
    await db.init();
    
    // Clear existing data (optional - comment out to preserve existing data)
    // await this.clearExistingData();
    
    // Import exercises
    let importedCount = 0;
    const batchSize = 50; // Process in batches for better performance
    
    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize);
      console.log(`📝 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(exercises.length/batchSize)}...`);
      
      for (const exercise of batch) {
        try {
          await db.saveExercise(exercise);
          importedCount++;
        } catch (error) {
          console.warn(`⚠️ Failed to import exercise ${exercise.name}:`, error);
        }
      }
    }
    
    console.log(`✅ Imported ${importedCount}/${exercises.length} exercises`);
    
    // Build performance indexes
    await this.buildPerformanceIndexes(exercises);
    
    // Generate relationships
    await this.generateRelationships(exercises);
    
    console.log('🎉 Exercise import completed successfully!');
  }
  
  private async buildPerformanceIndexes(exercises: ExerciseInfo[]): Promise<void> {
    console.log('🔍 Building performance indexes...');
    
    // Index by muscle activation
    const muscleIndexes = new Map<string, number[]>();
    
    for (const exercise of exercises) {
      // Target muscles
      for (const muscleId of exercise.muscleActivation.target) {
        const key = `target_${muscleId}`;
        if (!muscleIndexes.has(key)) muscleIndexes.set(key, []);
        muscleIndexes.get(key)!.push(exercise.id);
      }
      
      // Synergist muscles
      for (const muscleId of exercise.muscleActivation.synergists) {
        const key = `synergist_${muscleId}`;
        if (!muscleIndexes.has(key)) muscleIndexes.set(key, []);
        muscleIndexes.get(key)!.push(exercise.id);
      }
      
      // Stabilizer muscles
      for (const muscleId of exercise.muscleActivation.stabilizers) {
        const key = `stabilizer_${muscleId}`;
        if (!muscleIndexes.has(key)) muscleIndexes.set(key, []);
        muscleIndexes.get(key)!.push(exercise.id);
      }
    }
    
    // Save muscle indexes
    muscleIndexes.forEach(async (exerciseIds, muscleKey) => {
      await db.saveMuscleIndex(muscleKey, exerciseIds);
    });
    
    // Index by equipment
    const equipmentIndexes = new Map<string, number[]>();
    
    for (const exercise of exercises) {
      for (const equipment of exercise.equipment) {
        if (!equipmentIndexes.has(equipment)) equipmentIndexes.set(equipment, []);
        equipmentIndexes.get(equipment)!.push(exercise.id);
      }
    }
    
    // Save equipment indexes
    equipmentIndexes.forEach(async (exerciseIds, equipmentKey) => {
      await db.saveEquipmentIndex(equipmentKey, exerciseIds);
    });
    
    console.log(`✅ Built ${muscleIndexes.size} muscle indexes and ${equipmentIndexes.size} equipment indexes`);
  }
  
  private async generateRelationships(exercises: ExerciseInfo[]): Promise<void> {
    console.log('🔗 Generating exercise relationships...');
    
    let relationshipsGenerated = 0;
    
    for (const exercise of exercises) {
      const relationships = this.calculateRelationships(exercise, exercises);
      
      if (relationships.alternatives.length > 0) {
        await db.saveExerciseRelationships(exercise.id, relationships);
        relationshipsGenerated++;
      }
    }
    
    console.log(`✅ Generated relationships for ${relationshipsGenerated} exercises`);
  }
  
  private calculateRelationships(exercise: ExerciseInfo, allExercises: ExerciseInfo[]): ExerciseRelationships {
    const alternatives: ExerciseLink[] = [];
    const progressions: ExerciseLink[] = [];
    const regressions: ExerciseLink[] = [];
    const antagonists: ExerciseLink[] = [];
    
    for (const other of allExercises) {
      if (other.id === exercise.id) continue;
      
      const similarity = this.calculateSimilarity(exercise, other);
      
      // High similarity = alternative (80%+ muscle overlap)
      if (similarity >= 0.8) {
        alternatives.push({
          exerciseId: other.id,
          similarity,
          difficultyDelta: this.calculateDifficultyDelta(exercise.difficulty, other.difficulty),
          context: 'equipment',
          reason: 'Similar muscle activation pattern'
        });
      }
      
      // Progression/regression based on difficulty
      if (similarity >= 0.7) { // Same movement pattern
        if (other.difficulty === 'advanced' && exercise.difficulty === 'intermediate') {
          progressions.push({
            exerciseId: other.id,
            similarity,
            difficultyDelta: 25,
            context: 'difficulty',
            reason: 'Advanced variation'
          });
        } else if (other.difficulty === 'intermediate' && exercise.difficulty === 'advanced') {
          regressions.push({
            exerciseId: other.id,
            similarity,
            difficultyDelta: -25,
            context: 'difficulty',
            reason: 'Easier variation'
          });
        } else if (other.difficulty === 'beginner' && exercise.difficulty === 'intermediate') {
          regressions.push({
            exerciseId: other.id,
            similarity,
            difficultyDelta: -25,
            context: 'difficulty',
            reason: 'Beginner variation'
          });
        } else if (other.difficulty === 'intermediate' && exercise.difficulty === 'beginner') {
          progressions.push({
            exerciseId: other.id,
            similarity,
            difficultyDelta: 25,
            context: 'difficulty',
            reason: 'Intermediate variation'
          });
        }
      }
    }
    
    // Limit results for performance
    return {
      alternatives: alternatives.slice(0, 5),
      progressions: progressions.slice(0, 3),
      regressions: regressions.slice(0, 3),
      antagonists: antagonists.slice(0, 2)
    };
  }
  
  private calculateSimilarity(exercise1: ExerciseInfo, exercise2: ExerciseInfo): number {
    // Calculate muscle overlap
    const targetOverlap = this.calculateArrayOverlap(
      exercise1.muscleActivation.target,
      exercise2.muscleActivation.target
    );
    
    const synergistOverlap = this.calculateArrayOverlap(
      exercise1.muscleActivation.synergists,
      exercise2.muscleActivation.synergists
    );
    
    // Weight target muscles more heavily
    const muscleScore = (targetOverlap * 0.7) + (synergistOverlap * 0.3);
    
    // Bonus for same movement pattern and mechanics
    let bonus = 0;
    if (exercise1.movementPattern === exercise2.movementPattern) bonus += 0.1;
    if (exercise1.mechanics === exercise2.mechanics) bonus += 0.1;
    if (exercise1.force === exercise2.force) bonus += 0.05;
    
    return Math.min(muscleScore + bonus, 1.0);
  }
  
  private calculateArrayOverlap(arr1: number[], arr2: number[]): number {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return intersection.size / union.size;
  }
  
  private async clearExistingData(): Promise<void> {
    console.log('🗑️ Clearing existing exercise data...');
    // This would clear the stores - implement if needed
    // For now, we'll just overwrite existing data
  }
  
  async getImportStatus(): Promise<{
    exerciseCount: number;
    relationshipCount: number;
    indexCount: number;
  }> {
    await db.init();
    
    const exercises = await db.getAllExercises();
    
    // Count relationships (this is a rough estimate)
    let relationshipCount = 0;
    for (const exercise of exercises.slice(0, 10)) { // Sample first 10
      const relationships = await db.getExerciseRelationships(exercise.id);
      if (relationships) relationshipCount++;
    }
    relationshipCount = Math.round((relationshipCount / 10) * exercises.length);
    
    return {
      exerciseCount: exercises.length,
      relationshipCount,
      indexCount: 0 // Would need to count index entries
    };
  }

  private calculateDifficultyDelta(fromDifficulty: string, toDifficulty: string): number {
    const difficultyMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const from = difficultyMap[fromDifficulty as keyof typeof difficultyMap] || 2;
    const to = difficultyMap[toDifficulty as keyof typeof difficultyMap] || 2;
    return ((to - from) / 2) * 50; // -50 to +50 range
  }
}

export const exerciseDataImporter = new ExerciseDataImporter();