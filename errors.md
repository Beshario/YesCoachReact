Compiled with problems:
ERROR in ./src/components/ExerciseList/ExerciseDetailModal.tsx 95:35-47
export 'muscleGroups' (imported as 'muscleGroups') was not found in '../BodyMap/MuscleData' (possible exports: __esModule, getAdvancedMuscles, getBodyMapMuscles, getBrowseMuscles, getCategories, getChildMuscles, getClickableMuscles, getDeepMuscles, getMuscleById, getMusclesByCategory, getMusclesByTrainingFocus, getParentMuscles, getSearchableMuscles, muscleData, searchMuscles)
ERROR in ./src/components/ExerciseList/ExerciseDetailModal.tsx 104:35-47
export 'muscleGroups' (imported as 'muscleGroups') was not found in '../BodyMap/MuscleData' (possible exports: __esModule, getAdvancedMuscles, getBodyMapMuscles, getBrowseMuscles, getCategories, getChildMuscles, getClickableMuscles, getDeepMuscles, getMuscleById, getMusclesByCategory, getMusclesByTrainingFocus, getParentMuscles, getSearchableMuscles, muscleData, searchMuscles)
ERROR in ./src/components/ExerciseList/ExerciseDetailModal.tsx 95:35-47
export 'muscleGroups' (imported as 'muscleGroups') was not found in '../BodyMap/MuscleData' (possible exports: __esModule, getAdvancedMuscles, getBodyMapMuscles, getBrowseMuscles, getCategories, getChildMuscles, getClickableMuscles, getDeepMuscles, getMuscleById, getMusclesByCategory, getMusclesByTrainingFocus, getParentMuscles, getSearchableMuscles, muscleData, searchMuscles)
ERROR in ./src/components/ExerciseList/ExerciseDetailModal.tsx 104:35-47
export 'muscleGroups' (imported as 'muscleGroups') was not found in '../BodyMap/MuscleData' (possible exports: __esModule, getAdvancedMuscles, getBodyMapMuscles, getBrowseMuscles, getCategories, getChildMuscles, getClickableMuscles, getDeepMuscles, getMuscleById, getMusclesByCategory, getMusclesByTrainingFocus, getParentMuscles, getSearchableMuscles, muscleData, searchMuscles)
ERROR in src/components/ExerciseList/ExerciseDetailModal.tsx:4:10
TS2305: Module '"../BodyMap/MuscleData"' has no exported member 'muscleGroups'.
    2 | import ReactDOM from 'react-dom';
    3 | import { SimpleExercise } from '../../types/SimpleExerciseTypes';
  > 4 | import { muscleGroups } from '../BodyMap/MuscleData';
      |          ^^^^^^^^^^^^
    5 | import styles from './ExerciseDetailModal.module.css';
    6 |
    7 | interface ExerciseDetailModalProps {
ERROR in src/components/ExerciseList/ExerciseDetailModal.tsx:89:27
TS18046: 'group' is of type 'unknown'.
    87 |     return muscleIds.map(id => {
    88 |       const muscle = Object.values(muscleGroups)
  > 89 |         .flatMap(group => group.muscles)
       |                           ^^^^^
    90 |         .find(m => m.id === id);
    91 |       return muscle ? muscle.name : `Unknown (${id})`;
    92 |     });
ERROR in src/components/ExerciseList/ExerciseDetailModal.tsx:102:29
TS18046: 'group' is of type 'unknown'.
    100 |       .map(([muscleId, activation]) => {
    101 |         const muscle = Object.values(muscleGroups)
  > 102 |           .flatMap(group => group.muscles)
        |                             ^^^^^
    103 |           .find(m => m.id === parseInt(muscleId));
    104 |         return {
    105 |           name: muscle ? muscle.name : `Unknown (${muscleId})`,