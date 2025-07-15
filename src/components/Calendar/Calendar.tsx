import React, { useState, useEffect, useMemo } from 'react';
import { db as database } from '../../services/database';
import { Workout } from '../../types/models';
import styles from './Calendar.module.css';

interface CalendarProps {
  onDateClick?: (date: Date, workout?: Workout) => void;
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({ onDateClick, className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  // Load workouts for the current month
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        // Get workouts for the last 90 days (to cover previous/next month views)
        const allWorkouts = await database.getWorkouts(90);
        setWorkouts(allWorkouts);
      } catch (error) {
        console.error('Failed to load workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Calculate total cells needed (including padding)
    const totalCells = Math.ceil((totalDays + startingDayOfWeek) / 7) * 7;
    
    const days: Array<{ date: Date | null; workout?: Workout }> = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const workout = workouts.find(w => {
        const workoutDate = new Date(w.date);
        return workoutDate.getDate() === day &&
               workoutDate.getMonth() === month &&
               workoutDate.getFullYear() === year;
      });
      days.push({ date, workout });
    }
    
    // Add empty cells to complete the grid
    while (days.length < totalCells) {
      days.push({ date: null });
    }
    
    return days;
  }, [currentDate, workouts]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date | null, workout?: Workout) => {
    if (date && onDateClick) {
      onDateClick(date, workout);
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className={`${styles.calendar} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.navButton} 
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          ←
        </button>
        
        <div className={styles.monthYear}>
          <h2>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button 
            className={styles.todayButton}
            onClick={handleToday}
          >
            Today
          </button>
        </div>
        
        <button 
          className={styles.navButton} 
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map(day => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className={styles.loading}>Loading workouts...</div>
      ) : (
        <div className={styles.grid}>
          {calendarDays.map((dayInfo, index) => {
            const { date, workout } = dayInfo;
            return (
              <div
                key={index}
                className={`
                  ${styles.cell} 
                  ${!date ? styles.empty : ''} 
                  ${workout ? styles.hasWorkout : ''}
                  ${isToday(date) ? styles.today : ''}
                `}
                onClick={() => handleDateClick(date, workout)}
              >
                {date && (
                  <>
                    <span className={styles.dayNumber}>{date.getDate()}</span>
                    {workout && (
                      <div className={styles.workoutIndicator}>
                        <div className={styles.dot} />
                        <span className={styles.exerciseCount}>
                          {workout.exercises.length}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};