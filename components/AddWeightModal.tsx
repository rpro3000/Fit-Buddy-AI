import React, { useState } from 'react';
import { XMarkIcon } from './Icons';

interface AddWeightModalProps {
  onClose: () => void;
  onSave: (weight: number) => void;
  currentWeight?: number;
}

const AddWeightModal: React.FC<AddWeightModalProps> = ({ onClose, onSave, currentWeight }) => {
  const [weight, setWeight] = useState(currentWeight || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && Number(weight) > 0) {
      onSave(Number(weight));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Log Weight</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Today's Weight (kg)</label>
            <input
              type="number"
              name="weight"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
              required
              step="0.1"
              placeholder="e.g., 75.5"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-400"
              disabled={!weight}
            >
              Save Weight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWeightModal;