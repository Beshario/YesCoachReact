# YesCoach Exercise Data Converter - Technical Explanation

## Overview
The YesCoach converter is a standalone TypeScript application that transforms exercise data from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db) format into our simplified `SimpleExercise` format for the MVP. It's not a web scraper but a data transformer that processes JSON data.

## Architecture

```
converter/
├── FreeExerciseDBConverter.ts  # Main orchestrator
├── MuscleMapper.ts             # Maps muscle names to YesCoach muscle IDs
├── ExerciseEnricher.ts         # Enriches data with tags, difficulty, etc.
├── importExercises.ts          # Script to run the conversion
└── types.ts                    # Type definitions
```

## How It Works

### 1. Data Source
- **Input**: JSON data from free-exercise-db (open source exercise database)
- **Format**: Each exercise contains:
  ```typescript
  {
    name: "Barbell Bench Press",
    category: "chest",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
    equipment: "barbell",
    level: "intermediate",
    instructions: ["Step 1...", "Step 2..."]
  }
  ```

### 2. Main Converter Process

The `FreeExerciseDBConverter` orchestrates the transformation:

```typescript
convertExercise(freeDBExercise): SimpleExercise | null {
  // 1. Map muscle names to IDs
  const primaryMuscleIds = this.muscleMapper.mapMuscles(primaryMuscles);
  
  // 2. Generate enrichments
  const tags = this.exerciseEnricher.generateTags(exercise);
  const difficulty = this.exerciseEnricher.convertDifficulty(level);
  const activationLevels = this.exerciseEnricher.generateActivationLevels();
  
  // 3. Create SimpleExercise
  return {
    id: String(this.exerciseIdCounter++),
    name: formatName(exercise.name),
    primaryMuscles: primaryMuscleIds,
    secondaryMuscles: secondaryMuscleIds,
    difficulty,
    tags,
    activationLevels,
    // ... etc
  };
}
```

## Data Generation Details

### 1. Muscle Mapping (`MuscleMapper.ts`)

Maps free-exercise-db muscle names to YesCoach's 55+ muscle IDs:

```typescript
const muscleMap = {
  'chest': [160],              // Pectoralis Major
  'lower chest': [161],        // Pectoralis Major, Sternal
  'upper chest': [162],        // Pectoralis Major, Clavicular
  'biceps': [142],             // Biceps Brachii
  'hamstrings': [105],         // Hamstrings general
  'glutes': [180],             // Hips group
  'abductors': [220],          // Hip Abductors group
  // ... etc
}
```

**Process**:
1. Takes muscle name from free-exercise-db (e.g., "chest")
2. Looks up corresponding YesCoach muscle ID(s)
3. Returns array of muscle IDs for that muscle group

### 2. Difficulty Generation (`ExerciseEnricher.ts`)

**Algorithm**:
```typescript
convertDifficulty(level: string): 'beginner' | 'intermediate' | 'advanced' {
  // Direct mapping from free-exercise-db levels
  switch(level?.toLowerCase()) {
    case 'beginner': return 'beginner';
    case 'intermediate': return 'intermediate';
    case 'expert':
    case 'advanced': return 'advanced';
    default: return 'intermediate'; // Default for unknown
  }
}
```

**Additional Difficulty Logic**:
- Equipment-based adjustments:
  - Bodyweight → Often beginner-friendly
  - Barbell → Often intermediate/advanced
  - Cable/Machine → Often beginner/intermediate
- Movement complexity (from tags):
  - Compound movements → Higher difficulty
  - Isolation movements → Lower difficulty

### 3. Tag Generation

Tags are generated based on multiple factors:

```typescript
generateTags(exercise): string[] {
  const tags = [];
  
  // Movement type
  if (isCompound(exercise)) tags.push('compound');
  else tags.push('isolation');
  
  // Force type
  if (exercise.category.includes('chest', 'shoulders', 'triceps')) 
    tags.push('push');
  if (exercise.category.includes('back', 'biceps')) 
    tags.push('pull');
  
  // Body region
  if (upperBodyMuscles.includes(exercise.primaryMuscles[0])) 
    tags.push('upper');
  else if (lowerBodyMuscles.includes(exercise.primaryMuscles[0])) 
    tags.push('lower');
  
  // Training focus
  if (exercise.equipment === 'barbell') tags.push('strength');
  if (exercise.name.includes('curl', 'fly', 'raise')) tags.push('hypertrophy');
  
  return tags;
}
```

### 4. Activation Levels

Muscle activation levels are calculated based on primary/secondary muscle involvement:

