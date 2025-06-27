# YesCoach Fitness App - Unified Requirements Document

## Vision Statement
YesCoach empowers users to design science-based workout programs with unprecedented muscle-specific tracking, integrating strength, mobility, and cardiovascular fitness through an intuitive anatomical interface.

## Core Principles
- **Anatomical Navigation**: Body map as primary interface
- **Sport Science Integration**: Track hypertrophy, endurance, and power with fiber-type specificity
- **Comprehensive Tracking**: Strength, mobility, and cardiovascular in unified view
- **Local-First Architecture**: Full offline functionality with optional cloud backup
- **Professional Depth**: Serious training features in consumer-friendly interface

## User Journey & Navigation
YesCoach User Journey Documentation
1. App Entry & Personal Dashboard
User opens app to personalized muscle state overview

Visual: Body map with fatigue overlay showing current muscle states
UI Theme: Star Trek-inspired interface with data annotations
Smart Insights:
Strongest muscles highlighted
Most neglected muscles identified
Intelligent recommendations: "Rest day suggested" or "Upper body optimal"
Quick Actions:
"Start Quick Workout" button for immediate engagement
"Browse Muscles" to explore exercises
Equipment mode toggle (home/gym)
2. Muscle Browsing & Exercise Discovery
User explores body map to understand exercise options

Navigation: Tap muscle groups to zoom into detailed view
Exercise Lists: Slide-up panels showing filtered exercises per muscle
Planning Integration: Add exercises directly to workout plan
Equipment Filtering: Only show exercises matching available equipment
3. Workout Planning & Optimization
User builds structured workout routine

Plan Structure: Automatic warm-up → main exercises → cool-down/stretches
Difficulty Adjustment: Swipe exercises left/right to modify intensity
Smart Optimization:
Auto-suggest exercise order
Balance muscle groups
Recommend based on current fatigue states
Templates: Save/load predefined routines
4. Guided Workout Execution
App walks user through planned routine

Auto Mode: Step-by-step exercise guidance with timing
Real-time Adjustments:
Mid-workout exercise substitutions
"Too easy/hard" buttons for live adaptation
Progress Tracking: Sets, reps, and perceived effort logging
Safety Features: Rest period enforcement, form reminders
5. Post-Workout & Recovery
Celebration and data integration

Immediate Feedback: Confetti animation and completion celebration
State Updates: Muscle fatigue recalculated based on workout intensity
Recovery Insights:
Predicted recovery timeline
Next optimal workout suggestions
Recommended stretches for worked muscles
Progress Tracking: Updated strength metrics and volume history
6. Continuous Cycle
Smart recommendations for ongoing fitness journey

Dashboard Evolution: Updated fatigue overlay reflects new muscle states
Adaptive Planning: Future workout suggestions based on recovery patterns
Long-term Insights: Weekly progress summaries and trend analysis
Core Differentiator: Muscle-centric approach with real-time fatigue tracking drives all recommendations and planning decisions.

Older ideas are following:
### 1. Body Map - Primary Navigation Hub

#### Layer 1: Full Body View
- **Views**: Front and back body SVG maps
- **Navigation**: Swipe between front/back views
- **Major Muscle Zones**: 
  - Chest
  - Abs/Obliques  
  - Upper Back
  - Lower Back
  - Glutes & Hamstrings
  - Quadriceps
  - Calves
  - Arms (Biceps/Triceps)
  - Shoulders
  - Forearms
- **Visual Feedback**: Live fatigue/mobility overlay on all muscles
- **Interaction**: Tap any muscle zone → Navigate to Layer 2

#### Layer 2: Detailed Muscle View (can be accomplished with CSS animations)
- **Screen Layout**: Focused view of selected muscle group
- **Sub-Muscle Breakdown**: Individual muscle heads/regions clickable
  - Example: Chest → Upper/Middle/Lower/Inner pectorals
  - Example: Back → Lats/Rhomboids/Traps/Erectors with specific regions
- **Navigation Options**:
  - Swipe left/right: Navigate to opposite side equivalent (chest + bicepts, to back and tricpeps)
  - Swipe up: Move to muscle group above
  - Swipe down: Move to muscle group below
  - Tap sub-muscle: View exercises targeting that specific area
