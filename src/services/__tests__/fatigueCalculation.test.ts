// Example fatigue calculation scenarios
import { MuscleStateService, MuscleSize } from '../muscleStateService';
import { Exercise, WorkoutSet } from '../../types/models';

const muscleStateService = MuscleStateService.getInstance();

// Test scenarios to demonstrate the new volume-based fatigue calculation

console.log('=== Volume-Based Fatigue Calculation Examples ===\n');

// Scenario 1: Light chest workout (1 exercise, 3 sets)
console.log('Scenario 1: Light Chest Workout');
console.log('- Bench Press: 3 sets × 10 reps × 60kg = 1,800kg volume');
console.log('- Expected fatigue: ~30% (under 2,000kg for large muscle)');

// Scenario 2: Moderate chest workout (3 exercises, 3 sets each)
console.log('\nScenario 2: Moderate Chest Workout');
console.log('- Bench Press: 3 × 10 × 80kg = 2,400kg');
console.log('- Incline Press: 3 × 10 × 60kg = 1,800kg');
console.log('- Flyes: 3 × 12 × 20kg = 720kg');
console.log('- Total: 4,920kg (~40% fatigue for large muscle)');

// Scenario 3: Heavy chest workout
console.log('\nScenario 3: Heavy Chest Workout');
console.log('- Bench Press: 5 × 8 × 100kg = 4,000kg');
console.log('- Incline Press: 4 × 10 × 80kg = 3,200kg');
console.log('- Dips (bodyweight): 4 × 12 × 59.5kg = 2,856kg');
console.log('- Cable Flyes: 4 × 15 × 25kg = 1,500kg');
console.log('- Total: 11,556kg (~65% fatigue for large muscle)');

// Scenario 4: Maximal chest workout
console.log('\nScenario 4: Maximal Chest Workout');
console.log('- Would need 18,000kg+ volume for 90%+ fatigue');
console.log('- Example: 6-7 exercises with heavy weights');

// Scenario 5: Biceps workout (small muscle)
console.log('\nScenario 5: Biceps Workout (Small Muscle)');
console.log('- Barbell Curls: 4 × 10 × 40kg = 1,600kg');
console.log('- Hammer Curls: 3 × 12 × 15kg = 540kg');
console.log('- Total: 2,140kg (~35% fatigue for small muscle)');

// Scenario 6: Bodyweight workout
console.log('\nScenario 6: Bodyweight Workout');
console.log('- Push-ups: 4 × 20 × 49kg (70kg × 0.7) = 3,920kg');
console.log('- Pull-ups: 4 × 10 × 70kg = 2,800kg');
console.log('- Dips: 3 × 15 × 59.5kg = 2,677kg');
console.log('- Chest total: 6,597kg (~50% fatigue)');

console.log('\n=== Key Points ===');
console.log('1. Volume = Weight × Reps × Sets');
console.log('2. Small muscles fatigue faster (lower thresholds)');
console.log('3. Bodyweight exercises use body weight × multiplier');
console.log('4. Secondary muscles get 40% of volume credit');
console.log('5. Realistic progression: 1 exercise = light, 3 = moderate, 5+ = heavy');