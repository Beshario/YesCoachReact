# Phase 3: Muscle Tracking & Calendar Implementation

## Overview
This phase implemented visual muscle fatigue tracking and a calendar view for workout history, building on the existing exercise database and workout logging functionality.

## Key Features Implemented

### 1. Reusable BodyMapViewer Component
**Purpose**: Create a flexible, embeddable body map that can display different muscle states in various contexts.

**Implementation**:
- **File**: `src/components/BodyMap/BodyMapViewer.tsx`
- **Props-based design** for maximum flexibility:
  ```typescript
  interface BodyMapViewerProps {
    muscleStates?: Map<number, MuscleDisplayState>;
    displayMode?: 'fatigue' | 'activation' | 'selection' | 'custom';
    viewMode?: 'single' | 'side-by-side';
    interactive?: boolean;
    size?: 'small' | 'medium' | 'large';
    showControls?: boolean;
    showLabels?: boolean;
    onMuscleClick?: (muscleId: number, muscle: MuscleInfo) => void;
  }
  ```
- **Side-by-side view**: Shows front and back simultaneously (perfect for exercise details)
- **Dynamic styling**: Muscles colored based on state (fatigue level, activation, etc.)
- **Responsive sizing**: Adapts to container with small/medium/large presets

### 2. Muscle State Management
**Purpose**: Track muscle fatigue and recovery to help users avoid overtraining.

**Implementation**:
- **File**: `src/services/muscleStateService.ts`
- **Volume-based fatigue model**:
  - Calculates total volume: weight × reps × sets
  - Bodyweight exercises use estimated body weight with multipliers
  - Muscle size categories affect fatigue thresholds:
    - Small muscles (biceps, triceps): 2,000-6,000kg thresholds
    - Medium muscles (shoulders, lats): 4,000-12,000kg thresholds
    - Large muscles (chest, back, quads): 6,000-18,000kg thresholds
  - Secondary muscles receive 40% volume credit
  - Recovery: 50% recovery per 24 hours (linear)
- **Fatigue levels**:
  ```typescript
  - 0-33%: Light (under light threshold)
  - 33-66%: Moderate (light to moderate threshold)
  - 66-90%: Heavy (moderate to heavy threshold)
  - 90-100%: Maximal (above heavy threshold with diminishing returns)
  ```
- **Color-coded states**:
  ```typescript
  - Red (#dc2626): Very Fatigued (75-100%)
  - Amber (#f59e0b): Fatigued (50-75%)
  - Yellow (#eab308): Recovering (25-50%)
  - Green (#22c55e): Nearly Recovered (0-25%)
  ```
- **Database integration**: Muscle states stored in IndexedDB with timestamps

### 3. Calendar Component
**Purpose**: Provide monthly view of workout history with quick access to details.

**Implementation**:
- **File**: `src/components/Calendar/Calendar.tsx`
- **Features**:
  - Monthly grid with navigation
  - Visual indicators for workout days
  - Exercise count badges
  - "Today" button for quick navigation
  - Responsive design
- **Data loading**: Fetches workouts from IndexedDB for the displayed month
- **Click handling**: Opens workout details when clicking on a workout day

### 4. Workout Detail Modal
**Purpose**: Show comprehensive workout information with muscle visualization.

**Implementation**:
- **File**: `src/components/Calendar/WorkoutDetail.tsx`
- **Displays**:
  - Date and workout summary (exercises, sets, total volume)
  - Muscles worked (using BodyMapViewer in side-by-side mode)
  - Detailed exercise list with sets/reps/weight
  - Optional workout notes
- **Portal rendering**: Uses React Portal for proper modal behavior

### 5. Integration Updates

#### Workout Submission (`src/stores/workoutStore.ts`)
```typescript
submitWorkout: async () => {
  // Save workout to database
  await database.saveWorkout(workout);
  
  // Calculate muscle impact
  const muscleImpacts = await muscleStateService.calculateWorkoutImpact(exercises);
  
  // Update muscle states
  await muscleStateService.updateMuscleStates(muscleImpacts);
}
```

