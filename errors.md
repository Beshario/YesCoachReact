Compiled with problems:
ERROR in src/components/ExerciseList/ExerciseList.tsx:79:9
TS2345: Argument of type '"target"' is not assignable to parameter of type '"high" | "medium" | "low" | undefined'.
    77 |       const allMuscleExercises = await exerciseService.getExercisesForMuscle(
    78 |         selectedMuscle.id,
  > 79 |         'target',
       |         ^^^^^^^^
    80 |         {
    81 |           difficulty: difficultyFilter.length > 0 ? difficultyFilter : undefined,
    82 |           equipment: equipmentFilter.length > 0 ? equipmentFilter : undefined,
ERROR in src/components/ExerciseList/ExerciseList.tsx:93:22
TS2345: Argument of type 'SimpleExercise[]' is not assignable to parameter of type 'SetStateAction<ExerciseInfo[]>'.
  Type 'SimpleExercise[]' is not assignable to type 'ExerciseInfo[]'.
    Type 'SimpleExercise' is missing the following properties from type 'ExerciseInfo': utility, mechanics, force, preparation, and 9 more.
    91 |       
    92 |       if (replace || page === 1) {
  > 93 |         setExercises(muscleExercises);
       |                      ^^^^^^^^^^^^^^^
    94 |       } else {
    95 |         setExercises(prev => [...prev, ...muscleExercises]);
    96 |       }
ERROR in src/components/ExerciseList/ExerciseList.tsx:95:22
TS2345: Argument of type '(prev: ExerciseInfo[]) => (SimpleExercise | ExerciseInfo)[]' is not assignable to parameter of type 'SetStateAction<ExerciseInfo[]>'.
  Type '(prev: ExerciseInfo[]) => (SimpleExercise | ExerciseInfo)[]' is not assignable to type '(prevState: ExerciseInfo[]) => ExerciseInfo[]'.
    Type '(SimpleExercise | ExerciseInfo)[]' is not assignable to type 'ExerciseInfo[]'.
      Type 'SimpleExercise | ExerciseInfo' is not assignable to type 'ExerciseInfo'.
        Type 'SimpleExercise' is missing the following properties from type 'ExerciseInfo': utility, mechanics, force, preparation, and 9 more.
    93 |         setExercises(muscleExercises);
    94 |       } else {
  > 95 |         setExercises(prev => [...prev, ...muscleExercises]);
       |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    96 |       }
    97 |       
    98 |       // Update pagination state
ERROR in src/components/ExerciseList/ExerciseList.tsx:175:66
TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
    173 |   const handleGetAlternatives = async (exercise: ExerciseInfo) => {
    174 |     try {
  > 175 |       const alternatives = await exerciseService.getAlternatives(exercise.id);
        |                                                                  ^^^^^^^^^^^
    176 |       if (alternatives.length > 0) {
    177 |         setExercises(alternatives);
    178 |       }
ERROR in src/components/ExerciseList/ExerciseList.tsx:177:22
TS2345: Argument of type 'SimpleExercise[]' is not assignable to parameter of type 'SetStateAction<ExerciseInfo[]>'.
  Type 'SimpleExercise[]' is not assignable to type 'ExerciseInfo[]'.
    Type 'SimpleExercise' is missing the following properties from type 'ExerciseInfo': utility, mechanics, force, preparation, and 9 more.
    175 |       const alternatives = await exerciseService.getAlternatives(exercise.id);
    176 |       if (alternatives.length > 0) {
  > 177 |         setExercises(alternatives);
        |                      ^^^^^^^^^^^^
    178 |       }
    179 |     } catch (err) {
    180 |       console.error('Failed to get alternatives:', err);
ERROR in src/scripts/testImport.ts:14:48
TS2551: Property 'getAllExercises' does not exist on type 'ExerciseService'. Did you mean 'getExercise'?
    12 |     // Test getting all exercises
    13 |     console.log('2. Getting all exercises...');
  > 14 |     const allExercises = await exerciseService.getAllExercises();
       |                                                ^^^^^^^^^^^^^^^
    15 |     console.log(`   Found ${allExercises.length} exercises`);
    16 |     
    17 |     // Test getting a specific exercise
ERROR in src/services/exerciseService.ts:176:32
TS2304: Cannot find name 'ExerciseSearchQuery'.
    174 |    * Smart exercise search with scoring
    175 |    */
  > 176 |   async searchExercises(query: ExerciseSearchQuery): Promise<ExerciseSearchResult[]> {
        |                                ^^^^^^^^^^^^^^^^^^^
    177 |     await this.initialize();
    178 |     
    179 |     let candidates: ExerciseInfo[] = [];
ERROR in src/services/exerciseService.ts:176:62
TS2304: Cannot find name 'ExerciseSearchResult'.
    174 |    * Smart exercise search with scoring
    175 |    */
  > 176 |   async searchExercises(query: ExerciseSearchQuery): Promise<ExerciseSearchResult[]> {
        |                                                              ^^^^^^^^^^^^^^^^^^^^
    177 |     await this.initialize();
    178 |     
    179 |     let candidates: ExerciseInfo[] = [];
ERROR in src/services/exerciseService.ts:179:21
TS2304: Cannot find name 'ExerciseInfo'.
    177 |     await this.initialize();
    178 |     
  > 179 |     let candidates: ExerciseInfo[] = [];
        |                     ^^^^^^^^^^^^
    180 |
    181 |     // Start with muscle-based search if specified
    182 |     if (query.muscleIds && query.muscleIds.length > 0) {
ERROR in src/services/exerciseService.ts:183:37
TS2304: Cannot find name 'ExerciseInfo'.
    181 |     // Start with muscle-based search if specified
    182 |     if (query.muscleIds && query.muscleIds.length > 0) {
  > 183 |       const muscleResults = new Set<ExerciseInfo>();
        |                                     ^^^^^^^^^^^^
    184 |       
    185 |       for (const muscleId of query.muscleIds) {
    186 |         const exercises = await this.getExercisesForMuscle(muscleId, 'target');
ERROR in src/services/exerciseService.ts:186:70
TS2345: Argument of type '"target"' is not assignable to parameter of type '"high" | "medium" | "low" | undefined'.
    184 |       
    185 |       for (const muscleId of query.muscleIds) {
  > 186 |         const exercises = await this.getExercisesForMuscle(muscleId, 'target');
        |                                                                      ^^^^^^^^
    187 |         exercises.forEach(ex => muscleResults.add(ex));
    188 |       }
    189 |       
ERROR in src/services/exerciseService.ts:199:27
TS7006: Parameter 'eq' implicitly has an 'any' type.
    197 |     if (query.equipment) {
    198 |       candidates = candidates.filter(ex => 
  > 199 |         ex.equipment.some(eq => query.equipment!.includes(eq))
        |                           ^^
    200 |       );
    201 |     }
    202 |
ERROR in src/services/exerciseService.ts:211:31
TS7006: Parameter 'type' implicitly has an 'any' type.
    209 |     if (query.trainingTypes) {
    210 |       candidates = candidates.filter(ex => 
  > 211 |         ex.trainingTypes.some(type => query.trainingTypes!.includes(type))
        |                               ^^^^
    212 |       );
    213 |     }
    214 |
ERROR in src/services/exerciseService.ts:232:28
TS7006: Parameter 'tag' implicitly has an 'any' type.
    230 |       candidates = candidates.filter(ex => 
    231 |         ex.name.toLowerCase().includes(searchTerm) ||
  > 232 |         ex.searchTags.some(tag => tag.toLowerCase().includes(searchTerm))
        |                            ^^^
    233 |       );
    234 |     }
    235 |
ERROR in src/services/exerciseService.ts:237:20
TS2304: Cannot find name 'ExerciseSearchResult'.
    235 |
    236 |     // Calculate relevance scores
  > 237 |     const results: ExerciseSearchResult[] = candidates.map(exercise => {
        |                    ^^^^^^^^^^^^^^^^^^^^
    238 |       const relevanceScore = this.calculateRelevanceScore(exercise, query);
    239 |       const muscleMatchCount = query.muscleIds ? 
    240 |         this.countMuscleMatches(exercise, query.muscleIds) : 0;
ERROR in src/services/exerciseService.ts:260:53
TS2304: Cannot find name 'EquipmentType'.
    258 |    * Get exercises by equipment availability
    259 |    */
  > 260 |   async getExercisesByEquipment(availableEquipment: EquipmentType[]): Promise<ExerciseInfo[]> {
        |                                                     ^^^^^^^^^^^^^
    261 |     await this.initialize();
    262 |     return await db.getExercisesByEquipment(availableEquipment);
    263 |   }
ERROR in src/services/exerciseService.ts:260:79
TS2304: Cannot find name 'ExerciseInfo'.
    258 |    * Get exercises by equipment availability
    259 |    */
  > 260 |   async getExercisesByEquipment(availableEquipment: EquipmentType[]): Promise<ExerciseInfo[]> {
        |                                                                               ^^^^^^^^^^^^
    261 |     await this.initialize();
    262 |     return await db.getExercisesByEquipment(availableEquipment);
    263 |   }
ERROR in src/services/exerciseService.ts:268:46
TS2304: Cannot find name 'DifficultyLevel'.
    266 |    * Get exercises by difficulty level
    267 |    */
  > 268 |   async getExercisesByDifficulty(difficulty: DifficultyLevel): Promise<ExerciseInfo[]> {
        |                                              ^^^^^^^^^^^^^^^
    269 |     await this.initialize();
    270 |     return await db.getExercisesByDifficulty(difficulty);
    271 |   }
ERROR in src/services/exerciseService.ts:268:72
TS2304: Cannot find name 'ExerciseInfo'.
    266 |    * Get exercises by difficulty level
    267 |    */
  > 268 |   async getExercisesByDifficulty(difficulty: DifficultyLevel): Promise<ExerciseInfo[]> {
        |                                                                        ^^^^^^^^^^^^
    269 |     await this.initialize();
    270 |     return await db.getExercisesByDifficulty(difficulty);
    271 |   }
ERROR in src/services/exerciseService.ts:276:70
TS2304: Cannot find name 'ExerciseInfo'.
    274 |    * Quick text search across exercise names and tags
    275 |    */
  > 276 |   async quickSearch(searchTerm: string, limit: number = 20): Promise<ExerciseInfo[]> {
        |                                                                      ^^^^^^^^^^^^
    277 |     await this.initialize();
    278 |     const results = await db.searchExercises(searchTerm);
    279 |     return results.slice(0, limit);
ERROR in src/services/exerciseService.ts:285:53
TS2304: Cannot find name 'ExerciseInfo'.
    283 |    * Get antagonist exercises for balanced training
    284 |    */
  > 285 |   async getAntagonists(exerciseId: number): Promise<ExerciseInfo[]> {
        |                                                     ^^^^^^^^^^^^
    286 |     await this.initialize();
    287 |     
    288 |     const relationships = await db.getExerciseRelationships(exerciseId);
ERROR in src/services/exerciseService.ts:288:61
TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
    286 |     await this.initialize();
    287 |     
  > 288 |     const relationships = await db.getExerciseRelationships(exerciseId);
        |                                                             ^^^^^^^^^^
    289 |     if (!relationships) return [];
    290 |
    291 |     const antagonistIds = (relationships.antagonists || []).map(link => link.exerciseId);
ERROR in src/services/exerciseService.ts:291:42
TS2339: Property 'antagonists' does not exist on type 'SimpleExerciseRelations'.
    289 |     if (!relationships) return [];
    290 |
  > 291 |     const antagonistIds = (relationships.antagonists || []).map(link => link.exerciseId);
        |                                          ^^^^^^^^^^^
    292 |     
    293 |     const antagonists: ExerciseInfo[] = [];
    294 |     for (const id of antagonistIds) {
ERROR in src/services/exerciseService.ts:291:65
TS7006: Parameter 'link' implicitly has an 'any' type.
    289 |     if (!relationships) return [];
    290 |
  > 291 |     const antagonistIds = (relationships.antagonists || []).map(link => link.exerciseId);
        |                                                                 ^^^^
    292 |     
    293 |     const antagonists: ExerciseInfo[] = [];
    294 |     for (const id of antagonistIds) {
ERROR in src/services/exerciseService.ts:293:24
TS2304: Cannot find name 'ExerciseInfo'.
    291 |     const antagonistIds = (relationships.antagonists || []).map(link => link.exerciseId);
    292 |     
  > 293 |     const antagonists: ExerciseInfo[] = [];
        |                        ^^^^^^^^^^^^
    294 |     for (const id of antagonistIds) {
    295 |       const exercise = await db.getExercise(id);
    296 |       if (exercise) antagonists.push(exercise);
ERROR in src/services/exerciseService.ts:307:25
TS2304: Cannot find name 'EquipmentType'.
    305 |   async getRecommendations(
    306 |     targetMuscles: number[],
  > 307 |     availableEquipment: EquipmentType[],
        |                         ^^^^^^^^^^^^^
    308 |     userLevel: DifficultyLevel,
    309 |     excludeExercises: number[] = []
    310 |   ): Promise<{
ERROR in src/services/exerciseService.ts:308:16
TS2304: Cannot find name 'DifficultyLevel'.
    306 |     targetMuscles: number[],
    307 |     availableEquipment: EquipmentType[],
  > 308 |     userLevel: DifficultyLevel,
        |                ^^^^^^^^^^^^^^^
    309 |     excludeExercises: number[] = []
    310 |   ): Promise<{
    311 |     primary: ExerciseInfo[];
ERROR in src/services/exerciseService.ts:311:14
TS2304: Cannot find name 'ExerciseInfo'.
    309 |     excludeExercises: number[] = []
    310 |   ): Promise<{
  > 311 |     primary: ExerciseInfo[];
        |              ^^^^^^^^^^^^
    312 |     alternatives: ExerciseInfo[];
    313 |     antagonists: ExerciseInfo[];
    314 |   }> {
ERROR in src/services/exerciseService.ts:312:19
TS2304: Cannot find name 'ExerciseInfo'.
    310 |   ): Promise<{
    311 |     primary: ExerciseInfo[];
  > 312 |     alternatives: ExerciseInfo[];
        |                   ^^^^^^^^^^^^
    313 |     antagonists: ExerciseInfo[];
    314 |   }> {
    315 |     await this.initialize();
ERROR in src/services/exerciseService.ts:313:18
TS2304: Cannot find name 'ExerciseInfo'.
    311 |     primary: ExerciseInfo[];
    312 |     alternatives: ExerciseInfo[];
  > 313 |     antagonists: ExerciseInfo[];
        |                  ^^^^^^^^^^^^
    314 |   }> {
    315 |     await this.initialize();
    316 |
ERROR in src/services/exerciseService.ts:317:20
TS2304: Cannot find name 'ExerciseInfo'.
    315 |     await this.initialize();
    316 |
  > 317 |     const primary: ExerciseInfo[] = [];
        |                    ^^^^^^^^^^^^
    318 |     const alternatives: ExerciseInfo[] = [];
    319 |     const antagonists: ExerciseInfo[] = [];
    320 |
ERROR in src/services/exerciseService.ts:318:25
TS2304: Cannot find name 'ExerciseInfo'.
    316 |
    317 |     const primary: ExerciseInfo[] = [];
  > 318 |     const alternatives: ExerciseInfo[] = [];
        |                         ^^^^^^^^^^^^
    319 |     const antagonists: ExerciseInfo[] = [];
    320 |
    321 |     // Get primary exercises for each target muscle
ERROR in src/services/exerciseService.ts:319:24
TS2304: Cannot find name 'ExerciseInfo'.
    317 |     const primary: ExerciseInfo[] = [];
    318 |     const alternatives: ExerciseInfo[] = [];
  > 319 |     const antagonists: ExerciseInfo[] = [];
        |                        ^^^^^^^^^^^^
    320 |
    321 |     // Get primary exercises for each target muscle
    322 |     for (const muscleId of targetMuscles) {
ERROR in src/services/exerciseService.ts:323:68
TS2345: Argument of type '"target"' is not assignable to parameter of type '"high" | "medium" | "low" | undefined'.
    321 |     // Get primary exercises for each target muscle
    322 |     for (const muscleId of targetMuscles) {
  > 323 |       const exercises = await this.getExercisesForMuscle(muscleId, 'target', {
        |                                                                    ^^^^^^^^
    324 |         difficulty: [userLevel],
    325 |         equipment: availableEquipment,
    326 |         limit: 3
ERROR in src/services/exerciseService.ts:329:74
TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
    327 |       });
    328 |
  > 329 |       const filtered = exercises.filter(ex => !excludeExercises.includes(ex.id));
        |                                                                          ^^^^^
    330 |       primary.push(...filtered);
    331 |     }
    332 |
ERROR in src/services/exerciseService.ts:351:45
TS2304: Cannot find name 'ExerciseInfo'.
    349 |    * Private helper methods
    350 |    */
  > 351 |   private calculateRelevanceScore(exercise: ExerciseInfo, query: ExerciseSearchQuery): number {
        |                                             ^^^^^^^^^^^^
    352 |     let score = 0;
    353 |
    354 |     // Muscle match scoring
ERROR in src/services/exerciseService.ts:351:66
TS2304: Cannot find name 'ExerciseSearchQuery'.
    349 |    * Private helper methods
    350 |    */
  > 351 |   private calculateRelevanceScore(exercise: ExerciseInfo, query: ExerciseSearchQuery): number {
        |                                                                  ^^^^^^^^^^^^^^^^^^^
    352 |     let score = 0;
    353 |
    354 |     // Muscle match scoring
ERROR in src/services/exerciseService.ts:362:58
TS7006: Parameter 'eq' implicitly has an 'any' type.
    360 |     // Equipment match scoring
    361 |     if (query.equipment) {
  > 362 |       const equipmentMatches = exercise.equipment.filter(eq => 
        |                                                          ^^
    363 |         query.equipment!.includes(eq)
    364 |       ).length;
    365 |       score += equipmentMatches * 0.2;
ERROR in src/services/exerciseService.ts:375:57
TS7006: Parameter 'type' implicitly has an 'any' type.
    373 |     // Training type match scoring
    374 |     if (query.trainingTypes) {
  > 375 |       const typeMatches = exercise.trainingTypes.filter(type => 
        |                                                         ^^^^
    376 |         query.trainingTypes!.includes(type)
    377 |       ).length;
    378 |       score += typeMatches * 0.1;
ERROR in src/services/exerciseService.ts:389:40
TS2304: Cannot find name 'ExerciseInfo'.
    387 |   }
    388 |
  > 389 |   private countMuscleMatches(exercise: ExerciseInfo, targetMuscles: number[]): number {
        |                                        ^^^^^^^^^^^^
    390 |     const allExerciseMuscles = [
    391 |       ...exercise.muscleActivation.target,
    392 |       ...exercise.muscleActivation.synergists,
ERROR in src/services/exerciseService.ts:399:42
TS2304: Cannot find name 'ExerciseInfo'.
    397 |   }
    398 |
  > 399 |   private findMissingEquipment(exercise: ExerciseInfo, availableEquipment: EquipmentType[]): EquipmentType[] {
        |                                          ^^^^^^^^^^^^
    400 |     return exercise.equipment.filter(eq => !availableEquipment.includes(eq));
    401 |   }
    402 |
ERROR in src/services/exerciseService.ts:399:76
TS2304: Cannot find name 'EquipmentType'.
    397 |   }
    398 |
  > 399 |   private findMissingEquipment(exercise: ExerciseInfo, availableEquipment: EquipmentType[]): EquipmentType[] {
        |                                                                            ^^^^^^^^^^^^^
    400 |     return exercise.equipment.filter(eq => !availableEquipment.includes(eq));
    401 |   }
    402 |
ERROR in src/services/exerciseService.ts:399:94
TS2304: Cannot find name 'EquipmentType'.
    397 |   }
    398 |
  > 399 |   private findMissingEquipment(exercise: ExerciseInfo, availableEquipment: EquipmentType[]): EquipmentType[] {
        |                                                                                              ^^^^^^^^^^^^^
    400 |     return exercise.equipment.filter(eq => !availableEquipment.includes(eq));
    401 |   }
    402 |
ERROR in src/services/exerciseService.ts:400:38
TS7006: Parameter 'eq' implicitly has an 'any' type.
    398 |
    399 |   private findMissingEquipment(exercise: ExerciseInfo, availableEquipment: EquipmentType[]): EquipmentType[] {
  > 400 |     return exercise.equipment.filter(eq => !availableEquipment.includes(eq));
        |                                      ^^
    401 |   }
    402 |
    403 |   /**
ERROR in src/services/exerciseService.ts:406:36
TS2304: Cannot find name 'ExerciseInfo'.
    404 |    * Sort exercises based on user preference and context
    405 |    */
  > 406 |   private sortExercises(exercises: ExerciseInfo[], sortBy: SortType, selectedMuscleId?: number): ExerciseInfo[] {
        |                                    ^^^^^^^^^^^^
    407 |     switch (sortBy) {
    408 |       case 'relevance':
    409 |         return exercises.sort((a, b) => {
ERROR in src/services/exerciseService.ts:406:98
TS2304: Cannot find name 'ExerciseInfo'.
    404 |    * Sort exercises based on user preference and context
    405 |    */
  > 406 |   private sortExercises(exercises: ExerciseInfo[], sortBy: SortType, selectedMuscleId?: number): ExerciseInfo[] {
        |                                                                                                  ^^^^^^^^^^^^
    407 |     switch (sortBy) {
    408 |       case 'relevance':
    409 |         return exercises.sort((a, b) => {
ERROR in src/services/exerciseService.ts:454:45
TS2304: Cannot find name 'ExerciseInfo'.
    452 |    * Get muscle relevance score for sorting
    453 |    */
  > 454 |   private getMuscleRelevanceScore(exercise: ExerciseInfo, muscleId: number): number {
        |                                             ^^^^^^^^^^^^
    455 |     if (exercise.muscleActivation.target.includes(muscleId)) {
    456 |       return 3; // Target muscle = highest relevance
    457 |     }
ERROR in src/services/exerciseService.ts:472:26
TS2304: Cannot find name 'DifficultyLevel'.
    470 |   async getStats(): Promise<{
    471 |     totalExercises: number;
  > 472 |     byDifficulty: Record<DifficultyLevel, number>;
        |                          ^^^^^^^^^^^^^^^
    473 |     byEquipment: Record<string, number>;
    474 |     musclesCovered: number;
    475 |   }> {
ERROR in src/services/exerciseService.ts:480:32
TS2304: Cannot find name 'DifficultyLevel'.
    478 |     const allExercises = await db.getAllExercises();
    479 |     
  > 480 |     const byDifficulty: Record<DifficultyLevel, number> = {
        |                                ^^^^^^^^^^^^^^^
    481 |       'beginner': 0,
    482 |       'intermediate': 0,
    483 |       'advanced': 0
ERROR in src/services/exerciseService.ts:496:16
TS2339: Property 'muscleActivation' does not exist on type 'SimpleExercise'.
    494 |       }
    495 |       
  > 496 |       exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
        |                ^^^^^^^^^^^^^^^^
    497 |       exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
    498 |       exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
    499 |     }
ERROR in src/services/exerciseService.ts:496:48
TS7006: Parameter 'm' implicitly has an 'any' type.
    494 |       }
    495 |       
  > 496 |       exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
        |                                                ^
    497 |       exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
    498 |       exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
    499 |     }
ERROR in src/services/exerciseService.ts:497:16
TS2339: Property 'muscleActivation' does not exist on type 'SimpleExercise'.
    495 |       
    496 |       exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
  > 497 |       exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
        |                ^^^^^^^^^^^^^^^^
    498 |       exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
    499 |     }
    500 |     
ERROR in src/services/exerciseService.ts:497:52
TS7006: Parameter 'm' implicitly has an 'any' type.
    495 |       
    496 |       exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
  > 497 |       exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
        |                                                    ^
    498 |       exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
    499 |     }
    500 |     
ERROR in src/services/exerciseService.ts:498:16
TS2339: Property 'muscleActivation' does not exist on type 'SimpleExercise'.
    496 |       exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
    497 |       exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
  > 498 |       exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
        |                ^^^^^^^^^^^^^^^^
    499 |     }
    500 |     
    501 |     return {
ERROR in src/services/exerciseService.ts:498:53
TS7006: Parameter 'm' implicitly has an 'any' type.
    496 |       exercise.muscleActivation.target.forEach(m => muscleSet.add(m));
    497 |       exercise.muscleActivation.synergists.forEach(m => muscleSet.add(m));
  > 498 |       exercise.muscleActivation.stabilizers.forEach(m => muscleSet.add(m));
        |                                                     ^
    499 |     }
    500 |     
    501 |     return {
ERROR in src/services/testExerciseImport.ts:20:77
TS2345: Argument of type '"target"' is not assignable to parameter of type '"high" | "medium" | "low" | undefined'.
    18 |     // Test muscle-based queries
    19 |     console.log('\n💪 Testing muscle-based queries...');
  > 20 |     const chestExercises = await exerciseService.getExercisesForMuscle(161, 'target', { limit: 5 });
       |                                                                             ^^^^^^^^
    21 |     console.log(`Found ${chestExercises.length} chest exercises:`, chestExercises.map(ex => ex.name));
    22 |
    23 |     // Test equipment filtering
ERROR in src/types/index.ts:4:1
TS2308: Module './models' has already exported a member named 'FiberType'. Consider explicitly re-exporting to resolve the ambiguity.
    2 | export * from './SimpleExerciseTypes';
    3 | export * from './models';
  > 4 | export * from './MuscleActivationTypes';
      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    5 |
    6 | // Re-export for backwards compatibility
    7 | export type { SimpleExercise as Exercise } from './SimpleExerciseTypes';