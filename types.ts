
export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  nutrients: Nutrients;
  imageUrl?: string;
  timestamp: string;
}

export interface Training {
    id: string;
    name: string;
    duration: number; // in minutes
    caloriesBurned: number;
    timestamp: string;
}

export interface DailyLog {
  meals: Meal[];
  targets: Nutrients;
  weight?: number;
  trainings: Training[];
}

export type DailyData = Record<string, DailyLog>;

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    groundingChunks?: any[];
}