- **Persistent Elements**: Fatigue and mobility indicators visible

### 2. Exercise Database & Management

#### Database Architecture
- **Development Phase**: Scrape complete ExRx.net database
- **Production Phase**: Central YesCoach database with community contributions
- **Local Storage**: Users can save custom exercises locally
- **Sync Strategy**: Base exercises pushed from central, custom exercises remain local

#### Exercise Attributes
- **Muscle Mapping**:
  - Primary muscles (with specific heads/regions)
  - Secondary muscles
  - Antagonist/stabilizer muscles
- **Training Type Classification**:
  - Hypertrophy-focused
  - Endurance-focused
  - Power-focused
- **Fiber Type Bias**: Predicted 1-3 scale (1=slow, 2=mixed, 3=fast)
- **Equipment Requirements**: Bodyweight, dumbbells, barbell, machines, etc.
- **Movement Patterns**: Push, pull, squat, hinge, carry, rotate

#### Exercise Demonstration
- **Primary**: Instagram integration via deep links
- **Search Query**: Auto-generated from exercise name
- **Format**: `instagram://search?q=[exercise_name]_form`
- **Fallback**: Web redirect if Instagram not installed

### 3. Comprehensive Tracking System

#### Strength Tracking
- **Volume Metrics**: Sets × reps × weight for each muscle
- **Intensity Tracking**: Percentage of max, RPE scale
- **Fiber Development**: Track slow/fast/mixed fiber adaptations
- **Progressive Overload**: Automatic progression recommendations

#### Mobility Tracking
- **Range of Motion**: Degrees or percentage for each joint
- **Flexibility Scores**: 0-100 scale per muscle group
- **Restriction Mapping**: Visual overlay showing tight areas
- **Integration**: Stretching exercises affect mobility scores

#### Cardiovascular Tracking
- **Heart as Central Muscle**: Appears in center of body map
- **Metrics Tracked**:
  - Heart rate zones (1-5)
  - Duration at each zone
  - Recovery heart rate
  - Estimated VO2 max
- **Fatigue Integration**: Cardio affects overall recovery capacity

### 4. Muscle State & Fatigue System

#### Fatigue Calculation Model
```
Current Fatigue = Previous Fatigue + Exercise Impact - Time Recovery

Where:
- Exercise Impact = Volume × Intensity × Training Type Modifier × Muscle Role
- Time Recovery = Hours Since × Recovery Rate × Individual Factors
- Scale: 0-100 (0 = fully recovered, 100 = completely fatigued)
```

#### Training Type Modifiers
- **Hypertrophy**: 1.2x fatigue multiplier (high muscle damage)
- **Endurance**: 0.8x fatigue multiplier (metabolic stress)
- **Power**: 0.6x fatigue multiplier (neural focus)

#### Muscle Role Multipliers
- **Primary Muscle**: 1.0x impact
- **Secondary Muscle**: 0.5x impact
- **Stabilizer/Antagonist**: 0.3x impact

#### Recovery Factors
- **Base Recovery Rate**: 20-30% per day (user adjustable)
- **Modifiers**:
  - Sleep quality
  - Nutrition adherence
  - Active recovery activities
  - Individual recovery capacity

### 5. Workout Planning & Organization

#### Plan Creation
- **Exercise Selection**: Via body map navigation or search
- **Quick Add**: "+" button on any exercise
- **Grouping Options**:
  - Straight sets
  - Supersets
  - Circuits
  - Giant sets
- **Set Configuration**:
  - Reps and weight
  - Rest periods
  - Tempo (eccentric/concentric/pause)
  - Training focus (hypertrophy/endurance/power)

#### Template System
- **Save Workouts**: Store complete workouts as reusable templates
- **Categories**: By muscle group, training type, or custom tags
- **Sharing**: Export templates as JSON for community sharing

### 6. Calendar & Progress Analytics

#### Calendar View
- **Visual Indicators**:
  - Color coding by training type
  - Muscle groups trained icons
  - Fatigue level indicators
- **Quick Stats**: Tap any date for detailed workout view
- **Planning Mode**: Drag workouts to future dates

