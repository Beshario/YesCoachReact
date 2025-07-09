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
}

// Create singleton instance
export const simpleExerciseImporter = new SimpleExerciseImporter();