import React, { useState, useEffect } from 'react';
import { exerciseService } from '../../services/exerciseService';
import { preferencesService } from '../../services/preferencesService';
import { SimpleExercise, DifficultyLevel, EquipmentType } from '../../types/SimpleExerciseTypes';
import { SortType } from '../../types/models';
import { MuscleInfo } from '../BodyMap/MuscleData';
import ExerciseCard from './ExerciseCard';
import ExerciseDetailModal from '../Exercise/ExerciseDetailModal';
import styles from './ExerciseList.module.css';

interface ExerciseListProps {
  selectedMuscle?: MuscleInfo;
  onExerciseSelect?: (exercise: SimpleExercise) => void;
  onAddToWorkout?: (exercise: SimpleExercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  selectedMuscle,
  onExerciseSelect,
  onAddToWorkout
}) => {
  const [exercises, setExercises] = useState<SimpleExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExercises, setTotalExercises] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const exercisesPerPage = 20;
  
  // Remove filter/search states - will use preferences instead
  const [selectedExercise, setSelectedExercise] = useState<SimpleExercise | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleTabs, setVisibleTabs] = useState<string[]>(['strength', 'plyometrics', 'stretching', 'all']);

  // Load user's tab preferences on mount
  useEffect(() => {
    const loadTabPreferences = async () => {
      try {
        const preferences = await preferencesService.getUserPreferences();
        setVisibleTabs(preferences.visibleExerciseTabs);
        setSelectedCategory(preferences.selectedExerciseTab);
      } catch (error) {
        console.error('Failed to load tab preferences:', error);
      }
    };
    loadTabPreferences();
  }, []);

  // Load exercises when muscle selection or category changes
  useEffect(() => {
    if (selectedMuscle) {
      setCurrentPage(1);
      setExercises([]);
      setHasMore(true);
      loadExercisesForMuscle(1, true);
    }
  }, [selectedMuscle, selectedCategory]);

  const loadExercisesForMuscle = async (page: number = currentPage, replace: boolean = false) => {
    if (!selectedMuscle) return;
    
    // Performance monitoring
    const startTime = performance.now();
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      await exerciseService.initialize();
      
      // Load user preferences
      const preferences = await preferencesService.getUserPreferences();
      
      // Get exercises for the selected muscle
      const allMuscleExercises = await exerciseService.getExercisesForMuscle(
        selectedMuscle.id,
        'high',
        {
          difficulty: preferences.autoFilterByDifficulty && preferences.defaultDifficultyFilter.length > 0 
            ? preferences.defaultDifficultyFilter as DifficultyLevel[] : undefined,
          equipment: preferences.autoFilterByEquipment && preferences.availableEquipment.length > 0 
            ? preferences.availableEquipment : undefined,
          sortBy: preferences.defaultSortBy,
          category: selectedCategory
        }
      );
      
      // Handle client-side pagination
      const startIndex = (page - 1) * exercisesPerPage;
      const endIndex = startIndex + exercisesPerPage;
      const muscleExercises = allMuscleExercises.slice(startIndex, endIndex);
      
      if (replace || page === 1) {
        setExercises(muscleExercises);
      } else {
        setExercises(prev => [...prev, ...muscleExercises]);
      }
      
      // Update pagination state
      setCurrentPage(page);
      setHasMore(endIndex < allMuscleExercises.length);
      
      // Set total count
      setTotalExercises(allMuscleExercises.length);
      
      // Performance monitoring
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`Exercise loading time: ${loadTime.toFixed(2)}ms for ${allMuscleExercises.length} exercises`);
      
    } catch (err) {
      console.error('Failed to load exercises:', err);
      setError('Failed to load exercises. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more exercises
  const loadMoreExercises = () => {
    if (!loadingMore && hasMore) {
      loadExercisesForMuscle(currentPage + 1, false);
    }
  };

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when user is within 200px of bottom
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      if (!loadingMore && hasMore) {
        loadMoreExercises();
      }
    }
  };

  // Handle exercise click
  const handleExerciseClick = (exercise: SimpleExercise) => {
    setSelectedExercise(exercise);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedExercise(null);
  };

  // Handle category tab change
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    
    // Save the selected tab to preferences
    try {
      await preferencesService.updatePreferences({ selectedExerciseTab: category });
    } catch (error) {
      console.error('Failed to save selected tab:', error);
    }
  };

  // Tab configuration
  const availableTabs = [
    { id: 'strength', label: 'Strength', icon: '💪' },
    { id: 'plyometrics', label: 'Plyometrics', icon: '⚡' },
    { id: 'stretching', label: 'Stretching', icon: '🧘' },
    { id: 'all', label: 'All', icon: '📋' }
  ];


  return (
    <div className={styles.exerciseList}>
      {/* Header with muscle info */}
      {selectedMuscle && (
        <div className={styles.header}>
          <h2>{selectedMuscle.name}</h2>
          <p className={styles.muscleInfo}>
            {selectedMuscle.category} • {selectedMuscle.commonNames?.[0] || 'No aliases'}
          </p>
        </div>
      )}

      {/* Category Tabs */}
      {visibleTabs.length > 1 && (
        <div className={styles.categoryTabs}>
          {availableTabs
            .filter(tab => visibleTabs.includes(tab.id))
            .map(tab => (
              <button
                key={tab.id}
                className={`${styles.categoryTab} ${selectedCategory === tab.id ? styles.active : ''}`}
                onClick={() => handleCategoryChange(tab.id)}
                disabled={loading}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))
          }
        </div>
      )}


      {/* Exercise count */}
      <div className={styles.resultInfo}>
        {loading ? (
          <span>Loading exercises...</span>
        ) : (
          <span>
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} found
            {selectedMuscle && ` for ${selectedMuscle.name}`}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => loadExercisesForMuscle()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Exercise list */}
      <div className={styles.exercises} onScroll={handleScroll}>
        {exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            selectedMuscle={selectedMuscle}
            onClick={() => handleExerciseClick(exercise)}
            onAddToWorkout={() => onAddToWorkout?.(exercise)}
          />
        ))}
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className={styles.loadingMore}>
            Loading more exercises...
          </div>
        )}
        
        {!loading && exercises.length === 0 && !error && (
          <div className={styles.emptyState}>
            {selectedMuscle ? (
              <p>No exercises found for {selectedMuscle.name} with your preferences.</p>
            ) : (
              <p>Select a muscle from the body map to view exercises.</p>
            )}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default ExerciseList;