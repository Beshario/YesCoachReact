export interface MuscleInfo {
    id: number;
    name: string;
    templateRef: string;
    exrxName: string;
    category: string;
    subCategory?: string;
    commonNames: string[];
    anatomicalLocation: 'front' | 'back' | 'both';
    isClickableOnBodyMap: boolean;
    parentId?: number;
    children?: number[];
    searchTags: string[];
    fiberType: 'fast' | 'slow' | 'mixed';
    trainingFocus: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'stability';
    exrxUrl?: string;
    isDeepMuscle: boolean;
}
export declare const muscleData: Record<number, MuscleInfo>;
export declare const getMuscleById: (id: number) => MuscleInfo | undefined;
export declare const searchMuscles: (query: string) => MuscleInfo[];
export declare const getMusclesByCategory: (category: string) => MuscleInfo[];
export declare const getClickableMuscles: () => MuscleInfo[];
export declare const getSearchableMuscles: () => MuscleInfo[];
export declare const getDeepMuscles: () => MuscleInfo[];
export declare const getParentMuscles: () => MuscleInfo[];
export declare const getChildMuscles: (parentId: number) => MuscleInfo[];
export declare const getMusclesByTrainingFocus: (focus: string) => MuscleInfo[];
export declare const getCategories: () => string[];
export declare const getBodyMapMuscles: () => MuscleInfo[];
export declare const getBrowseMuscles: () => MuscleInfo[];
export declare const getAdvancedMuscles: () => MuscleInfo[];
//# sourceMappingURL=MuscleData.d.ts.map