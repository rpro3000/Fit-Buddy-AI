
import { useState, useEffect, useCallback } from 'react';
import { DailyData, DailyLog, Meal, Nutrients } from '../types';
import { format } from 'date-fns';

const LATEST_LOG_DATE_KEY = 'fitBuddyAILatestLogDate';
const DAILY_DATA_KEY = 'fitBuddyAIDailyData';

const DEFAULT_TARGETS: Nutrients = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 70,
};

const getInitialDate = (): Date => {
  const savedDate = localStorage.getItem(LATEST_LOG_DATE_KEY);
  return savedDate ? new Date(savedDate) : new Date();
};

const getInitialData = (): DailyData => {
  try {
    const savedData = localStorage.getItem(DAILY_DATA_KEY);
    return savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    console.error("Failed to parse daily data from localStorage", error);
    return {};
  }
};

export const useDailyLog = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [dailyData, setDailyData] = useState<DailyData>(getInitialData());

  useEffect(() => {
    try {
      localStorage.setItem(DAILY_DATA_KEY, JSON.stringify(dailyData));
      localStorage.setItem(LATEST_LOG_DATE_KEY, selectedDate.toISOString());
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [dailyData, selectedDate]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const dailyLog: DailyLog = dailyData[dateKey] ?? {
    meals: [],
    targets: DEFAULT_TARGETS,
  };
  
  const addMeal = useCallback((meal: Omit<Meal, 'id' | 'timestamp'>) => {
    const newMeal: Meal = {
      ...meal,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setDailyData(prevData => {
        const currentLog = prevData[dateKey] ?? { meals: [], targets: DEFAULT_TARGETS };
        return {
            ...prevData,
            [dateKey]: {
                ...currentLog,
                meals: [...currentLog.meals, newMeal]
            }
        };
    });
  }, [dateKey]);

  const totals: Nutrients = dailyLog.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.nutrients.calories,
      protein: acc.protein + meal.nutrients.protein,
      carbs: acc.carbs + meal.nutrients.carbs,
      fat: acc.fat + meal.nutrients.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { selectedDate, setSelectedDate, dailyLog, addMeal, totals };
};
