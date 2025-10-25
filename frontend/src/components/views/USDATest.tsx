import React, { useState } from 'react';
import { usdaApi } from '../../utils/usdaApi';

export const USDATest: React.FC = () => {
  const [query, setQuery] = useState('apple');
  const [amount, setAmount] = useState(100);
  const [unit, setUnit] = useState('g');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Testing USDA API with:', { query, amount, unit });
      
      const searchResults = await usdaApi.searchAndGetNutrition(query, amount, unit);
      console.log('Search results:', searchResults);
      setResults(searchResults);
    } catch (err) {
      console.error('USDA API test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testSingleFood = async (fdcId: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Testing single food details for FDC ID:', fdcId);
      
      const foodDetails = await usdaApi.getFoodDetails(fdcId);
      console.log('Food details:', foodDetails);
      
      const nutrition = usdaApi.extractNutritionData(foodDetails);
      console.log('Extracted nutrition:', nutrition);
      
      alert(`Food: ${foodDetails.description}\nNutrition: ${JSON.stringify(nutrition, null, 2)}`);
    } catch (err) {
      console.error('Single food test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">USDA API Test</h1>
      
      {/* API Key Status */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ API Key Status</h2>
        <p className="text-yellow-700 mb-2">
          {import.meta.env.VITE_USDA_API_KEY 
            ? '✅ USDA API key found - using real data' 
            : '❌ USDA API key missing - using mock data for testing'
          }
        </p>
        <p className="text-sm text-yellow-600">
          To get real USDA data, add <code className="bg-yellow-100 px-1 rounded">VITE_USDA_API_KEY=your_key_here</code> to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file
        </p>
        <p className="text-sm text-yellow-600 mt-1">
          Get your free API key from: <a href="https://fdc.nal.usda.gov/api-key-signup.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://fdc.nal.usda.gov/api-key-signup.html</a>
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Food Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., apple, chicken"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="g">Grams</option>
              <option value="oz">Ounces</option>
              <option value="cup">Cups</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={testSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Search'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="space-y-4">
            {results.map((food, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{food.description}</h3>
                    {food.brandOwner && (
                      <p className="text-sm text-gray-600">{food.brandOwner}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      FDC ID: {food.fdcId} | Type: {food.dataType}
                    </p>
                  </div>
                  <button
                    onClick={() => testSingleFood(food.fdcId)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Test Details
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Calories:</span> {food.nutrition.calories}
                  </div>
                  <div>
                    <span className="font-medium">Protein:</span> {food.nutrition.protein}g
                  </div>
                  <div>
                    <span className="font-medium">Carbs:</span> {food.nutrition.carbs}g
                  </div>
                  <div>
                    <span className="font-medium">Fats:</span> {food.nutrition.fats}g
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  For {food.amount}{food.unit} | Carbon: {food.carbonFootprint.toFixed(3)}kg
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
