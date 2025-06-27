# YesCoach Fitness App - Architecture & Development Guide

## Vision Statement
Build a professional-grade fitness app with unprecedented muscle-specific tracking, sport science integration, and intelligent exercise relationships. The app uses anatomical precision and real-time adaptation to provide a training experience that rivals having a personal trainer.

## Core Architectural Principles

### 1. **Separation of Static vs. Dynamic Data**
- **Static Catalogs**: Scientific facts that don't change (muscle anatomy, exercise biomechanics)
- **Dynamic States**: User-specific progress and performance data
- **Computed Intelligence**: Real-time calculations from static + dynamic data

### 2. **Professional Backend, Curated Frontend**
- Complete anatomical precision in backend (55+ muscles from ExRx)
- Selective presentation in UI based on user context and experience level
- Scalable complexity that grows with user sophistication

### 3. **Local-First with Cloud Backup**
- Full offline functionality for core features
- Optional cloud sync for data backup and multi-device access
- User owns their data completely

---

## Data Architecture Overview

### **Three-Layer System**

1. **Reference Layer**: Static scientific data (muscles, exercises, relationships)
2. **User Layer**: Personal progress and performance tracking
3. **Intelligence Layer**: Real-time calculations and recommendations

---

## Muscle Database Architecture

### **Static Muscle Catalog**
**Purpose**: Complete anatomical reference based on ExRx.net muscle directory
**Scope**: 55+ muscles with scientific precision
**Update Frequency**: Rare (only when adding new muscles or correcting anatomy)

#### **Key Features**:
- **Hierarchical Structure**: Parent muscles (Shoulders) → Child muscles (Anterior/Lateral/Posterior Deltoid)
- **UI Context Awareness**: 
  - Body Map layer (20 major clickable regions)
  - Search/Browse layer (45 relevant muscles)
  - Advanced/Pro layer (55+ complete anatomy)
- **Training Characteristics**: Fiber type bias, training focus, anatomical location
- **ExRx Integration**: Direct links to source material for validation

#### **Data Fields**:
```typescript
interface MuscleInfo {
  id: number;
  name: string;
  exrxName: string;                    // Official ExRx terminology
  category: string;                    // Anatomical region
  commonNames: string[];               // User-friendly aliases
  anatomicalLocation: 'front' | 'back' | 'both';
  isClickableOnBodyMap: boolean;       // Major SVG regions
  parentId?: number;                   // Hierarchy support
  children?: number[];                 // Sub-muscles
  fiberType: 'fast' | 'slow' | 'mixed';
  trainingFocus: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'stability';
  isDeepMuscle: boolean;               // Stabilizer vs. prime mover
}
```

### **Dynamic User Muscle States**
**Purpose**: Track user's current muscle condition and progress
**Scope**: Per-user, per-muscle tracking
**Update Frequency**: After every workout

#### **Key Features**:
- **Current State**: Real-time fatigue, readiness, mobility, injury status
- **Recovery Intelligence**: Personalized recovery rates and predictions
- **Goal Tracking**: User-specific strength and development targets
- **Minimal Historical Data**: Only current state + key metrics (no workout duplication)

#### **Data Relationship**:
```
UserMuscleStates[userId][muscleId] → UserMuscleState
```

#### **Calculated Fields** (Derived from other systems):
- Current fatigue (from recent workouts in calendar)
- Strength trend (from exercise performance data)
- Last worked date (from workout calendar)
- Volume progression (aggregated from exercise states)

---

## Exercise Database Architecture

### **Three Data Structures for Complete Exercise Management**

#### **1. Exercise Catalog** (Static Reference)
**Purpose**: Complete exercise library with biomechanical properties
**Source**: ExRx.net scraping + manual curation
**Scope**: 2000+ exercises with scientific backing

