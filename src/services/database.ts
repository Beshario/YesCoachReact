// src/services/database.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Workout, MuscleState, UserProfile } from '../types/models';
import { ExerciseInfo, ExerciseRelationships, DifficultyLevel, EquipmentType, MovementPattern } from '../types/ExerciseTypes';

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
    key: number; // exercise ID
    value: ExerciseInfo;
    indexes: {
      'by-difficulty': DifficultyLevel;
      'by-equipment': EquipmentType;
      'by-movement': MovementPattern;
      'by-name': string;
    };
  };
  exerciseRelationships: {
    key: number; // exercise ID
    value: ExerciseRelationships;
  };
  // Performance indexes for mobile optimization
  exercisesByMuscle: {
    key: string; // "target_121", "synergist_141", "stabilizer_122"
    value: { muscleKey: string; exerciseIds: number[] };
  };
  exercisesByEquipment: {
    key: string; // "barbell", "dumbbell", "bodyweight"
    value: { equipmentKey: string; exerciseIds: number[] };
  };
}

class DatabaseService {
  private db: IDBPDatabase<YesCoachDB> | null = null;

  async init() {
    this.db = await openDB<YesCoachDB>('yescoach-db', 2, {
      upgrade(db, oldVersion) {
        // Version 1 stores
        if (oldVersion < 1) {
          const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
          workoutStore.createIndex('by-date', 'date');
          
          db.createObjectStore('muscleStates', { keyPath: 'muscleId' });
          db.createObjectStore('userProfile', { keyPath: 'id' });
        }

        // Version 2 stores - Exercise system
        if (oldVersion < 2) {
          // Exercise catalog
          const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exerciseStore.createIndex('by-difficulty', 'difficulty');
          exerciseStore.createIndex('by-equipment', 'equipment', { multiEntry: true });
          exerciseStore.createIndex('by-movement', 'movementPattern');
          exerciseStore.createIndex('by-name', 'name');

          // Exercise relationships
          db.createObjectStore('exerciseRelationships', { keyPath: 'exerciseId' });

          // Performance indexes
          db.createObjectStore('exercisesByMuscle', { keyPath: 'muscleKey' });
          db.createObjectStore('exercisesByEquipment', { keyPath: 'equipmentKey' });
        }
      },
    });
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
    await this.db!.put('muscleStates', state);
  }

  async getMuscleStates(): Promise<MuscleState[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('muscleStates');
  }

  // Exercise catalog methods
  async saveExercise(exercise: ExerciseInfo) {
    if (!this.db) await this.init();
    await this.db!.put('exercises', exercise);
  }

  async getExercise(id: number): Promise<ExerciseInfo | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('exercises', id);
  }

  async getAllExercises(): Promise<ExerciseInfo[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('exercises');
  }

  async getExercisesByDifficulty(difficulty: DifficultyLevel): Promise<ExerciseInfo[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('exercises', 'readonly');
    const index = tx.store.index('by-difficulty');
    return await index.getAll(difficulty);
  }

  async getExercisesByEquipment(equipment: EquipmentType[]): Promise<ExerciseInfo[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('exercises', 'readonly');
    const index = tx.store.index('by-equipment');
    
    // Get exercises that match any of the provided equipment
    const results = new Set<ExerciseInfo>();
    for (const eq of equipment) {
      const exercises = await index.getAll(eq);
      exercises.forEach(ex => results.add(ex));
    }
    return Array.from(results);
  }

  async getExercisesByMuscle(muscleId: number, activationType: 'target' | 'synergist' | 'stabilizer' = 'target'): Promise<ExerciseInfo[]> {
    if (!this.db) await this.init();
    const muscleKey = `${activationType}_${muscleId}`;
    const indexEntry = await this.db!.get('exercisesByMuscle', muscleKey);
    
    if (!indexEntry) return [];
    
    // Get exercises by specific IDs
    const exercises: ExerciseInfo[] = [];
    for (const exerciseId of indexEntry.exerciseIds) {
      const exercise = await this.db!.get('exercises', exerciseId);
      if (exercise) exercises.push(exercise);
    }
    
    return exercises;
  }

  async saveExerciseRelationships(exerciseId: number, relationships: ExerciseRelationships) {
    if (!this.db) await this.init();
    const relationshipData = { exerciseId, ...relationships };
    await this.db!.put('exerciseRelationships', relationshipData);
  }

  async getExerciseRelationships(exerciseId: number): Promise<ExerciseRelationships | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('exerciseRelationships', exerciseId);
  }

  // Performance index methods
  async saveMuscleIndex(muscleKey: string, exerciseIds: number[]) {
    if (!this.db) await this.init();
    await this.db!.put('exercisesByMuscle', { muscleKey, exerciseIds });
  }

  async saveEquipmentIndex(equipmentKey: string, exerciseIds: number[]) {
    if (!this.db) await this.init();
    await this.db!.put('exercisesByEquipment', { equipmentKey, exerciseIds });
  }

  async searchExercises(query: string): Promise<ExerciseInfo[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('exercises', 'readonly');
    const index = tx.store.index('by-name');
    
    // Simple text search - can be enhanced with fuzzy matching
    const lowerQuery = query.toLowerCase();
    const allExercises = await tx.store.getAll();
    
    return allExercises.filter(exercise => 
      exercise.name.toLowerCase().includes(lowerQuery) ||
      exercise.searchTags.some(tag => tag.toLowerCase().includes(lowerQuery))
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