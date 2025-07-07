import React, { useState, useEffect } from 'react';
import { exerciseService } from '../../services/exerciseService';
import { preferencesService } from '../../services/preferencesService';
import { ExerciseInfo, DifficultyLevel, EquipmentType } from '../../types/ExerciseTypes';
import { SortType } from '../../types/models';
import { MuscleInfo } from '../BodyMap/MuscleData';
import ExerciseCard from './ExerciseCard';
import FilterPanel from './FilterPanel';
import styles from './ExerciseList.module.css';

interface ExerciseListProps {
  selectedMuscle?: MuscleInfo;
  onExerciseSelect?: (exercise: ExerciseInfo) => void;
  onAddToWorkout?: (exercise: ExerciseInfo) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  selectedMuscle,
  onExerciseSelect,
  onAddToWorkout
}) => {
  const [exercises, setExercises] = useState<ExerciseInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExercises, setTotalExercises] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const exercisesPerPage = 20;
  
  // Filter states
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('relevance');

  // Load user preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const userPrefs = await preferencesService.getUserPreferences();
        setSortBy(userPrefs.defaultSortBy);
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Load exercises when muscle selection or filters change
  useEffect(() => {
    if (selectedMuscle) {
      setCurrentPage(1);
      setExercises([]);
      setHasMore(true);
      loadExercisesForMuscle(1, true);
    }
  }, [selectedMuscle, difficultyFilter, equipmentFilter, sortBy]);

  const loadExercisesForMuscle = async (page: number = currentPage, replace: boolean = false) => {
    if (!selectedMuscle) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      await exerciseService.initialize();
      
      // Get exercises for the selected muscle
      const allMuscleExercises = await exerciseService.getExercisesForMuscle(
        selectedMuscle.id,
        'target',
        {
          difficulty: difficultyFilter.length > 0 ? difficultyFilter : undefined,
          equipment: equipmentFilter.length > 0 ? equipmentFilter : undefined,
          sortBy: sortBy
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
      if (!loadingMore && hasMore && !searchTerm) {
        loadMoreExercises();
      }
    }
  };

  // Search functionality
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      if (selectedMuscle) {
        setCurrentPage(1);
        setExercises([]);
        setHasMore(true);
        loadExercisesForMuscle(1, true);
      }
      return;
    }
    
    setLoading(true);
    try {
      const searchResults = await exerciseService.quickSearch(term, 50);
      setExercises(searchResults);
      setHasMore(false); // Search results don't have pagination yet
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = async (newSortBy: SortType) => {
    setSortBy(newSortBy);
    
    // Save user's preference
    try {
      await preferencesService.setSortPreference(newSortBy);
    } catch (error) {
      console.error('Failed to save sort preference:', error);
    }
  };

  // Get exercise alternatives
  const handleGetAlternatives = async (exercise: ExerciseInfo) => {
    try {
      const alternatives = await exerciseService.getAlternatives(exercise.id);
      if (alternatives.length > 0) {
        setExercises(alternatives);
      }
    } catch (err) {
      console.error('Failed to get alternatives:', err);
    }
  };

  // Filter exercises by search term (client-side for responsiveness)
  const filteredExercises = exercises.filter(exercise =>
    !searchTerm || 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.searchTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      {/* Search and filters */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.sortContainer}>
          <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortType)}
            className={styles.sortSelect}
          >
            <option value="relevance">Most Relevant</option>
            <option value="type">Exercise Type</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
        
        <FilterPanel
          difficultyFilter={difficultyFilter}
          equipmentFilter={equipmentFilter}
          onDifficultyChange={setDifficultyFilter}
          onEquipmentChange={setEquipmentFilter}
        />
      </div>

      {/* Exercise count */}
      <div className={styles.resultInfo}>
        {loading ? (
          <span>Loading exercises...</span>
        ) : (
          <span>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
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
        {filteredExercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            selectedMuscle={selectedMuscle}
            onSelect={() => onExerciseSelect?.(exercise)}
            onAddToWorkout={() => onAddToWorkout?.(exercise)}
            onGetAlternatives={() => handleGetAlternatives(exercise)}
          />
        ))}
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className={styles.loadingMore}>
            Loading more exercises...
          </div>
        )}
        
        {!loading && filteredExercises.length === 0 && !error && (
          <div className={styles.emptyState}>
            {selectedMuscle ? (
              <p>No exercises found for {selectedMuscle.name} with current filters.</p>
            ) : (
              <p>Select a muscle from the body map to view exercises.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseList;