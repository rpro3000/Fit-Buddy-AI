import React, { useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import Calendar from './Calendar';
import NutrientTracker from './NutrientTracker';
import RecentMealItem from './RecentMealItem';
import AddMealModal from './AddMealModal';
// FIX: Removed unused and non-existent icon imports for BoltIcon and CpuChipIcon.
import { PlusIcon, FireIcon } from './Icons';

const Dashboard: React.FC = () => {
  const { selectedDate, setSelectedDate, dailyLog, addMeal, totals } = useDailyLog();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const remainingCalories = dailyLog.targets.calories - totals.calories;

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Fit Buddy <span className="text-blue-600">AI</span></h1>
        <p className="text-gray-500">Your AI-powered nutrition partner.</p>
      </header>
      
      <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="my-6 p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">Calories Eaten</p>
            <p className="text-4xl font-bold text-gray-900">{totals.calories.toLocaleString()}<span className="text-lg text-gray-400 font-normal">/{dailyLog.targets.calories.toLocaleString()}</span></p>
            <p className={`text-sm font-medium ${remainingCalories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {remainingCalories >= 0 ? `${remainingCalories.toLocaleString()} left` : `${Math.abs(remainingCalories).toLocaleString()} over`}
            </p>
          </div>
          <NutrientTracker 
            value={totals.calories} 
            maxValue={dailyLog.targets.calories} 
            size={80} 
            strokeWidth={8}
            color="text-blue-500"
          >
             <FireIcon className="w-6 h-6 text-blue-500" />
          </NutrientTracker>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <NutrientTracker title="Protein" value={totals.protein} maxValue={dailyLog.targets.protein} unit="g" color="text-red-500" />
        <NutrientTracker title="Carbs" value={totals.carbs} maxValue={dailyLog.targets.carbs} unit="g" color="text-yellow-500" />
        <NutrientTracker title="Fat" value={totals.fat} maxValue={dailyLog.targets.fat} unit="g" color="text-green-500" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Added</h2>
        <div className="space-y-3">
          {dailyLog.meals.length > 0 ? (
            dailyLog.meals.slice().reverse().map(meal => (
              <RecentMealItem key={meal.id} meal={meal} />
            ))
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-2xl shadow-md">
              <p className="text-gray-500">No meals logged for this day.</p>
              <p className="text-sm text-gray-400 mt-1">Tap the '+' button to add your first meal!</p>
            </div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-5 md:right-1/2 md:translate-x-[200px] bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-110"
        aria-label="Add Meal"
      >
        <PlusIcon />
      </button>

      {isModalOpen && <AddMealModal onClose={() => setIsModalOpen(false)} onAddMeal={addMeal} />}
    </div>
  );
};

export default Dashboard;