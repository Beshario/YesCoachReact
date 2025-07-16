import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from './Calendar';
import { Workout } from '../../types/models';
import styles from './CalendarPage.module.css';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDateClick = (date: Date, workout?: Workout) => {
    // Navigate to day view for any date click (with or without workouts)
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    navigate(`/calendar/${dateString}`);
  };

  return (
    <div className={styles.calendarPage}>
      <div className={styles.header}>
        <h1>Workout Calendar</h1>
        <p>Click on any date to view or plan workouts</p>
      </div>
      
      <Calendar 
        onDateClick={handleDateClick}
        className={styles.calendar}
      />
    </div>
  );
};