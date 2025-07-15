Compiled with problems:
ERROR in src/components/BodyMap/BodyMapViewer.tsx:107:17
TS2322: Type 'number | null' is not assignable to type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
    105 |               <FrontView 
    106 |                 onMuscleClick={handleMuscleClick}
  > 107 |                 selectedMuscleId={hoveredMuscle}
        |                 ^^^^^^^^^^^^^^^^
    108 |                 muscleStyles={getMuscleStyles}
    109 |                 onMuscleHover={handleMuscleHover}
    110 |               />
ERROR in src/components/BodyMap/BodyMapViewer.tsx:120:17
TS2322: Type 'number | null' is not assignable to type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
    118 |               <BackView 
    119 |                 onMuscleClick={handleMuscleClick}
  > 120 |                 selectedMuscleId={hoveredMuscle}
        |                 ^^^^^^^^^^^^^^^^
    121 |                 muscleStyles={getMuscleStyles}
    122 |                 onMuscleHover={handleMuscleHover}
    123 |               />
ERROR in src/components/BodyMap/BodyMapViewer.tsx:162:15
TS2322: Type 'number | null' is not assignable to type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
    160 |             <FrontView 
    161 |               onMuscleClick={handleMuscleClick}
  > 162 |               selectedMuscleId={hoveredMuscle}
        |               ^^^^^^^^^^^^^^^^
    163 |               muscleStyles={getMuscleStyles}
    164 |               onMuscleHover={handleMuscleHover}
    165 |             />
ERROR in src/components/BodyMap/BodyMapViewer.tsx:169:15
TS2322: Type 'number | null' is not assignable to type 'number | undefined'.
  Type 'null' is not assignable to type 'number | undefined'.
    167 |             <BackView 
    168 |               onMuscleClick={handleMuscleClick}
  > 169 |               selectedMuscleId={hoveredMuscle}
        |               ^^^^^^^^^^^^^^^^
    170 |               muscleStyles={getMuscleStyles}
    171 |               onMuscleHover={handleMuscleHover}
    172 |             />
ERROR in src/components/Calendar/Calendar.tsx:2:10
TS2305: Module '"../../services/database"' has no exported member 'database'.
    1 | import React, { useState, useEffect, useMemo } from 'react';
  > 2 | import { database } from '../../services/database';
      |          ^^^^^^^^
    3 | import { Workout } from '../../types/models';
    4 | import styles from './Calendar.module.css';
    5 |
ERROR in src/components/Calendar/WorkoutDetail.tsx:5:10
TS2305: Module '"../../services/database"' has no exported member 'database'.
    3 | import { Workout } from '../../types/models';
    4 | import { SimpleExercise } from '../../types/SimpleExerciseTypes';
  > 5 | import { database } from '../../services/database';
      |          ^^^^^^^^
    6 | import { BodyMapViewer, MuscleDisplayState } from '../BodyMap';
    7 | import styles from './WorkoutDetail.module.css';
    8 |
