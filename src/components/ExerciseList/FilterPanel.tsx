import React, { useState } from 'react';
import { DifficultyLevel, EquipmentType } from '../../types/ExerciseTypes';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  difficultyFilter: DifficultyLevel[];
  equipmentFilter: EquipmentType[];
  onDifficultyChange: (difficulties: DifficultyLevel[]) => void;
  onEquipmentChange: (equipment: EquipmentType[]) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  difficultyFilter,
  equipmentFilter,
  onDifficultyChange,
  onEquipmentChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyOptions: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
  
  const equipmentOptions: EquipmentType[] = [
    'bodyweight',
    'dumbbell', 
    'barbell',
    'cable',
    'machine',
    'resistance_band',
    'kettlebell',
    'suspension',
    'medicine_ball',
    'plate',
    'bench',
    'pull_up_bar'
  ];

  const handleDifficultyToggle = (difficulty: DifficultyLevel) => {
    const newFilter = difficultyFilter.includes(difficulty)
      ? difficultyFilter.filter(d => d !== difficulty)
      : [...difficultyFilter, difficulty];
    onDifficultyChange(newFilter);
  };

  const handleEquipmentToggle = (equipment: EquipmentType) => {
    const newFilter = equipmentFilter.includes(equipment)
      ? equipmentFilter.filter(e => e !== equipment)
      : [...equipmentFilter, equipment];
    onEquipmentChange(newFilter);
  };

  const clearAllFilters = () => {
    onDifficultyChange([]);
    onEquipmentChange([]);
  };

  const activeFilterCount = difficultyFilter.length + equipmentFilter.length;

  return (
    <div className={styles.filterPanel}>
      {/* Filter toggle button */}
      <button 
        className={`${styles.filterToggle} ${activeFilterCount > 0 ? styles.hasActiveFilters : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        🔽 Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
      </button>

      {/* Expanded filter options */}
      {isExpanded && (
        <div className={styles.filterOptions}>
          {/* Difficulty filters */}
          <div className={styles.filterGroup}>
            <h4>Difficulty Level</h4>
            <div className={styles.filterButtons}>
              {difficultyOptions.map(difficulty => (
                <button
                  key={difficulty}
                  className={`${styles.filterButton} ${
                    difficultyFilter.includes(difficulty) ? styles.active : ''
                  }`}
                  onClick={() => handleDifficultyToggle(difficulty)}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment filters */}
          <div className={styles.filterGroup}>
            <h4>Equipment</h4>
            <div className={styles.filterButtons}>
              {equipmentOptions.map(equipment => (
                <button
                  key={equipment}
                  className={`${styles.filterButton} ${
                    equipmentFilter.includes(equipment) ? styles.active : ''
                  }`}
                  onClick={() => handleEquipmentToggle(equipment)}
                >
                  {equipment.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <div className={styles.filterActions}>
              <button 
                className={styles.clearButton}
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;