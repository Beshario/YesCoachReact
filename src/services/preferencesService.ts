// User Preferences Service
// Handles loading, saving, and caching user preferences

import { db } from './database';
import { UserProfile, UserPreferences, SortType, ExerciseListView } from '../types/models';
import { exerciseService } from './exerciseService';

class PreferencesService {
  private cachedProfile: UserProfile | null = null;
  private readonly DEFAULT_USER_ID = 'default_user';

  /**
   * Get default preferences for new users
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      // Exercise display preferences
      defaultSortBy: 'muscle_recruitment',
      showSynergistExercises: true,
      showStabilizerExercises: false,
      exerciseListView: 'compact',
      autoExpandChildMuscles: true,
      
      // Equipment and filtering preferences
      availableEquipment: ['bodyweight'], // Start with bodyweight only
      defaultDifficultyFilter: [], // No difficulty filter by default (show all)
      autoFilterByEquipment: true, // Auto-filter by available equipment
      autoFilterByDifficulty: false, // Don't auto-filter by difficulty by default
      
      // Category tab preferences
      visibleExerciseTabs: ['strength', 'plyometrics', 'stretching', 'all'], // Show all tabs by default
      selectedExerciseTab: 'all' // Default to showing all exercises
    };
  }

  /**
   * Get default user profile for new users
   */
  private getDefaultProfile(): UserProfile {
    return {
      id: this.DEFAULT_USER_ID,
      goals: ['hypertrophy'],
      experienceLevel: 'beginner',
      injuries: [],
      preferences: this.getDefaultPreferences(),
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Get user profile with preferences
   */
  async getUserProfile(): Promise<UserProfile> {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    try {
      await db.init();
      const profile = await db.getUserProfile(this.DEFAULT_USER_ID);
      
      if (profile) {
        // Ensure profile has all latest preference fields (for migration)
        const migratedProfile = this.migrateProfile(profile);
        this.cachedProfile = migratedProfile;
        return migratedProfile;
      } else {
        // Create new default profile
        const defaultProfile = this.getDefaultProfile();
        await this.saveUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (error) {
      console.error('Failed to load user profile, using defaults:', error);
      return this.getDefaultProfile();
    }
  }

  /**
   * Get just the preferences part
   */
  async getUserPreferences(): Promise<UserPreferences> {
    const profile = await this.getUserProfile();
    return profile.preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(newPreferences: Partial<UserPreferences>): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          ...newPreferences
        },
        lastUpdated: new Date()
      };

      await this.saveUserProfile(updatedProfile);
      this.cachedProfile = updatedProfile;
      
      // Clear exercise cache when preferences change
      exerciseService.clearCache();
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Update entire user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      const updatedProfile = {
        ...profile,
        ...updates,
        lastUpdated: new Date()
      };

      await this.saveUserProfile(updatedProfile);
      this.cachedProfile = updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Save user profile to database
   */
  private async saveUserProfile(profile: UserProfile): Promise<void> {
    await db.init();
    await db.saveUserProfile(profile);
    this.cachedProfile = profile;
  }

  /**
   * Migrate profile to ensure it has all current fields
   */
  private migrateProfile(profile: UserProfile): UserProfile {
    const defaultPrefs = this.getDefaultPreferences();
    
    return {
      ...profile,
      preferences: {
        ...defaultPrefs,
        ...profile.preferences
      },
      createdAt: profile.createdAt || new Date(),
      lastUpdated: profile.lastUpdated || new Date()
    };
  }

  /**
   * Clear cached profile (useful for testing)
   */
  clearCache(): void {
    this.cachedProfile = null;
  }

  /**
   * Reset to default preferences
   */
  async resetToDefaults(): Promise<void> {
    const profile = await this.getUserProfile();
    await this.updateProfile({
      preferences: this.getDefaultPreferences()
    });
  }

  /**
   * Helper methods for specific preferences
   */
  async getSortPreference(): Promise<SortType> {
    const prefs = await this.getUserPreferences();
    return prefs.defaultSortBy;
  }

  async setSortPreference(sortBy: SortType): Promise<void> {
    await this.updatePreferences({ defaultSortBy: sortBy });
  }

  async getAutoExpandChildMuscles(): Promise<boolean> {
    const prefs = await this.getUserPreferences();
    return prefs.autoExpandChildMuscles;
  }

  async setAutoExpandChildMuscles(expand: boolean): Promise<void> {
    await this.updatePreferences({ autoExpandChildMuscles: expand });
  }

  async getExerciseDisplaySettings(): Promise<{
    showSynergists: boolean;
    showStabilizers: boolean;
    listView: ExerciseListView;
  }> {
    const prefs = await this.getUserPreferences();
    return {
      showSynergists: prefs.showSynergistExercises,
      showStabilizers: prefs.showStabilizerExercises,
      listView: prefs.exerciseListView
    };
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();