#### Progress Tracking
- **Muscle Development**:
  - Volume progression per muscle
  - Strength gains (1RM estimates)
  - Fiber type development trends
- **Mobility Progress**:
  - ROM improvements
  - Flexibility score changes
- **Cardiovascular Fitness**:
  - VO2 max estimates
  - Resting heart rate trends
  - Recovery rate improvements

## Technical Architecture
// Enhanced tech stack
- React + TypeScript (type safety for complex muscle data)
- Zustand (lighter than Redux for muscle state management)
- Dexie.js (IndexedDB wrapper for complex queries)
- React Query (caching for muscle calculations)
- Vite (faster development for SVG-heavy app)

### Frontend Structure
```
src/
├── components/
│   ├── BodyMap/
│   │   ├── Layer1/
│   │   │   ├── FullBodyMap.tsx        # Front/back swipeable views
│   │   │   ├── MuscleZone.tsx         # Clickable major muscle areas
│   │   │   └── FatigueOverlay.tsx     # Visual state indicators
│   │   ├── Layer2/
│   │   │   ├── MuscleDetailView.tsx   # Focused muscle screen
│   │   │   ├── SubMuscleMap.tsx       # Detailed muscle heads
│   │   │   └── SwipeNavigation.tsx    # Directional navigation
│   │   └── SharedComponents/
│   │       ├── MobilityIndicator.tsx  # ROM visualization
│   │       └── HeartMuscle.tsx        # Cardio integration
│   ├── Browse/
│   │   ├── ExerciseList.tsx           # Filtered by muscle selection
│   │   ├── ExerciseCard.tsx           # With quick-add functionality
│   │   ├── SearchPage.tsx             # Full database search
│   │   └── FilterPanel.tsx            # Equipment/type filters
│   ├── Plan/
│   │   ├── WorkoutBuilder.tsx         # Drag-drop interface
│   │   ├── SetConfigurator.tsx        # Detailed set parameters
│   │   ├── TemplateManager.tsx        # Save/load workouts
│   │   └── RestTimer.tsx              # Active workout support
│   ├── Tracking/
│   │   ├── StrengthTracker.tsx        # Volume and intensity logging
│   │   ├── MobilityTracker.tsx        # ROM measurements
│   │   ├── CardioTracker.tsx          # Heart rate zone tracking
│   │   └── UnifiedDashboard.tsx       # Combined progress view
│   └── Calendar/
│       ├── CalendarGrid.tsx           # Monthly/weekly views
│       ├── WorkoutDetail.tsx          # Historical workout data
│       └── ProgressCharts.tsx         # Analytics visualizations
├── services/
│   ├── database/
│   │   ├── schema.ts                  # IndexedDB structure
│   │   ├── migrations.ts              # Database versioning
│   │   └── queries.ts                 # Optimized data access
│   ├── tracking/
│   │   ├── fatigueCalculator.ts      # Muscle state algorithms
│   │   ├── mobilityService.ts        # ROM tracking logic
│   │   └── progressAnalytics.ts      # Trend calculations
│   ├── exercise/
│   │   ├── exrxScraper.ts            # Development data import
│   │   ├── exerciseService.ts        # CRUD operations
│   │   └── muscleMapper.ts           # Exercise-muscle relationships
│   └── external/
│       ├── instagramService.ts       # Demo video links
│       └── exportService.ts          # Data backup/export
└── types/
    ├── models.ts                      # Core data structures
    ├── enums.ts                       # Training types, equipment
    └── interfaces.ts                  # Component contracts
```

### Data Models

