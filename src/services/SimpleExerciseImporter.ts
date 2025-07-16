// SimpleExerciseImporter.ts
// Importer for MVP-format exercises from our converter

import { db } from './database';
import { SimpleExercise, SimpleExerciseRelations } from '../types/SimpleExerciseTypes';

export class SimpleExerciseImporter {
  
  /**
   * Import exercises and relationships from our converter output
   */
  async importFromConverterOutput(): Promise<void> {
    try {
      console.log('📦 Starting MVP exercise data import...');
      
      // Import exercises
      await this.importExercises();
      
      // Import relationships
      await this.importRelationships();
      
      // Build performance indexes
      await this.buildMuscleIndexes();
      
      console.log('✅ MVP exercise data import completed');
      
    } catch (error) {
      console.error('❌ Failed to import MVP exercise data:', error);
      throw error;
    }
  }
  
  /**
   * Import exercises from exercises.json
   */
  private async importExercises(): Promise<void> {
    try {
      const response = await fetch('/data/exercises.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.statusText}`);
      }
      
      const exercises: SimpleExercise[] = await response.json();
      console.log(`📊 Found ${exercises.length} exercises to import`);
      
      // Initialize database
      await db.init();
      
      // Clear existing exercises
      await this.clearExistingExercises();
      
      // Import exercises in batches
      let importedCount = 0;
      const batchSize = 50;
      
      for (let i = 0; i < exercises.length; i += batchSize) {
        const batch = exercises.slice(i, i + batchSize);
        console.log(`📝 Processing exercise batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(exercises.length/batchSize)}...`);
        
        for (const exercise of batch) {
          try {
            // Save exercise directly (database now supports SimpleExercise format)
            await db.saveExercise(exercise);
            importedCount++;
          } catch (error) {
            console.warn(`⚠️ Failed to import exercise ${exercise.name}:`, error);
          }
        }
      }
      
      console.log(`✅ Imported ${importedCount} exercises`);
      
    } catch (error) {
      console.error('❌ Failed to import exercises:', error);
      throw error;
    }
  }
  
  /**
   * Import relationships from exerciseRelationships.json
   */
  private async importRelationships(): Promise<void> {
    try {
      const response = await fetch('/data/exerciseRelationships.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch relationships: ${response.statusText}`);
      }
      
      const relationships: SimpleExerciseRelations[] = await response.json();
      console.log(`🔗 Found ${relationships.length} exercise relationships to import`);
      
      // Clear existing relationships
      await this.clearExistingRelationships();
      
      // Import relationships
      let importedCount = 0;
      
      for (const relation of relationships) {
        try {
          // Save relationships directly (database now supports SimpleExerciseRelations format)
          await db.saveExerciseRelationships(relation);
          importedCount++;
        } catch (error) {
          console.warn(`⚠️ Failed to import relationships for exercise ${relation.exerciseId}:`, error);
        }
      }
      
      console.log(`✅ Imported ${importedCount} exercise relationships`);
      
    } catch (error) {
      console.error('❌ Failed to import relationships:', error);
      throw error;
    }
  }
  
  /**
   * Clear existing exercises from database
   */
  private async clearExistingExercises(): Promise<void> {
    try {
      // Implement based on your database interface
      console.log('🗑️ Clearing existing exercises...');
      // await db.clearExercises(); // Uncomment if this method exists
    } catch (error) {
      console.warn('⚠️ Could not clear existing exercises:', error);
    }
  }
  
  /**
   * Clear existing relationships from database
   */
  private async clearExistingRelationships(): Promise<void> {
    try {
      // Implement based on your database interface
      console.log('🗑️ Clearing existing relationships...');
      // await db.clearRelationships(); // Uncomment if this method exists
    } catch (error) {
      console.warn('⚠️ Could not clear existing relationships:', error);
    }
  }

  /**
   * Build muscle indexes for fast exercise lookup
   */
  private async buildMuscleIndexes(): Promise<void> {
    try {
      console.log('🏗️ Building muscle indexes for performance...');
      
      // Get all exercises
      const exercises = await db.getAllExercises();
      
      // Create muscle-to-exercises mapping
      const muscleIndexes = new Map<string, string[]>();
      
      for (const exercise of exercises) {
        // Index by muscle activation levels
        for (const [muscleIdStr, activationLevel] of Object.entries(exercise.activationLevels)) {
          const muscleId = parseInt(muscleIdStr);
          
          // Create index keys for different activation levels
          const indexKeys = [
            `muscle_${muscleId}_${activationLevel}`, // specific level
            `muscle_${muscleId}_all` // all levels for this muscle
          ];
          
          // Also include lower activation levels in higher level queries
          if (activationLevel === 'high') {
            indexKeys.push(`muscle_${muscleId}_medium`, `muscle_${muscleId}_low`);
          } else if (activationLevel === 'medium') {
            indexKeys.push(`muscle_${muscleId}_low`);
          }
          
          for (const key of indexKeys) {
            if (!muscleIndexes.has(key)) {
              muscleIndexes.set(key, []);
            }
            const exerciseList = muscleIndexes.get(key)!;
            if (!exerciseList.includes(exercise.id)) {
              exerciseList.push(exercise.id);
            }
          }
        }
        
        // Also index by primary and secondary muscles for fallback
        for (const muscleId of exercise.primaryMuscles) {
          const key = `muscle_${muscleId}_primary`;
          if (!muscleIndexes.has(key)) {
            muscleIndexes.set(key, []);
          }
          const exerciseList = muscleIndexes.get(key)!;
          if (!exerciseList.includes(exercise.id)) {
            exerciseList.push(exercise.id);
          }
        }
        
        for (const muscleId of exercise.secondaryMuscles) {
          const key = `muscle_${muscleId}_secondary`;
          if (!muscleIndexes.has(key)) {
            muscleIndexes.set(key, []);
          }
          const exerciseList = muscleIndexes.get(key)!;
          if (!exerciseList.includes(exercise.id)) {
            exerciseList.push(exercise.id);
          }
        }
      }
      
      // Save indexes to database
      for (const [muscleKey, exerciseIds] of muscleIndexes.entries()) {
        await db.saveMuscleIndex(muscleKey, exerciseIds);
      }
      
      console.log(`✅ Built ${muscleIndexes.size} muscle indexes`);
      
    } catch (error) {
      console.error('❌ Failed to build muscle indexes:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const simpleExerciseImporter = new SimpleExerciseImporter();