##### **Core Data**:
```typescript
interface ExerciseInfo {
  id: number;
  name: string;
  exrxId?: string;                     // Source reference
  category: string;                    // Movement pattern category
  equipment: Equipment[];              // Required equipment
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Biomechanical Properties
  muscleActivation: {
    target: MuscleActivation[];        // Primary 70-100%
    synergists: MuscleActivation[];    // Secondary 30-70%
    stabilizers: MuscleActivation[];   // Support 10-30%
  };
  
  // Training Characteristics
  trainingTypes: TrainingType[];       // Hypertrophy/strength/power/endurance
  movementPattern: MovementPattern;    // Push/pull/squat/hinge/rotate/carry
  fiberBias: 1 | 2 | 3;              // Fast/mixed/slow twitch emphasis
  
  // Instructions & Media
  preparation: string;
  execution: string;
  comments?: string;
  instagramQuery: string;              // For video demonstrations
}
```

##### **ExRx Data Integration**:
Each exercise includes parsed ExRx data:
- **Classification**: Utility (basic/auxiliary), Mechanics (compound/isolated), Force (push/pull)
- **Instructions**: Preparation, execution, comments
- **Muscle Analysis**: Target, synergists, stabilizers with activation levels

#### **2. Exercise Relationships** (Static Connections)
**Purpose**: Smart exercise substitution and progression intelligence
**Generation**: Algorithmic discovery from muscle data + manual curation
**Storage**: Embedded in exercise catalog for performance

##### **Relationship Types**:
```typescript
interface ExerciseRelationships {
  alternatives: ExerciseLink[];        // Same difficulty, different equipment/style
  progressions: ExerciseLink[];        // Harder variations
  regressions: ExerciseLink[];         // Easier variations
  antagonists: ExerciseLink[];         // Opposing movement patterns
}

interface ExerciseLink {
  exerciseId: number;
  similarity: number;                  // 0-1 similarity score
  difficultyDelta: number;             // Percentage difficulty change
  context: string;                     // "equipment", "stability", "technique"
  reason: string;                      // "Same muscles, different equipment"
}
```

##### **Discovery Algorithm**:
1. **Parse ExRx muscle data** for all exercises
2. **Calculate similarity scores** based on muscle overlap
3. **Apply context filters** (equipment, difficulty, technique)
4. **Manual curation** to add nuance and remove false positives
5. **Store as direct IDs** for runtime performance

##### **Runtime Benefits**:
- **Instant substitution**: "Bench rack busy" → immediate dumbbell suggestions
- **Progressive difficulty**: "Ready for harder?" → smart progression paths
- **Injury accommodation**: "Shoulder issue" → joint-friendly alternatives
- **Equipment adaptation**: Home gym → bodyweight alternatives

#### **3. Exercise Performance States** (Dynamic User Data)
**Purpose**: Track user's mastery and progress on specific exercises
**Scope**: Per-user, per-exercise performance data
**Update Frequency**: After each workout session

##### **Performance Tracking**:
```typescript
interface ExercisePerformance {
  userId: string;
  exerciseId: number;
  
  // Personal Records (1-25 rep maxes)
  personalBests: {
    1: number | null;    // 1 rep max
    2: number | null;    // 2 rep max
    // ... up to 25
    25: number | null;   // 25 rep max
  };
  
  // Performance Analytics
  strengthTrend: 'improving' | 'maintaining' | 'declining';
  volumeProgression: VolumeEntry[];    // Historical volume data
  techniqueRating: number;             // User's comfort/mastery (1-10)
  preferenceRating: number;            // How much user likes this exercise
  
  // Exercise-Specific Notes
  personalNotes: string;               // User modifications, form cues
  restrictions: string[];              // Injury accommodations
  lastPerformed: Date | null;
}
```

##### **Strength Translation Intelligence**:
- **Exercise Family Learning**: Bench press improvement → predict dumbbell bench starting weight
- **Movement Pattern Transfer**: Squat strength → estimate lunge capability
- **Personal Calibration**: User's actual vs. predicted performance refines algorithms

---

## Workout & Calendar System

### **Workout Calendar** (Primary Source of Truth)
**Purpose**: Complete historical record of training sessions
**Scope**: All workout data organized by date
**Integration**: Feeds into muscle states and exercise performance

