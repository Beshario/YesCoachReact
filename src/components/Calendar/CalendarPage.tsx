import React, { useState } from 'react';
import { Calendar } from './Calendar';
import { WorkoutDetail } from './WorkoutDetail';
import { Workout } from '../../types/models';
import styles from './CalendarPage.module.css';

export const CalendarPage: React.FC = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<{
    workout: Workout;
    date: Date;
  } | null>(null);

  const handleDateClick = (date: Date, workout?: Workout) => {
    if (workout) {
      setSelectedWorkout({ workout, date });
    } else {
      // Handle empty date click - could open "Create Workout" modal
      console.log('No workout on', date.toDateString());
    }
  };

  const handleCloseWorkoutDetail = () => {
    setSelectedWorkout(null);
  };

  return (
    <div className={styles.calendarPage}>
      <div className={styles.header}>
        <h1>Workout Calendar</h1>
        <p>Click on any date with a workout to view details</p>
      </div>
      
      <Calendar 
        onDateClick={handleDateClick}
        className={styles.calendar}
      />
      
      {selectedWorkout && (
        <WorkoutDetail
          workout={selectedWorkout.workout}
          date={selectedWorkout.date}
          onClose={handleCloseWorkoutDetail}
        />
      )}
    </div>
  );
};