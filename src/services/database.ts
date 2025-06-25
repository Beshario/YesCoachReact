// src/services/database.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Workout, MuscleState, UserProfile } from '../types/models';

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
}

class DatabaseService {
  private db: IDBPDatabase<YesCoachDB> | null = null;

  async init() {
    this.db = await openDB<YesCoachDB>('yescoach-db', 1, {
      upgrade(db) {
        // Create object stores
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
        workoutStore.createIndex('by-date', 'date');
        
        db.createObjectStore('muscleStates', { keyPath: 'muscleId' });
        db.createObjectStore('userProfile', { keyPath: 'id' });
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