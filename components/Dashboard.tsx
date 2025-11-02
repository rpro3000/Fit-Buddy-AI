import React, { useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import Calendar from './Calendar';
import RecentMealItem from './RecentMealItem';
import AddMealModal from './AddMealModal';
import AddWeightModal from './AddWeightModal';
import AddTrainingModal from './AddTrainingModal';
import { PlusIcon, ChevronRightIcon } from './Icons';

interface DashboardProps {
  setActiveView: (view: 'dashboard' | 'chat' | 'progress' | 'live') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { selectedDate, setSelectedDate, dailyLog, addMeal, totals, updateWeight, addTraining } = useDailyLog();
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);


  const remainingCalories = dailyLog.targets.calories - totals.calories;
  const calorieProgress = dailyLog.targets.calories > 0 ? (totals.calories / dailyLog.targets.calories) * 100 : 0;


  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Fit Buddy <span className="text-violet-600">AI</span></h1>
            <p className="text-gray-500">Your AI-powered nutrition partner.</p>
        </div>
        <div className="w-12 h-12 bg-violet-200 rounded-full"></div>
      </header>
      
      <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="my-6 p-4 bg-white rounded-2xl shadow-md">
        <div className="flex justify-between items-baseline mb-2">
            <h2 className="font-bold text-lg text-gray-800">Nutrition Summary</h2>
            <p className={`text-sm font-semibold ${remainingCalories >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Math.abs(remainingCalories)} kcal {remainingCalories >=0 ? 'left' : 'over'}
            </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, calorieProgress)}%` }}></div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
            <div className="text-center flex-1">
                <p className="font-bold text-violet-600">{totals.calories}</p>
                <p className="text-gray-500">Kcal</p>
            </div>
            <div className="text-center flex-1">
                <p className="font-bold text-violet-600">{totals.protein}g</p>
                <p className="text-gray-500">Protein</p>
            </div>
            <div className="text-center flex-1">
                <p className="font-bold text-violet-600">{totals.carbs}g</p>
                <p className="text-gray-500">Carbs</p>
            </div>
            <div className="text-center flex-1">
                <p className="font-bold text-violet-600">{totals.fat}g</p>
                <p className="text-gray-500">Fat</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded-2xl shadow-md flex justify-between items-center">
            <div>
                <p className="text-sm font-semibold text-gray-800">Weight</p>
                <p className="text-lg font-bold text-violet-600">{dailyLog.weight ? `${dailyLog.weight} kg` : 'N/A'}</p>
            </div>
            <button onClick={() => setIsWeightModalOpen(true)} className="bg-violet-100 text-violet-600 rounded-full p-2"><PlusIcon /></button>
        </div>
         <div className="p-4 bg-white rounded-2xl shadow-md flex justify-between items-center">
            <div>
                <p className="text-sm font-semibold text-gray-800">Trainings</p>
                <p className="text-lg font-bold text-violet-600">{dailyLog.trainings.length} session(s)</p>
            </div>
            <button onClick={() => setIsTrainingModalOpen(true)} className="bg-violet-100 text-violet-600 rounded-full p-2"><PlusIcon /></button>
        </div>
      </div>

      <div 
        className="p-4 bg-white rounded-2xl shadow-md flex justify-between items-center mb-6 cursor-pointer"
        onClick={() => setActiveView('progress')}
      >
        <div>
            <h3 className="font-bold text-gray-800">Progress</h3>
            <p className="text-sm text-gray-500">View your weight chart</p>
        </div>
        <ChevronRightIcon />
      </div>


      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Meals</h2>
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
        onClick={() => setIsMealModalOpen(true)}
        className="fixed bottom-20 right-5 md:right-1/2 md:translate-x-[200px] bg-violet-600 text-white rounded-full p-4 shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-transform transform hover:scale-110"
        aria-label="Add Meal"
      >
        <PlusIcon />
      </button>

      {isMealModalOpen && <AddMealModal onClose={() => setIsMealModalOpen(false)} onAddMeal={addMeal} />}
      {isWeightModalOpen && <AddWeightModal onClose={() => setIsWeightModalOpen(false)} onSave={updateWeight} currentWeight={dailyLog.weight} />}
      {isTrainingModalOpen && <AddTrainingModal onClose={() => setIsTrainingModalOpen(false)} onAddTraining={addTraining} />}
    </div>
  );
};

export default Dashboard;