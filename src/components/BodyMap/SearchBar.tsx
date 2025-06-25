import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MuscleInfo, searchMuscles } from './MuscleData';
import styles from './styles.module.css';

interface SearchBarProps {
  onMuscleSelect: (muscle: MuscleInfo) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onMuscleSelect, 
  placeholder = "Search muscles..." 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MuscleInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      const results = searchMuscles(value);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, []);

  const handleSuggestionClick = useCallback((muscle: MuscleInfo) => {
    setQuery(muscle.name);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onMuscleSelect(muscle);
  }, [onMuscleSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, suggestions, selectedIndex, handleSuggestionClick]);

  const handleBlur = useCallback(() => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={styles.searchContainer}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={styles.searchInput}
        autoComplete="off"
      />
      
      {isOpen && suggestions.length > 0 && (
        <ul ref={listRef} className={styles.suggestionsList}>
          {suggestions.map((muscle, index) => (
            <li
              key={muscle.id}
              onClick={() => handleSuggestionClick(muscle)}
              className={`${styles.suggestionItem} ${
                index === selectedIndex ? styles.suggestionItemSelected : ''
              }`}
            >
              {muscle.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};