```typescript
generateActivationLevels(primaryMuscles, secondaryMuscles) {
  const levels = {};
  
  // Primary muscles get 'high' activation
  primaryMuscles.forEach(muscleId => {
    levels[muscleId] = 'high';
  });
  
  // Secondary muscles get 'medium' activation
  secondaryMuscles.forEach(muscleId => {
    levels[muscleId] = 'medium';
  });
  
  // Additional muscles based on exercise type
  // e.g., core stabilization for compound movements
  if (isCompoundMovement) {
    levels[171] = 'low'; // Rectus Abdominis
    levels[172] = 'low'; // Obliques
  }
  
  return levels;
}
```

### 5. Exercise Relationships

Relationships are generated by analyzing exercise similarities:

```typescript
generateRelationships(exercises: SimpleExercise[]): ExerciseRelations[] {
  return exercises.map(exercise => {
    const similar = findSimilarExercises(exercise, exercises);
    const alternatives = findAlternatives(exercise, exercises);
    const progressions = findProgressions(exercise, exercises);
    const regressions = findRegressions(exercise, exercises);
    
    return {
      exerciseId: exercise.id,
      similar,      // Same muscles, different equipment
      alternatives, // Different approach, same goal
      progressions, // Harder variations
      regressions   // Easier variations
    };
  });
}
```

**Similarity Algorithm**:
- **Similar**: Same primary muscles + different equipment
- **Alternatives**: Similar muscle groups + different movement pattern
- **Progressions**: Same movement + higher difficulty
- **Regressions**: Same movement + lower difficulty

### 6. Tips Generation

Tips are generated based on exercise characteristics:

```typescript
generateTips(exercise, tags): string[] {
  const tips = [];
  
  // Equipment-specific tips
  if (exercise.equipment === 'barbell') {
    tips.push('Keep your core tight throughout the movement');
    tips.push('Use a spotter for heavy sets');
  }
  
  // Movement-specific tips
  if (exercise.name.includes('squat')) {
    tips.push('Keep your knees tracking over your toes');
    tips.push('Maintain a neutral spine');
  }
  
  // Safety tips based on difficulty
  if (difficulty === 'advanced') {
    tips.push('Master the basic version before attempting');
    tips.push('Focus on form over weight');
  }
  
  return tips;
}
```

## Data Quality & Validation

### Validation Steps:
1. **Muscle Mapping Validation**: Skip exercises with no valid muscle mappings
2. **Name Formatting**: Standardize exercise names (proper capitalization)
3. **Equipment Normalization**: Convert null/undefined to empty array
4. **Instruction Formatting**: Ensure instructions are proper sentences
5. **Duplicate Detection**: Check for duplicate exercise names

### Quality Metrics:
- **Success Rate**: ~95% (873 out of ~900 exercises converted)
- **Skipped Exercises**: Those with unmappable muscles or invalid data
- **Data Completeness**: All exercises have required fields

## Running the Converter

```bash
# Install dependencies
cd converter
npm install

# Run the conversion
npm run convert

# Output
dist/output/exercises.json          # 873 exercises
dist/output/exerciseRelationships.json  # Relationship data
```

## Example Output

```json
{
  "id": "123",
  "name": "Barbell Bench Press",
  "category": "chest",
  "equipment": ["barbell", "bench"],
  "primaryMuscles": [160],      // Pectoralis Major
  "secondaryMuscles": [21, 31], // Anterior Deltoid, Triceps
  "activationLevels": {
    "160": "high",   // Chest - primary target
    "21": "medium",  // Shoulders - secondary
    "31": "medium",  // Triceps - secondary
    "171": "low"     // Core - stabilizer
  },
  "tags": ["compound", "push", "upper", "strength"],
  "difficulty": "intermediate",
  "instructions": [
    "Lie flat on a bench with feet firmly on the ground",
    "Grip the barbell with hands slightly wider than shoulder-width",
    "Lower the bar to your chest with control",
    "Press the bar back up to the starting position"
  ],
  "tips": [
    "Keep your core tight throughout the movement",
    "Use a spotter for heavy sets",
    "Maintain a slight arch in your lower back"
  ]
}
```

## Future Enhancements

1. **Machine Learning Enhancement**:
   - Use ML to better predict difficulty based on movement complexity
   - Improve muscle activation percentage predictions

2. **Biomechanics Integration**:
   - Add force vector calculations
   - Include joint angle data
   - Movement plane analysis

3. **Video Analysis**:
   - Extract exercise data from video demonstrations
   - Generate more accurate muscle activation maps

4. **Community Validation**:
   - Allow users to vote on difficulty ratings
   - Crowdsource tip improvements
   - Validate muscle activation levels

The converter provides a solid foundation for the MVP while being extensible for future biomechanics features!