
import React, { useState, useCallback } from 'react';
import { analyzeMealImage } from '../services/geminiService';
import { Meal, Nutrients } from '../types';
import { XMarkIcon, CameraIcon, SparklesIcon } from './Icons';

interface AddMealModalProps {
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const AddMealModal: React.FC<AddMealModalProps> = ({ onClose, onAddMeal }) => {
  const [name, setName] = useState('');
  const [nutrients, setNutrients] = useState<Nutrients>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setImagePreview(URL.createObjectURL(file));
      setMimeType(file.type);
      try {
        const b64 = await fileToBase64(file);
        setBase64Image(b64);
        const analysis = await analyzeMealImage(b64, file.type);
        setName(analysis.mealName);
        setNutrients({
          calories: Math.round(analysis.calories),
          protein: Math.round(analysis.protein),
          carbs: Math.round(analysis.carbs),
          fat: Math.round(analysis.fat),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to analyze image.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNutrientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNutrients(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && nutrients.calories > 0) {
      onAddMeal({
        name,
        nutrients,
        imageUrl: imagePreview || undefined,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">Add Meal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center">
            <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleImageChange} />
            <label htmlFor="imageUpload" className="cursor-pointer group">
              <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                  </div>
                )}
                {imagePreview ? (
                  <img src={imagePreview} alt="Meal preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <CameraIcon className="w-10 h-10 text-gray-400 group-hover:text-violet-500" />
                    <p className="mt-2 text-sm text-gray-500">Tap to upload a photo</p>
                    <p className="flex items-center gap-1 text-xs text-violet-500 font-semibold"><SparklesIcon className="w-3 h-3"/> AI Analysis</p>
                  </>
                )}
              </div>
            </label>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Meal Name</label>
            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories (kcal)</label>
              <input type="number" name="calories" id="calories" value={nutrients.calories} onChange={handleNutrientChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" required />
            </div>
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein (g)</label>
              <input type="number" name="protein" id="protein" value={nutrients.protein} onChange={handleNutrientChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" />
            </div>
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">Carbs (g)</label>
              <input type="number" name="carbs" id="carbs" value={nutrients.carbs} onChange={handleNutrientChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" />
            </div>
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700">Fat (g)</label>
              <input type="number" name="fat" id="fat" value={nutrients.fat} onChange={handleNutrientChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-400" disabled={isLoading || !name}>
              {isLoading ? 'Analyzing...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;