#### **Data Structure**:
```typescript
interface WorkoutSession {
  id: string;
  userId: string;
  date: Date;
  duration: number;
  
  exercises: ExerciseLog[];
  
  // Session-level metrics
  totalVolume: number;
  averageIntensity: number;
  perceivedDifficulty: number;         // User rating 1-10
  notes?: string;
}

interface ExerciseLog {
  exerciseId: number;
  sets: SetLog[];
  trainingFocus: TrainingType;         // What was the goal for this exercise
  restPeriods: number[];               // Rest between sets
  actualDifficulty: number;            // User feedback
  formRating: number;                  // Self-assessed form quality
  notes?: string;
}

interface SetLog {
  reps: number;
  weight?: number;                     // Null for bodyweight
  duration?: number;                   // For timed exercises
  distance?: number;                   // For cardio
  tempo?: string;                      // "3-1-2-1" format
  rpe: number;                         // Rate of perceived exertion 1-10
}
```

### **Data Flow: Workout → Updates**
```
1. User logs workout session
   ↓
2. Update ExercisePerformance (check PRs, volume progression)
   ↓
3. Recalculate UserMuscleStates (fatigue, readiness, trends)
   ↓
4. Update UI (body map overlay, recommendations)
```

---

## ExRx Integration Strategy

### **Scraping & Data Pipeline**

#### **Phase 1: Complete Directory Harvest**
1. **Muscle Directory Mapping**: Parse `/Lists/Directory` for complete muscle taxonomy
2. **Exercise Cataloging**: Scrape all exercise pages for biomechanical data
3. **Relationship Seeding**: Use muscle activation patterns to identify potential exercise relationships

#### **Phase 2: Data Enhancement**
1. **Manual Curation**: Review algorithmic relationship suggestions
2. **Context Addition**: Add equipment, difficulty, and injury considerations
3. **Quality Assurance**: Validate exercise instructions and muscle mappings

#### **Phase 3: Relationship Finalization**
1. **Similarity Scoring**: Calculate relationship strength based on muscle overlap + manual adjustments
2. **ID Storage**: Convert relationships to direct exercise IDs for runtime performance
3. **Metadata Enrichment**: Add context tags and difficulty deltas

### **ExRx Data Structure Parsing**

#### **Exercise Page Components**:
- **Classification**: Utility, Mechanics, Force vectors
- **Instructions**: Preparation, Execution, Comments
- **Muscle Analysis**: Target, Synergists, Stabilizers
- **Equipment Requirements**: From exercise context

#### **Muscle Activation Processing**:
```
Target → Primary muscles (70-100% activation)
Synergists → Secondary muscles (30-70% activation)  
Stabilizers → Support muscles (10-30% activation)
```

#### **Relationship Discovery Logic**:
```
High Target Overlap + Same Equipment = Direct Alternative
High Target Overlap + Different Equipment = Equipment Alternative
Target → Synergist Promotion = Progression Path
Synergist → Target Demotion = Regression Path
Opposite Movement Patterns = Antagonist Pairs
```

---

## User Interface Architecture

### **Context-Aware Muscle Presentation**

#### **Body Map Layer (20 Major Regions)**
- **Primary SVG Interaction**: Clickable major muscle groups
- **Real-time Overlay**: Fatigue and readiness visualization
- **Quick Navigation**: Direct path to exercises for clicked muscle

#### **Search/Browse Layer (45 Relevant Muscles)**
- **Exercise Discovery**: Filter exercises by specific muscle targets
- **User-Friendly Terms**: "Upper chest" instead of "Pectoralis major, clavicular head"
- **Progressive Disclosure**: Show complexity based on user experience

#### **Advanced/Pro Layer (55+ Complete Anatomy)**
- **Professional Precision**: Complete ExRx muscle taxonomy
- **Deep Analysis**: Stabilizer muscles, movement patterns
- **Injury Prevention**: Rotator cuff, deep hip rotators focus

### **Exercise Interaction Patterns**

#### **Planning Stage Intelligence**:
- **Exercise Customization**: "Show alternatives" → ranked list with difficulty comparisons
- **Smart Substitution**: Preview strength translations between similar exercises
- **Progressive Overload**: Suggest when ready for exercise progressions

#### **Workout Stage Adaptation**:
- **Real-time Alternatives**: Equipment conflicts → instant substitutions
- **Injury Accommodation**: Joint issues → safer exercise variants
- **Difficulty Adjustment**: "Too easy/hard" → immediate progression/regression

