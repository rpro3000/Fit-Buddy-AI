
import React from 'react';
import { Meal } from '../types';
import { FireIcon } from './Icons';
import { format } from 'date-fns';

interface RecentMealItemProps {
  meal: Meal;
}

const RecentMealItem: React.FC<RecentMealItemProps> = ({ meal }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        {meal.imageUrl ? (
          <img src={meal.imageUrl} alt={meal.name} className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
            <FireIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800 capitalize">{meal.name}</h3>
            <span className="text-xs text-gray-400">{format(new Date(meal.timestamp), 'h:mm a')}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
          <span className="font-medium text-red-500">P: {meal.nutrients.protein}g</span>
          <span className="font-medium text-yellow-500">C: {meal.nutrients.carbs}g</span>
          <span className="font-medium text-green-500">F: {meal.nutrients.fat}g</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-violet-600">{meal.nutrients.calories}</p>
        <p className="text-xs text-gray-400">kcal</p>
      </div>
    </div>
  );
};

export default RecentMealItem;