ERROR in src/components/Calendar/WorkoutDetail.tsx:27:39
TS2802: Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
    25 |         
    26 |         // Load unique exercises
  > 27 |         const uniqueExerciseIds = [...new Set(workout.exercises.map(e => e.exerciseId))];
       |                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    28 |         
    29 |         for (const id of uniqueExerciseIds) {
    30 |           const exercise = await database.getExercise(id);
ERROR in src/components/Calendar/WorkoutDetail.tsx:56:17
TS2339: Property 'target' does not exist on type 'SimpleExercise'.
    54 |       
    55 |       // Primary muscles
  > 56 |       (exercise.target || []).forEach(muscleId => {
       |                 ^^^^^^
    57 |         states.set(muscleId, {
    58 |           color: '#dc2626',
    59 |           intensity: 0.8,
ERROR in src/components/Calendar/WorkoutDetail.tsx:56:39
TS7006: Parameter 'muscleId' implicitly has an 'any' type.
    54 |       
    55 |       // Primary muscles
  > 56 |       (exercise.target || []).forEach(muscleId => {
       |                                       ^^^^^^^^
    57 |         states.set(muscleId, {
    58 |           color: '#dc2626',
    59 |           intensity: 0.8,
ERROR in src/components/Calendar/WorkoutDetail.tsx:65:17
TS2339: Property 'synergists' does not exist on type 'SimpleExercise'.
    63 |       
    64 |       // Secondary muscles
  > 65 |       (exercise.synergists || []).forEach(muscleId => {
       |                 ^^^^^^^^^^
    66 |         // Don't override if already marked as primary
    67 |         if (!states.has(muscleId)) {
    68 |           states.set(muscleId, {
ERROR in src/components/Calendar/WorkoutDetail.tsx:65:43
TS7006: Parameter 'muscleId' implicitly has an 'any' type.
    63 |       
    64 |       // Secondary muscles
  > 65 |       (exercise.synergists || []).forEach(muscleId => {
       |                                           ^^^^^^^^
    66 |         // Don't override if already marked as primary
    67 |         if (!states.has(muscleId)) {
    68 |           states.set(muscleId, {
ERROR in src/components/ExerciseList/ExerciseDetailModal.tsx:54:37
TS2339: Property 'target' does not exist on type 'SimpleExercise'.
    52 |     
    53 |     // Get primary and secondary muscles from exercise
  > 54 |     const primaryMuscles = exercise.target || [];
       |                                     ^^^^^^
    55 |     const secondaryMuscles = exercise.synergists || [];
    56 |     
    57 |     return muscleStateService.getMuscleActivationDisplay(
ERROR in src/components/ExerciseList/ExerciseDetailModal.tsx:55:39
TS2339: Property 'synergists' does not exist on type 'SimpleExercise'.
    53 |     // Get primary and secondary muscles from exercise
    54 |     const primaryMuscles = exercise.target || [];
  > 55 |     const secondaryMuscles = exercise.synergists || [];
       |                                       ^^^^^^^^^^
    56 |     
    57 |     return muscleStateService.getMuscleActivationDisplay(
    58 |       primaryMuscles,
ERROR in src/stores/workoutStore.ts:203:21
TS2352: Conversion of type '{ type: "strength"; primaryMuscles: any; secondaryMuscles: any; stabilizers: any; id: string; name: string; category: string; equipment: string[]; activationLevels: { [muscleId: number]: ActivationLevel; }; ... 7 more ...; biomechanics?: { forceVector?: { x: number; y: number; z: number; }; jointAngles?: { [joint: s...' to type 'Exercise' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ type: "strength"; primaryMuscles: any; secondaryMuscles: any; stabilizers: any; id: string; name: string; category: string; equipment: string[]; activationLevels: { [muscleId: number]: ActivationLevel; }; ... 7 more ...; biomechanics?: { ...; } | undefined; }' is missing the following properties from type 'Exercise': mechanics, force, fiberBias, recommendedGoals
    201 |         // Convert SimpleExercise to Exercise format for muscle state calculation
    202 |         const exercisesForMuscleCalc = exercisesWithCompletedSets.map(e => ({
  > 203 |           exercise: {
        |                     ^
  > 204 |             ...e.exercise,
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 205 |             type: 'strength' as const,
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 206 |             primaryMuscles: e.exercise.target || [],
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 207 |             secondaryMuscles: e.exercise.synergists || [],
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 208 |             stabilizers: e.exercise.stabilizers
        | ^^^^^^^^^^^^^^^^^^^^^^^^^^
  > 209 |           } as Exercise,
        | ^^^^^^^^^^^^^^^^^^^^^^^^
    210 |           sets: e.sets.map(set => ({
    211 |             exerciseId: e.exerciseId,
    212 |             reps: set.reps,
ERROR in src/stores/workoutStore.ts:206:40
TS2339: Property 'target' does not exist on type 'SimpleExercise'.
    204 |             ...e.exercise,
    205 |             type: 'strength' as const,
  > 206 |             primaryMuscles: e.exercise.target || [],
        |                                        ^^^^^^
    207 |             secondaryMuscles: e.exercise.synergists || [],
    208 |             stabilizers: e.exercise.stabilizers
    209 |           } as Exercise,
ERROR in src/stores/workoutStore.ts:207:42
TS2339: Property 'synergists' does not exist on type 'SimpleExercise'.
    205 |             type: 'strength' as const,
    206 |             primaryMuscles: e.exercise.target || [],
  > 207 |             secondaryMuscles: e.exercise.synergists || [],
        |                                          ^^^^^^^^^^
    208 |             stabilizers: e.exercise.stabilizers
    209 |           } as Exercise,
    210 |           sets: e.sets.map(set => ({
ERROR in src/stores/workoutStore.ts:208:37
TS2339: Property 'stabilizers' does not exist on type 'SimpleExercise'.
    206 |             primaryMuscles: e.exercise.target || [],
    207 |             secondaryMuscles: e.exercise.synergists || [],
  > 208 |             stabilizers: e.exercise.stabilizers
        |                                     ^^^^^^^^^^^
    209 |           } as Exercise,
    210 |           sets: e.sets.map(set => ({
    211 |             exerciseId: e.exerciseId,