```typescript
interface Muscle {
  id: string;
  name: string;
  group: MuscleGroup;
  parent?: string; // For sub-muscles
  location: {
    front: boolean;
    back: boolean;
    layer: 1 | 2;
    svgPath?: string;
  };
}

interface Exercise {
  id: string;
  name: string;
  exrxId?: string;
  muscleActivation: {
    primary: MuscleActivation[];
    secondary: MuscleActivation[];
    stabilizer: MuscleActivation[];
  };
  trainingTypes: TrainingType[];
  equipment: Equipment[];
  movementPattern: MovementPattern;
  fiberBias: 1 | 2 | 3;
  customInstruction?: string;
  instagramQuery: string;
  isCustom: boolean;
  userId?: string; // For user-created exercises
}

interface MuscleActivation {
  muscleId: string;
  percentage: number; // 0-100 activation level
  fiberType: 'slow' | 'mixed' | 'fast';
}

interface MuscleState {
  muscleId: string;
  strength: {
    currentFatigue: number; // 0-100
    volumeHistory: VolumeEntry[];
    maxStrength: number;
    fiberDevelopment: {
      slow: number;
      mixed: number;
      fast: number;
    };
  };
  mobility: {
    currentROM: number; // degrees or percentage
    flexibility: number; // 0-100
    restrictions: string[]; // specific limitations
  };
  lastWorked: Date;
  recoveryRate: number; // Individual adjustment factor
}

interface WorkoutSession {
  id: string;
  date: Date;
  exercises: ExerciseLog[];
  duration: number;
  notes?: string;
  muscleStatesPost: MuscleState[]; // Snapshot after workout
}

interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  trainingFocus: TrainingType;
  actualFiberResponse?: 1 | 2 | 3; // User feedback
  notes?: string;
}

interface SetLog {
  reps: number;
  weight?: number;
  tempo?: Tempo;
  restAfter: number; // seconds
  heartRate?: HeartRateZone; // For cardio integration
}

interface CardioState {
  restingHR: number;
  maxHR: number;
  vo2Max: number; // Estimated
  zones: {
    zone1: { min: number; max: number; timeSpent: number };
    zone2: { min: number; max: number; timeSpent: number };
    zone3: { min: number; max: number; timeSpent: number };
    zone4: { min: number; max: number; timeSpent: number };
    zone5: { min: number; max: number; timeSpent: number };
  };
  recoveryRate: number; // HRV-based metric
}
```

### Storage & Sync Strategy

#### Local Storage (Primary)
- **Technology**: IndexedDB via Dexie.js
- **Structure**: Normalized relational model
- **Capacity**: ~50MB typical user data
- **Performance**: Indexed queries on common access patterns

#### Data Export/Import
- **Format**: JSON with schema version
- **Contents**: Complete user data snapshot
- **Compression**: Optional gzip for large datasets
- **Frequency**: Manual trigger or auto-backup weekly

#### Future Cloud Integration
- **Service**: Google Cloud Storage
- **Strategy**: Incremental sync when online
- **Conflict Resolution**: Last-write-wins with local priority
- **Privacy**: End-to-end encryption option

## Key Differentiators

### 1. Anatomical Intelligence
- Two-layer body navigation feels natural and educational
- Visual muscle state makes abstract data tangible
- Swipe gestures create fluid exploration

### 2. Comprehensive Tracking
- Only app tracking strength + mobility + cardio as unified system
- Muscle-specific granularity unavailable elsewhere
- Professional-grade fiber type development tracking

### 3. Sport Science Integration
- Training type differentiation (hypertrophy/endurance/power)
- Evidence-based fatigue and recovery algorithms
- Progression recommendations based on adaptation principles

### 4. Local-First Philosophy
- Complete offline functionality
- User owns their data
- No subscription lock-in

### 5. Community & Customization
- Central exercise database with quality control
- Local custom exercises for personal preferences
- Template sharing for program collaboration

## Implementation Priorities

### Phase 1: Core Navigation & Tracking
1. Two-layer body map with front/back views (UI SSVG body map done with input from muscle, hover css effect)
to be done, second layer with svg elements hide, and offset, + scaling, can use animation
2. Basic muscle state tracking (fatigue only)
3. Exercise database from ExRx scraping
4. Simple workout logging and saving, with calendar.

### Phase 2: Advanced Features
1. Mobility and cardio integration
2. Fiber type tracking and feedback
3. Progress analytics and charts
4. Template system (Plan)

### Phase 3: Polish & Scale
1. Central database with community features
2. Advanced recovery algorithms
3. Cloud backup option
4. Native app versions

## Success Metrics
- **User Engagement**: Average 4+ workouts logged per week
- **Muscle Coverage**: Users track 15+ different muscles monthly
- **Feature Adoption**: 60% use mobility tracking, 40% use cardio
- **Retention**: 70% three-month retention rate
- **Data Portability**: 30% perform regular backups