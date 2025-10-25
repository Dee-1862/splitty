import React, { useState } from 'react';
import { X, Plus, Search, Loader2 } from 'lucide-react';
import { addMeal, type Meal } from '../../utils/database';
import { usdaApi, type NutritionData } from '../../utils/usdaApi';
import { toast } from 'react-toastify';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealAdded: () => void;
  userId: string;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onMealAdded,
  userId
}) => {
  const [formData, setFormData] = useState({
    meal_type: 'breakfast' as const,
    food_items: [''],
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
    carbon_kg: 0,
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [foodAmount, setFoodAmount] = useState(100);
  const [foodUnit, setFoodUnit] = useState('g');

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await usdaApi.searchAndGetNutrition(query, foodAmount, foodUnit);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Failed to search foods. Please try manual entry.');
    } finally {
      setSearching(false);
    }
  };

  // Re-search when amount or unit changes
  const handleAmountChange = (newAmount: number) => {
    setFoodAmount(newAmount);
    if (searchQuery.trim()) {
      searchFoods(searchQuery);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    setFoodUnit(newUnit);
    if (searchQuery.trim()) {
      searchFoods(searchQuery);
    }
  };

  const selectFood = (food: any) => {
    // Use the nutrition data already calculated from search results
    setSelectedFood(food);

    // Update form data with nutrition information
    setFormData(prev => ({
      ...prev,
      food_items: [food.description],
      calories: Math.round(food.nutrition.calories),
      protein_g: Math.round(food.nutrition.protein * 100) / 100,
      carbs_g: Math.round(food.nutrition.carbs * 100) / 100,
      fats_g: Math.round(food.nutrition.fats * 100) / 100,
      carbon_kg: Math.round(food.carbonFootprint * 1000) / 1000
    }));
    
    setSearchResults([]);
    setSearchQuery('');
    toast.success(`${food.amount}${food.unit} of ${food.description} - ${food.nutrition.calories} calories`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mealData = {
        user_id: userId,
        meal_type: formData.meal_type,
        food_items: formData.food_items.filter(item => item.trim() !== ''),
        calories: formData.calories,
        protein_g: formData.protein_g,
        carbs_g: formData.carbs_g,
        fats_g: formData.fats_g,
        carbon_kg: formData.carbon_kg,
        image_url: formData.image_url,
        date: new Date().toISOString().split('T')[0]
      };

      await addMeal(mealData);
      onMealAdded();
      onClose();
      
      // Reset form
      setFormData({
        meal_type: 'breakfast',
        food_items: [''],
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fats_g: 0,
        carbon_kg: 0,
        image_url: ''
      });
      setSelectedFood(null);
      setSearchQuery('');
      setSearchResults([]);
      setUseManualEntry(false);
      
      toast.success('Meal added successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  const addFoodItem = () => {
    setFormData(prev => ({
      ...prev,
      food_items: [...prev.food_items, '']
    }));
  };

  const updateFoodItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      food_items: prev.food_items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeFoodItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      food_items: prev.food_items.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              value={formData.meal_type}
              onChange={(e) => setFormData(prev => ({ ...prev, meal_type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Food Search or Manual Entry */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUseManualEntry(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !useManualEntry 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search Food Database
              </button>
              <button
                type="button"
                onClick={() => setUseManualEntry(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useManualEntry 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Entry
              </button>
            </div>

            {!useManualEntry ? (
              <div>
                {/* Amount and Unit Inputs */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={foodAmount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      min="1"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={foodUnit}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="cup">Cups</option>
                      <option value="tbsp">Tablespoons (tbsp)</option>
                      <option value="tsp">Teaspoons (tsp)</option>
                      <option value="piece">Pieces</option>
                    </select>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Food Database
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchFoods(e.target.value);
                    }}
                    placeholder="Search for foods (e.g., 'apple', 'chicken breast')"
                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((food) => (
                      <button
                        key={food.fdcId}
                        type="button"
                        onClick={() => selectFood(food)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{food.description}</p>
                            {food.brandOwner && (
                              <p className="text-sm text-gray-500">{food.brandOwner}</p>
                            )}
                            <p className="text-xs text-gray-400 capitalize">{food.dataType}</p>
                          </div>
                          <div className="text-right text-sm text-gray-600 ml-4">
                            <p className="font-semibold">{food.nutrition.calories} cal</p>
                            <p className="text-xs">
                              {food.nutrition.protein}g protein • {food.nutrition.carbs}g carbs • {food.nutrition.fats}g fat
                            </p>
                            <p className="text-xs text-gray-500">
                              for {food.amount}{food.unit}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Food */}
                {selectedFood && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Selected: {selectedFood.description}
                        </p>
                        <p className="text-xs text-green-600">
                          {selectedFood.amount}{selectedFood.unit} • Nutrition data loaded automatically
                        </p>
                      </div>
                      <div className="text-right text-sm text-green-700">
                        <p className="font-semibold">{selectedFood.nutrition.calories} cal</p>
                        <p className="text-xs">
                          {selectedFood.nutrition.protein}g protein • {selectedFood.nutrition.carbs}g carbs • {selectedFood.nutrition.fats}g fat
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Items
                </label>
                {formData.food_items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateFoodItem(index, e.target.value)}
                      placeholder="Enter food item"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {formData.food_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFoodItem}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Plus size={16} />
                  Add another item
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.protein_g}
                onChange={(e) => setFormData(prev => ({ ...prev, protein_g: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.carbs_g}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs_g: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fats (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.fats_g}
                onChange={(e) => setFormData(prev => ({ ...prev, fats_g: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carbon Footprint (kg CO₂)
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.carbon_kg}
              onChange={(e) => setFormData(prev => ({ ...prev, carbon_kg: parseFloat(e.target.value) || 0 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {loading ? 'Adding...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
