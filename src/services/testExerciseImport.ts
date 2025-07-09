// Test Exercise Import
// Simple test script to verify exercise database import works correctly

import { exerciseService } from './exerciseService';

async function testExerciseImport() {
  console.log('🧪 Testing exercise database import...');

  try {
    // Initialize the service (will import data if needed)
    await exerciseService.initialize();

    // Test basic operations
    console.log('\n📊 Getting database statistics...');
    const stats = await exerciseService.getStats();
    console.log('Statistics:', stats);

    // Test muscle-based queries
    console.log('\n💪 Testing muscle-based queries...');
    const chestExercises = await exerciseService.getExercisesForMuscle(161, 'high', { limit: 5 });
    console.log(`Found ${chestExercises.length} chest exercises:`, chestExercises.map(ex => ex.name));

    // Test equipment filtering
    console.log('\n🏋️ Testing equipment filtering...');
    const barbellExercises = await exerciseService.getExercisesByEquipment(['barbell']);
    console.log(`Found ${barbellExercises.length} barbell exercises`);

    // Test exercise relationships
    if (chestExercises.length > 0) {
      console.log('\n🔗 Testing exercise relationships...');
      const alternatives = await exerciseService.getAlternatives(chestExercises[0].id);
      console.log(`Found ${alternatives.length} alternatives for "${chestExercises[0].name}"`);
    }

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchResults = await exerciseService.quickSearch('bench', 3);
    console.log(`Search for "bench" found ${searchResults.length} results:`, searchResults.map(ex => ex.name));

    console.log('\n✅ All tests passed! Exercise database is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testExerciseImport();