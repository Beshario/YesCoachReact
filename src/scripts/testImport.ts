// Test script to verify the new exercise import system
import { exerciseService } from '../services';

async function testExerciseImport() {
  console.log('🧪 Testing YesCoach exercise import system...\n');
  
  try {
    // Initialize the service (this will trigger import if needed)
    console.log('1. Initializing exercise service...');
    await exerciseService.initialize();
    
    // Test getting all exercises (not available in new service - use search instead)
    console.log('2. Getting all exercises...');
    const allExercises = await exerciseService.searchExercises();
    console.log(`   Found ${allExercises.length} exercises`);
    
    // Test getting a specific exercise
    if (allExercises.length > 0) {
      console.log('3. Testing specific exercise retrieval...');
      const firstExercise = allExercises[0];
      console.log(`   Exercise: ${firstExercise.name}`);
      console.log(`   Category: ${firstExercise.category}`);
      console.log(`   Difficulty: ${firstExercise.difficulty}`);
      console.log(`   Equipment: ${firstExercise.equipment.join(', ')}`);
      console.log(`   Tags: ${firstExercise.tags.join(', ')}`);
    }
    
    // Test muscle-based search
    console.log('4. Testing muscle-based exercise search...');
    const chestExercises = await exerciseService.getExercisesForMuscle(160, 'high'); // Chest
    console.log(`   Found ${chestExercises.length} chest exercises`);
    
    if (chestExercises.length > 0) {
      console.log(`   Example: ${chestExercises[0].name}`);
    }
    
    // Test search functionality
    console.log('5. Testing exercise search...');
    const searchResults = await exerciseService.quickSearch('push');
    console.log(`   Found ${searchResults.length} exercises matching "push"`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testExerciseImport();
}

export { testExerciseImport };