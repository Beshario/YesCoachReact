# YesCoach MVP Architecture & Planning Reference

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Architecture Principles](#core-architecture-principles)
3. [Data Architecture](#data-architecture)
4. [Relationship Architecture](#relationship-architecture)
5. [Storage Architecture](#storage-architecture)
6. [MVP Roadmap](#mvp-roadmap)
7. [Technical Decisions](#technical-decisions)
8. [Implementation Strategy](#implementation-strategy)

---

## Project Overview

YesCoach is a biomechanically-intelligent fitness application that empowers users to design science-based workout programs with unprecedented muscle-specific tracking. Unlike traditional exercise databases, YesCoach uses dynamic biomechanical modeling to predict muscle activation based on individual context.

### Key Differentiators
- **Dynamic Activation**: Muscle activation changes based on load, angle, and user state
- **Legal Safety**: Uses biomechanical formulas, not copied exercise descriptions
- **Scientific Grounding**: Based on validated biomechanical principles
- **Mobile-First**: Optimized for performance on mobile devices

---

## Core Architecture Principles

### 1. Movement-First, Not Exercise-First
- Exercises are instances of movement patterns with modifiers
- Muscle activation emerges from biomechanics, not static mappings
- Legal protection through algorithmic generation

### 2. Progressive Complexity
- Start with simplified activation models
- Add complexity through user data and feedback
- Maintain performance on mobile devices

### 3. Context-Aware Intelligence
- Activation predictions adapt to user state
- Equipment availability affects recommendations
- Fatigue modifies muscle recruitment patterns

### 4. Offline-First Design
- Full functionality without internet
- Local data storage with optional backup
- Client-side calculations for privacy

---

## Data Architecture

### Layer 1: Movement Foundation

```typescript
interface MovementPattern {
  id: string;                    // 'hip_hinge', 'squat', 'vertical_push', etc.
  name: string;
  category: 'lower_push' | 'lower_pull' | 'upper_push' | 'upper_pull' | 'core' | 'carry';
  
  biomechanics: {
    primaryJoints: Joint[];      // Hip, knee, shoulder, etc.
    jointAngles: AngleRange[];   // ROM for each joint
    forceVector: Vector3D;       // Direction of primary force
    planeOfMotion: 'sagittal' | 'frontal' | 'transverse';
    kinematicChain: 'open' | 'closed';
  };
  
  baseActivationTemplate: {
    primaryMovers: MuscleActivationRule[];
    synergists: MuscleActivationRule[];
    stabilizers: MuscleActivationRule[];
  };
  
  loadCharacteristics: {
    forceProduction: 'ascending' | 'descending' | 'constant';
    stabilityDemand: number;     // 0-1
    coordinationComplexity: number; // 0-1
  };
}

interface MuscleActivationRule {
  muscleId: number;              // References MuscleData.ts
  baseActivation: number;        // 0-100%
  
  modifiers: {
    angleModifier: (jointAngle: number) => number;
    loadModifier: (percentRM: number) => number;
    fatigueModifier: (fatigue: number) => number;
    tempoModifier: (tempo: TempoPhase) => number;
  };
  
  contractionType: 'concentric' | 'eccentric' | 'isometric';
  activationCurve: 'linear' | 'exponential' | 'logarithmic';
}

interface Joint {
  name: string;
  type: 'hinge' | 'ball_socket' | 'gliding' | 'pivot';
  primaryAxis: 'flexion_extension' | 'abduction_adduction' | 'rotation';
  normalROM: AngleRange;
}

interface AngleRange {
  min: number;
  max: number;
  optimal: number;               // Peak activation angle
}
```

### Layer 2: Exercise Instances

```typescript
interface ExerciseDefinition {
  id: number;
  name: string;
  movementPattern: string;       // References MovementPattern.id
  
  // Modifiers that affect activation
  modifiers: {
    equipment: EquipmentModifier;
    stance: StanceModifier;
    grip: GripModifier;
    range: RangeOfMotionModifier;
  };
  
  // Constraints
  requirements: {
    equipment: Equipment[];
    mobility: MobilityRequirement[];
    stability: StabilityLevel;
    experience: ExperienceLevel;
  };
  
  // Pre-calculated for performance
  activationCache: {
    default: MuscleActivationSet;
    byLoad: Map<LoadLevel, MuscleActivationSet>;
    byTempo: Map<TempoType, MuscleActivationSet>;
  };
  
  // Instructions
  setup: SetupInstruction[];
  execution: ExecutionStep[];
  commonErrors: CommonError[];
  safetyNotes: string[];
}

interface EquipmentModifier {
  type: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'band';
  stabilityDemand: number;       // 0-1 (affects stabilizer activation)
  loadDistribution: 'bilateral' | 'unilateral' | 'alternating';
  resistanceCurve: 'constant' | 'ascending' | 'descending' | 'accommodating';
  freedomOfMovement: number;     // 0-1 (machine=0, free weight=1)
}

interface StanceModifier {
  type: 'standard' | 'wide' | 'narrow' | 'split' | 'single_leg';
  baseOfSupport: number;         // Affects stability demands
  muscleEmphasis: Map<number, number>; // MuscleId -> emphasis multiplier
}

interface GripModifier {
  type: 'overhand' | 'underhand' | 'neutral' | 'mixed';
  width: 'narrow' | 'standard' | 'wide';
  muscleShift: Map<number, number>; // How grip affects activation
}
```

### Layer 3: Contextual Activation

```typescript
interface UserContext {
  profile: {
    id: string;
    anthropometry: AnthropometricData;
    experience: ExperienceProfile;
    equipment: AvailableEquipment[];
  };
  
  currentState: {
    muscleStates: Map<number, MuscleState>;
    systemicFatigue: number;     // 0-100
    sessionFatigue: number;      // Within current workout
    lastWorkout: Date;
  };
  
  preferences: {
    trainingGoals: TrainingGoal[];
    avoidedMovements: string[];
    equipmentPreferences: Equipment[];
  };
}

interface AnthropometricData {
  height: number;
  weight: number;
  limbLengths: {
    femur: number;
    tibia: number;
    humerus: number;
    forearm: number;
    torso: number;
  };
  mobilityProfile: Map<Joint, RangeOfMotion>;
}

interface ActivationCalculation {
  exercise: ExerciseDefinition;
  context: UserContext;
  
  parameters: {
    load: {
      absolute: number;          // kg or lbs
      relative: number;          // % of 1RM
      bodyweightMultiple?: number;
    };
    tempo: {
      eccentric: number;
      pause: number;
      concentric: number;
      hold: number;
    };
    rangeOfMotion: number;       // 0-1 (partial to full)
    setNumber: number;           // Fatigue accumulation
  };
  
  calculate(): MuscleActivationResult;
}

interface MuscleActivationResult {
  timestamp: Date;
  exerciseId: number;
  
  activations: Array<{
    muscleId: number;
    percentage: number;          // 0-100
    role: 'primary' | 'secondary' | 'stabilizer';
    contractionType: 'concentric' | 'eccentric' | 'isometric';
    confidence: number;          // 0-1 (based on data quality)
  }>;
  
  metadata: {
    modifiersApplied: string[];
    assumptions: string[];
    warnings?: string[];
    alternativeInterpretations?: string[];
  };
  
  predictedOutcomes: {
    primaryStimulus: 'strength' | 'hypertrophy' | 'endurance' | 'power';
    fatigueAccumulation: number;
    recoveryTime: number;        // hours
    adaptationPotential: number; // 0-1
  };
}
```

---

## Relationship Architecture

### Automatic Relationship Discovery

```typescript
interface RelationshipEngine {
  // Core similarity metrics
  calculateSimilarity(exerciseA: Exercise, exerciseB: Exercise): SimilarityScore;
  
  // Relationship generators
  findAlternatives(exercise: Exercise, constraints: UserConstraints): AlternativeSet;
  findProgressions(exercise: Exercise, userLevel: Level): ProgressionSet;
  findRegressions(exercise: Exercise): RegressionSet;
  generateAntagonists(exercise: Exercise): AntagonistSet;
  
  // Validation
  validateRelationship(relationship: ExerciseRelationship): ValidationResult;
  improveWithFeedback(relationship: ExerciseRelationship, feedback: UserFeedback): void;
}

interface SimilarityScore {
  overall: number;               // 0-1 weighted combination
  
  components: {
    muscleOverlap: {
      primary: number;           // 0-1
      secondary: number;         // 0-1
      total: number;             // 0-1
    };
    movementPattern: {
      samePattern: boolean;
      kinematicSimilarity: number; // 0-1
      forceCurveSimilarity: number; // 0-1
    };
    equipmentCompatibility: {
      canSubstitute: boolean;
      modificationNeeded: string[];
      difficultyChange: number;  // -1 to 1
    };
    trainingEffect: {
      stimulusSimilarity: number; // 0-1
      volumeEquivalence: number;  // 0-1
      intensityMatch: number;     // 0-1
    };
  };
  
  explanation: {
    summary: string;
    details: string[];
    confidence: number;
  };
}

interface ExerciseRelationship {
  sourceId: number;
  targetId: number;
  type: 'alternative' | 'progression' | 'regression' | 'antagonist' | 'synergist';
  
  strength: number;              // 0-1 relationship strength
  bidirectional: boolean;
  
  context: {
    equipment: 'same' | 'different' | 'subset';
    difficulty: 'same' | 'harder' | 'easier';
    muscleEmphasis: 'identical' | 'similar' | 'shifted';
  };
  
  metadata: {
    autoGenerated: boolean;
    generatedDate: Date;
    algorithm: string;
    userValidations: number;
    successRate?: number;        // Based on user acceptance
  };
}

interface RelationshipGraph {
  nodes: Map<number, ExerciseNode>;
  edges: Map<string, ExerciseRelationship>;
  
  // Graph operations
  getRelated(exerciseId: number, type?: RelationshipType): Exercise[];
  getPath(fromId: number, toId: number): ExerciseProgression;
  findClusters(): ExerciseCluster[];
  
  // Performance optimization
  precomputedPaths: Map<string, number[]>;
  relationshipIndex: Map<RelationshipType, Map<number, number[]>>;
}
```

---

## Storage Architecture

### Performance-Optimized Structure

```typescript
interface DatabaseSchema {
  // Core data stores
  stores: {
    movementPatterns: {
      key: string;
      value: MovementPattern;
      indexes: ['category'];
    };
    
    exercises: {
      key: number;
      value: ExerciseDefinition;
      indexes: ['movementPattern', 'difficulty', 'equipment'];
    };
    
    muscleActivations: {
      key: string;                // `${exerciseId}_${contextHash}`
      value: MuscleActivationResult;
      indexes: ['exerciseId', 'timestamp'];
    };
    
    relationships: {
      key: string;                // `${sourceId}_${targetId}`
      value: ExerciseRelationship;
      indexes: ['sourceId', 'targetId', 'type'];
    };
    
    userState: {
      key: string;
      value: UserContext;
      indexes: ['userId'];
    };
  };
  
  // Performance indexes
  indexes: {
    exercisesByMuscle: {
      key: string;                // `${muscleId}_${role}`
      value: Set<number>;         // Exercise IDs
    };
    
    exercisesByEquipment: {
      key: string;                // Equipment type
      value: Set<number>;
    };
    
    musclesByExercise: {
      key: number;                // Exercise ID
      value: MuscleActivationSummary;
    };
    
    relationshipMatrix: {
      key: number;                // Exercise ID
      value: RelationshipSummary;
    };
  };
}

interface CacheStrategy {
  // LRU caches for frequent access patterns
  activationCache: LRUCache<string, MuscleActivationResult>;
  relationshipCache: LRUCache<string, ExerciseRelationship[]>;
  
  // User-specific optimizations
  userPatterns: {
    frequentMuscles: number[];
    commonEquipment: string[];
    preferredExercises: number[];
  };
  
  // Precomputed aggregates
  aggregates: {
    muscleFrequency: Map<number, number>;
    exercisePopularity: Map<number, number>;
    commonProgressions: Map<number, number[]>;
  };
}

interface SyncStrategy {
  // Local-first approach
  localChanges: ChangeLog[];
  lastSync: Date;
  conflictResolution: 'local_wins' | 'server_wins' | 'merge';
  
  // Backup strategy
  exportFormat: 'json' | 'encrypted_json';
  compressionEnabled: boolean;
  backupFrequency: 'manual' | 'daily' | 'weekly';
}
```

---

## MVP Roadmap

### Phase 1: Foundation (Weeks 1-3)
**Goal**: Basic movement patterns with simple activation

#### Week 1: Movement Patterns
- [ ] Define 6 core movement patterns
- [ ] Create biomechanical models
- [ ] Design activation rule system
- [ ] Set up base data structures

#### Week 2: Exercise Definitions
- [ ] Implement 30 core exercises (5 per pattern)
- [ ] Create equipment modifiers
- [ ] Build activation calculators
- [ ] Pre-compute default activations

#### Week 3: Database Layer
- [ ] Set up IndexedDB schema
- [ ] Implement data access layer
- [ ] Create performance indexes
- [ ] Build cache system

### Phase 2: Relationships (Weeks 4-5)
**Goal**: Intelligent exercise connections

#### Week 4: Similarity Engine
- [ ] Implement muscle overlap algorithm
- [ ] Create movement pattern matcher
- [ ] Build equipment compatibility scorer
- [ ] Design similarity score system

#### Week 5: Relationship Generation
- [ ] Auto-generate alternatives
- [ ] Identify progressions/regressions
- [ ] Find antagonist patterns
- [ ] Create relationship storage

### Phase 3: Context (Weeks 6-7)
**Goal**: Basic personalization

#### Week 6: User Context
- [ ] Implement user state tracking
- [ ] Create fatigue model (simple)
- [ ] Build equipment filtering
- [ ] Add load modifiers

#### Week 7: Dynamic Calculations
- [ ] Real-time activation updates
- [ ] Context-aware modifications
- [ ] Performance optimizations
- [ ] Caching strategy

### Phase 4: Integration (Weeks 8-9)
**Goal**: Connected experience

#### Week 8: UI Integration
- [ ] Connect body map to exercises
- [ ] Implement exercise filtering
- [ ] Add relationship navigation
- [ ] Create activation previews

#### Week 9: Polish & Testing
- [ ] Performance optimization
- [ ] Edge case handling
- [ ] User testing
- [ ] Documentation

---

## Technical Decisions

### Architecture Rationale

#### Why Movement-First?
1. **Legal Safety**: Formulas not descriptions
2. **Scientific Validity**: Based on biomechanics
3. **Flexibility**: Easy to add variations
4. **Uniqueness**: Differentiates from competitors

#### Why Local-First?
1. **Performance**: No network latency
2. **Privacy**: User data stays local
3. **Reliability**: Works offline
4. **Cost**: No server infrastructure

#### Why Relationship Engine?
1. **Scalability**: Auto-generates connections
2. **Intelligence**: Contextual recommendations
3. **Maintenance**: Self-improving system
4. **User Value**: Better suggestions

### Technology Stack

```yaml
Frontend:
  - React + TypeScript
  - Zustand (state management)
  - React Query (data fetching)
  - Vite (build tool)

Storage:
  - IndexedDB (via Dexie.js)
  - LRU Cache (in-memory)
  - LocalStorage (preferences)

Calculations:
  - Pure TypeScript functions
  - Web Workers (heavy calculations)
  - WASM (future optimization)

Testing:
  - Vitest (unit tests)
  - React Testing Library
  - Playwright (E2E)
```

### Performance Targets

- Initial load: < 3 seconds
- Exercise search: < 100ms
- Activation calculation: < 50ms
- Relationship lookup: < 25ms
- Storage size: < 50MB

### MVP Scope Boundaries

#### What's Included:
- 6 movement patterns
- 30 exercises
- Basic activation formulas
- Simple fatigue model
- Equipment filtering
- Auto-generated relationships
- Local storage only

#### What's NOT Included:
- Full biomechanical simulation
- Machine learning
- Social features
- Cloud sync
- Video analysis
- Detailed progress tracking
- Complex fatigue algorithms

---

## Implementation Strategy

### Development Principles

1. **Iterative Enhancement**
   - Start simple, add complexity
   - Validate with users early
   - Performance over features

2. **Data-Driven Decisions**
   - Track user interactions
   - Measure activation accuracy
   - Optimize based on usage

3. **Scientific Validation**
   - Compare with EMG studies
   - Expert review of formulas
   - User perceived accuracy

### Risk Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| Activation accuracy | Start conservative, refine with feedback |
| Performance issues | Pre-calculate, cache aggressively |
| User complexity | Progressive disclosure, smart defaults |
| Legal concerns | Document formula sources, avoid copying |

### Success Metrics

- **Technical**: <100ms response times, <5% error rate
- **User**: 80% find recommendations relevant
- **Business**: Clear differentiation from ExRx
- **Scientific**: 70% correlation with EMG studies

---

## Next Steps

1. **Immediate Actions**
   - Set up project structure
   - Create data models
   - Implement first movement pattern

2. **Week 1 Deliverables**
   - Movement pattern system
   - Basic activation calculator
   - Database schema

3. **Validation Checkpoints**
   - Expert review of biomechanics
   - Performance benchmarks
   - User feedback sessions

---

## Appendix: Core Formulas

### Basic Activation Formula
```
Activation = BaseActivation × LoadModifier × AngleModifier × FatigueModifier

Where:
- BaseActivation: From movement pattern (0-100%)
- LoadModifier: 0.5 + (0.5 × Load/MaxLoad)
- AngleModifier: Function of joint angle
- FatigueModifier: 1 - (Fatigue × 0.3)
```

### Similarity Score Formula
```
Similarity = (0.4 × MuscleOverlap) + (0.3 × PatternMatch) + 
             (0.2 × EquipmentCompat) + (0.1 × DifficultyAlign)

Where each component is normalized 0-1
```

### Fatigue Accumulation Formula
```
Fatigue = PreviousFatigue × DecayFactor + NewLoad × IntensityFactor

Where:
- DecayFactor: 0.95^(HoursSince/24)
- IntensityFactor: Based on % activation and volume
```