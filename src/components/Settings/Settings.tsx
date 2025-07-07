import React, { useState, useEffect } from 'react';
import { preferencesService } from '../../services/preferencesService';
import { UserPreferences, SortType, ExerciseListView } from '../../types/models';
import styles from './Settings.module.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultSortBy: 'relevance',
    showSynergistExercises: true,
    showStabilizerExercises: false,
    exerciseListView: 'compact',
    autoExpandChildMuscles: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load current preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    try {
      const userPrefs = await preferencesService.getUserPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    
    try {
      await preferencesService.updatePreferences(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // Hide success message after 2 seconds
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSaved(false);
    onClose();
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Exercise Settings</h2>
          <button onClick={handleClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Exercise Display</h3>
            
            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={preferences.autoExpandChildMuscles}
                  onChange={(e) => updatePreference('autoExpandChildMuscles', e.target.checked)}
                />
                <span className={styles.checkmark}></span>
                Show exercises for all sub-muscles
              </label>
              <p className={styles.description}>
                When selecting "Chest", also show exercises for Pectorals, Serratus Anterior, etc.
              </p>
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={preferences.showSynergistExercises}
                  onChange={(e) => updatePreference('showSynergistExercises', e.target.checked)}
                />
                <span className={styles.checkmark}></span>
                Include synergist exercises
              </label>
              <p className={styles.description}>
                Show exercises where the muscle assists the movement
              </p>
            </div>

            <div className={styles.setting}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={preferences.showStabilizerExercises}
                  onChange={(e) => updatePreference('showStabilizerExercises', e.target.checked)}
                />
                <span className={styles.checkmark}></span>
                Include stabilizer exercises
              </label>
              <p className={styles.description}>
                Show exercises where the muscle provides stability
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Default Sort Order</h3>
            
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sortBy"
                  value="relevance"
                  checked={preferences.defaultSortBy === 'relevance'}
                  onChange={(e) => updatePreference('defaultSortBy', e.target.value as SortType)}
                />
                <span className={styles.radioMark}></span>
                Most Relevant
                <p className={styles.description}>Target muscles first, then synergists</p>
              </label>
              
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sortBy"
                  value="type"
                  checked={preferences.defaultSortBy === 'type'}
                  onChange={(e) => updatePreference('defaultSortBy', e.target.value as SortType)}
                />
                <span className={styles.radioMark}></span>
                Exercise Type
                <p className={styles.description}>Compound exercises first, then isolated</p>
              </label>
              
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sortBy"
                  value="alphabetical"
                  checked={preferences.defaultSortBy === 'alphabetical'}
                  onChange={(e) => updatePreference('defaultSortBy', e.target.value as SortType)}
                />
                <span className={styles.radioMark}></span>
                Alphabetical
                <p className={styles.description}>A-Z by exercise name</p>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3>List View</h3>
            
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="listView"
                  value="compact"
                  checked={preferences.exerciseListView === 'compact'}
                  onChange={(e) => updatePreference('exerciseListView', e.target.value as ExerciseListView)}
                />
                <span className={styles.radioMark}></span>
                Compact
                <p className={styles.description}>Show more exercises on screen</p>
              </label>
              
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="listView"
                  value="detailed"
                  checked={preferences.exerciseListView === 'detailed'}
                  onChange={(e) => updatePreference('exerciseListView', e.target.value as ExerciseListView)}
                />
                <span className={styles.radioMark}></span>
                Detailed
                <p className={styles.description}>Show more information per exercise</p>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            onClick={handleClose} 
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className={styles.savedMessage}>✓ Saved!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;