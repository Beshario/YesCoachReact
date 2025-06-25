export interface MuscleInfo {
  id: number;
  name: string;
  templateRef?: string;
}

export const muscleData: Record<number, MuscleInfo> = {
  1: { id: 1, name: "Chest", templateRef: "muscle1" },
  3: { id: 3, name: "Shoulders", templateRef: "muscle3" },
  5: { id: 5, name: "Upper Traps", templateRef: "muscle5" },
  7: { id: 7, name: "Biceps", templateRef: "muscle7" },
  10: { id: 10, name: "Forearms", templateRef: "muscle10" },
  12: { id: 12, name: "Core", templateRef: "muscle12" },
  13: { id: 13, name: "Serratus Anterior", templateRef: "muscle13" },
  14: { id: 14, name: "Obliques", templateRef: "muscle14" },
  15: { id: 15, name: "Hip Adductors", templateRef: "muscle15" },
  17: { id: 17, name: "Quads", templateRef: "muscle17" },
  22: { id: 22, name: "Calves", templateRef: "muscle22" },
  31: { id: 31, name: "Trapezius", templateRef: "muscle31" },
  32: { id: 32, name: "Lower Traps", templateRef: "muscle32" },
  33: { id: 33, name: "Teres", templateRef: "muscle33" },
  34: { id: 34, name: "Posterior Deltoid", templateRef: "muscle34" },
  36: { id: 36, name: "Triceps", templateRef: "muscle36" },
  38: { id: 38, name: "Forearms", templateRef: "muscle38" },
  39: { id: 39, name: "Latissimus Dorsi", templateRef: "muscle39" },
  40: { id: 40, name: "Lower Back", templateRef: "muscle40" },
  42: { id: 42, name: "Glutes", templateRef: "muscle41_5" },
  43: { id: 43, name: "External Obliques", templateRef: "muscle43" },
  44: { id: 44, name: "Hamstrings", templateRef: "muscle44" },
  47: { id: 47, name: "Calves", templateRef: "muscle47" },
  50: { id: 50, name: "Heart", templateRef: "muscle50" },
};

export const muscleList = Object.values(muscleData);

export const getMuscleById = (id: number): MuscleInfo | undefined => {
  return muscleData[id];
};

export const searchMuscles = (query: string): MuscleInfo[] => {
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return muscleList.filter(muscle => 
    muscle.name.toLowerCase().includes(lowercaseQuery)
  );
};