// src/services/database.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Workout, MuscleState, UserProfile } from '../types/models';
import { SimpleExercise, SimpleExerciseRelations } from '../types/SimpleExerciseTypes';

interface YesCoachDB extends DBSchema {
  workouts: {
    key: string;
    value: Workout;
    indexes: { 'by-date': Date };
  };
  muscleStates: {
    key: string; // muscle group id
    value: MuscleState;
  };
  userProfile: {
    key: string;
    value: UserProfile;
  };
  // Exercise catalog stores
  exercises: {
    key: string; // exercise ID (now string from converter)
    value: SimpleExercise;
    indexes: {
      'by-difficulty': string;
      'by-equipment': string;
      'by-category': string;
      'by-name': string;
    };
  };
  exerciseRelationships: {
    key: string; // exercise ID
    value: SimpleExerciseRelations;
  };
  // Performance indexes for mobile optimization
  exercisesByMuscle: {
    key: string; // "target_121", "synergist_141", "stabilizer_122"
    value: { muscleKey: string; exerciseIds: string[] };
  };
  exercisesByEquipment: {
    key: string; // "barbell", "dumbbell", "bodyweight"
    value: { equipmentKey: string; exerciseIds: string[] };
  };
}

class DatabaseService {
  private db: IDBPDatabase<YesCoachDB> | null = null;
  private isInitializing = false;

  async init() {
    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }
    
    if (this.db) return;
    
    this.isInitializing = true;
    