#### **Progress Stage Analytics**:
- **Strength Trends**: Exercise performance over time
- **Muscle Development**: Fiber type adaptation tracking
- **Program Balance**: Muscle group distribution analysis

---

## Performance & Scalability

### **Data Access Patterns**

#### **Hot Path Optimization** (Real-time workout needs):
- **Direct ID Lookups**: Exercise alternatives via embedded relationships
- **Cached Calculations**: Body map overlays, readiness scores
- **Minimal Computation**: Pre-calculated strength translations

#### **Cold Path Analysis** (Progress tracking):
- **Historical Aggregation**: Strength trends from workout calendar
- **Complex Analytics**: Muscle balance analysis, program optimization
- **Background Processing**: Trend detection, recommendation generation

### **Storage Strategy**

#### **Local Storage** (Primary):
- **IndexedDB**: Complete offline functionality
- **Hierarchical Caching**: Hot data (current states) vs. cold data (history)
- **Progressive Loading**: Load body map muscles first, detailed anatomy on demand

#### **Cloud Backup** (Optional):
- **User Data Only**: Personal states, performance, preferences
- **Incremental Sync**: Only changed data since last sync
- **Conflict Resolution**: Local-first with merge strategies

---

## Development Roadmap

### **Phase 1: Foundation (MVP)**
1. **Static Muscle Catalog**: Complete ExRx muscle database with UI context layers
2. **Exercise Catalog**: Core exercises with muscle mapping
3. **Body Map Integration**: Clickable SVG with muscle selection
4. **Basic Workout Logging**: Exercise performance tracking
5. **Simple Calendar**: Workout history by date

### **Phase 2: Intelligence**
1. **Exercise Relationships**: Smart alternatives and progressions
2. **Real-time Adaptation**: Equipment substitution, difficulty adjustment
3. **Muscle State Tracking**: Fatigue calculation, readiness scoring
4. **Progress Analytics**: Strength trends, personal records

### **Phase 3: Advanced Features**
1. **Fiber Development Tracking**: Fast/slow twitch adaptation
2. **Recovery Intelligence**: Personalized recovery predictions
3. **Program Optimization**: Muscle balance analysis, weakness identification
4. **Community Features**: Exercise requests, program sharing

### **Phase 4: Ecosystem**
1. **Cloud Sync**: Multi-device data synchronization
2. **Wearable Integration**: Heart rate, sleep, activity data
3. **Professional Tools**: Coach dashboard, client management
4. **API Platform**: Third-party integration capabilities

---

## Key Differentiators

### **Anatomical Intelligence**
- **Muscle-Specific Tracking**: 55+ muscles with individual states
- **Visual Navigation**: Two-layer body map for natural exploration
- **Scientific Precision**: ExRx-based muscle activation mapping

### **Exercise Relationship Intelligence**
- **Smart Substitution**: Context-aware alternatives (equipment, injury, difficulty)
- **Progressive Pathways**: Natural exercise progression discovery
- **Real-time Adaptation**: Instant workout modifications

### **Training Science Integration**
- **Fiber Type Development**: Fast/slow twitch adaptation tracking
- **Evidence-based Algorithms**: Sport science principles in fatigue/recovery
- **Multi-modal Training**: Strength + mobility + cardio unified tracking

### **User Data Ownership**
- **Local-first Architecture**: Complete offline functionality
- **No Lock-in**: Full data export capabilities
- **Privacy Focus**: User controls all personal data

---

## Technical Implementation Notes

### **Data Modeling Priorities**
1. **Separation of Concerns**: Static catalogs, dynamic states, computed intelligence
2. **Performance Optimization**: Direct IDs for relationships, cached calculations for UI
3. **Scalability**: Hierarchical data loading, progressive complexity disclosure
4. **Maintainability**: Clear boundaries between exercise catalog, user tracking, and UI logic

### **Integration Considerations**
1. **ExRx Respect**: Rate limiting, proper attribution, quality validation
2. **User Experience**: Instant responsiveness during workouts, smooth transitions
3. **Data Integrity**: Validation layers, migration strategies, backup verification
4. **Platform Evolution**: Mobile-first design with desktop/web expansion path

This architecture provides the foundation for a professional-grade fitness application that scales from beginner users to advanced athletes while maintaining scientific accuracy and real-time performance.