#### Main Body Map (`src/components/BodyMap/YesCoachBodyMap.tsx`)
- Now fetches and displays current muscle fatigue states
- Auto-refreshes every 30 seconds
- Shows loading state while fetching data

#### Exercise Detail Modal
- Added BodyMapViewer showing primary (red) and secondary (amber) muscles
- Uses side-by-side view for comprehensive muscle visualization

## Technical Design Decisions

### 1. Component Architecture
- **Separation of concerns**: BodyMapViewer is purely presentational
- **Props-based control**: Parent components manage state and pass display data
- **Reusability**: Same component used in 3+ different contexts

### 2. State Management
- **Service pattern**: MuscleStateService encapsulates all fatigue logic
- **Local calculation**: Fatigue calculated on-device for privacy
- **Optimistic updates**: UI updates immediately, database saves async

### 3. Data Model Updates
```typescript
interface MuscleState {
  muscleId: number;          // Muscle ID from body map
  currentFatigue: number;    // 0-100
  lastUpdated: Date;
  lastWorkoutRole?: 'primary' | 'secondary';
}
```

### 4. Performance Optimizations
- **Memoization**: Muscle states calculated only when dependencies change
- **Lazy loading**: Exercise details fetched only when workout detail opens
- **Efficient queries**: Workouts indexed by date for fast calendar rendering

## User Experience Improvements

### 1. Visual Feedback
- Immediate visual indication of muscle fatigue on body map
- Color coding makes it easy to identify overtrained muscles
- Side-by-side views eliminate need to toggle between front/back

### 2. Workout Planning
- Users can see which muscles are recovered before planning workouts
- Historical view helps identify training patterns
- Quick access to past workout details for reference

### 3. Mobile Optimization
- Touch-friendly calendar navigation
- Full-screen modals on mobile devices
- Responsive layouts that adapt to screen size

## Future Enhancement Opportunities

### 1. Advanced Fatigue Model
- Non-linear recovery curves
- Individual muscle recovery rates
- Factors like sleep, nutrition, age

### 2. Calendar Features
- Week view option
- Muscle group filters
- Export functionality
- Workout planning mode

### 3. Analytics
- Muscle balance charts
- Training frequency heatmaps
- Progress tracking over time
- Recovery recommendations

### 4. Social Features
- Share workout summaries
- Compare training patterns
- Community challenges

## File Structure
```
src/
├── components/
│   ├── BodyMap/
│   │   ├── BodyMapViewer.tsx          # Reusable body map component
│   │   ├── BodyMapViewer.module.css   # Styles including side-by-side view
│   │   └── YesCoachBodyMap.tsx        # Main body map with fatigue display
│   ├── Calendar/
│   │   ├── Calendar.tsx               # Monthly calendar grid
│   │   ├── Calendar.module.css        # Calendar styles
│   │   ├── WorkoutDetail.tsx          # Workout detail modal
│   │   ├── WorkoutDetail.module.css   # Modal styles
│   │   └── CalendarPage.tsx           # Example integration page
│   └── ExerciseList/
│       └── ExerciseDetailModal.tsx    # Updated with muscle visualization
├── services/
│   ├── muscleStateService.ts          # Fatigue calculation and management
│   └── database.ts                    # Updated with muscle state methods
└── types/
    └── models.ts                      # Updated MuscleState interface
```

## Testing Recommendations

### 1. Unit Tests
- MuscleStateService fatigue calculations
- Calendar date calculations
- BodyMapViewer prop variations

### 2. Integration Tests
- Workout submission → muscle state update flow
- Calendar → database → workout detail flow
- Body map → muscle selection → exercise filter flow

### 3. E2E Tests
- Complete workout and verify muscle states update
- Navigate calendar and open workout details
- View exercise details with muscle highlighting

## Conclusion
Phase 3 successfully implements a visual muscle tracking system that helps users make informed training decisions. The reusable BodyMapViewer component and simple fatigue model provide immediate value while leaving room for future enhancements. The calendar view completes the workout tracking experience by providing easy access to historical data.