    try {
      this.db = await openDB<YesCoachDB>('yescoach-db', 5, {
        upgrade(db, oldVersion) {
          console.log(`Upgrading database from version ${oldVersion} to 5`);
          
          // If upgrade fails, we'll delete and recreate everything
          if (oldVersion > 0 && oldVersion < 5) {
            // Delete all existing stores to avoid conflicts
            const storeNames = Array.from(db.objectStoreNames);
            storeNames.forEach(name => {
              try {
                db.deleteObjectStore(name);
              } catch (e) {
                console.warn(`Failed to delete store ${name}:`, e);
              }
            });
          }
          // Create all stores fresh (after clearing existing ones above)
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
          workoutStore.createIndex('by-date', 'date');
          
          db.createObjectStore('muscleStates', { keyPath: 'muscleId' });
          db.createObjectStore('userProfile', { keyPath: 'id' });
          
          // Exercise catalog
          const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exerciseStore.createIndex('by-difficulty', 'difficulty');
          exerciseStore.createIndex('by-equipment', 'equipment', { multiEntry: true });
          exerciseStore.createIndex('by-category', 'category');
          exerciseStore.createIndex('by-name', 'name');

          // Exercise relationships
          db.createObjectStore('exerciseRelationships', { keyPath: 'exerciseId' });

          // Performance indexes
          db.createObjectStore('exercisesByMuscle', { keyPath: 'muscleKey' });
          db.createObjectStore('exercisesByEquipment', { keyPath: 'equipmentKey' });
        },
      });
    } finally {
      this.isInitializing = false;
    }
  }

  // Workout methods
  async saveWorkout(workout: Workout) {
    if (!this.db) await this.init();
    await this.db!.put('workouts', workout);
  }

  async getWorkouts(days: number = 30): Promise<Workout[]> {
    if (!this.db) await this.init();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const tx = this.db!.transaction('workouts', 'readonly');
    const index = tx.store.index('by-date');
    const range = IDBKeyRange.lowerBound(cutoffDate);
    
    return await index.getAll(range);
  }

  // Muscle state methods
  async updateMuscleState(state: MuscleState) {
    if (!this.db) await this.init();
    await this.db!.put('muscleStates', state, state.muscleId.toString());
  }

  async getMuscleStates(): Promise<MuscleState[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('muscleStates');
  }

  async getAllMuscleStates(): Promise<MuscleState[]> {
    return this.getMuscleStates();
  }

  // Exercise catalog methods
  async saveExercise(exercise: SimpleExercise) {
    if (!this.db) await this.init();
    await this.db!.put('exercises', exercise);
  }

  async getExercise(id: string): Promise<SimpleExercise | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('exercises', id);
  }

  async getAllExercises(): Promise<SimpleExercise[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('exercises');
  }

  async getExercisesByDifficulty(difficulty: string): Promise<SimpleExercise[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('exercises', 'readonly');
    const index = tx.store.index('by-difficulty');
    return await index.getAll(difficulty);
  }

  async getExercisesByEquipment(equipment: string[]): Promise<SimpleExercise[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('exercises', 'readonly');
    const index = tx.store.index('by-equipment');
    
    // Get exercises that match any of the provided equipment
    const results = new Set<SimpleExercise>();
    for (const eq of equipment) {
      const exercises = await index.getAll(eq);
      exercises.forEach(ex => results.add(ex));
    }
    return Array.from(results);
  }

  async getExercisesByMuscle(muscleId: number, activationType: 'high' | 'medium' | 'low' = 'high'): Promise<SimpleExercise[]> {
    if (!this.db) await this.init();
    const allExercises = await this.getAllExercises();
    
    // Filter exercises based on activation level for the muscle
    return allExercises.filter(exercise => {
      // First try the new precise percentage system
      if (exercise.muscleActivation && exercise.muscleActivation[muscleId]) {
        const percentage = exercise.muscleActivation[muscleId];
        
        // Convert activation type to percentage thresholds
        const thresholds = {
          'high': 0.7,    // 70% or higher
          'medium': 0.3,  // 30% or higher
          'low': 0.1      // 10% or higher
        };
        
        return percentage >= thresholds[activationType];
      }
      
      // Fallback to legacy categorical system
      const activationLevel = exercise.activationLevels[muscleId];
      if (!activationLevel) return false;
      
      // Return exercises with matching or higher activation level
      if (activationType === 'low') return true;
      if (activationType === 'medium') return activationLevel === 'medium' || activationLevel === 'high';
      if (activationType === 'high') return activationLevel === 'high';
      
      return false;
    });
  }

  async saveExerciseRelationships(relationships: SimpleExerciseRelations) {
    if (!this.db) await this.init();
    await this.db!.put('exerciseRelationships', relationships);
  }

  async getExerciseRelationships(exerciseId: string): Promise<SimpleExerciseRelations | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('exerciseRelationships', exerciseId);
  }

  // Performance index methods
  async saveMuscleIndex(muscleKey: string, exerciseIds: string[]) {
    if (!this.db) await this.init();
    await this.db!.put('exercisesByMuscle', { muscleKey, exerciseIds });
  }

  async saveEquipmentIndex(equipmentKey: string, exerciseIds: string[]) {
    if (!this.db) await this.init();
    await this.db!.put('exercisesByEquipment', { equipmentKey, exerciseIds });
  }

  async searchExercises(query: string): Promise<SimpleExercise[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('exercises', 'readonly');
    
    // Simple text search - can be enhanced with fuzzy matching
    const lowerQuery = query.toLowerCase();
    const allExercises = await tx.store.getAll();
    
    return allExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(lowerQuery) ||
      exercise.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('userProfile', userId);
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('userProfile', profile);
  }

  async deleteUserProfile(userId: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('userProfile', userId);
  }

  // Backup methods
  async exportData() {
    if (!this.db) await this.init();
    const workouts = await this.db!.getAll('workouts');
    const muscleStates = await this.db!.getAll('muscleStates');
    const profile = await this.db!.getAll('userProfile');
    
    return JSON.stringify({
      workouts,
      muscleStates,
      profile,
      exportDate: new Date()
    });
  }

  async importData(jsonData: string) {
    const data = JSON.parse(jsonData);
    // Validate and import...
  }
}

export const db = new DatabaseService();