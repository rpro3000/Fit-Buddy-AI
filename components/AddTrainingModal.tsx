import React, { useState } from 'react';
import { Training } from '../types';
import { XMarkIcon } from './Icons';

interface AddTrainingModalProps {
  onClose: () => void;
  onAddTraining: (training: Omit<Training, 'id' | 'timestamp'>) => void;
}

const AddTrainingModal: React.FC<AddTrainingModalProps> = ({ onClose, onAddTraining }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && Number(duration) > 0 && Number(caloriesBurned) > 0) {
      onAddTraining({
        name,
        duration: Number(duration),
        caloriesBurned: Number(caloriesBurned),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Add Training</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Activity Name</label>
            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" required placeholder="e.g., Morning Run"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (min)</label>
              <input type="number" name="duration" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" required />
            </div>
            <div>
              <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700">Calories</label>
              <input type="number" name="caloriesBurned" id="caloriesBurned" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" required />
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-400" disabled={!name || !duration || !caloriesBurned}>
              Add Training
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTrainingModal;