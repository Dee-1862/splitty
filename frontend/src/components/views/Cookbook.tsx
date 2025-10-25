import React, { useState } from 'react';
import { Camera, Upload, Search, ChefHat } from 'lucide-react';

export const Cookbook: React.FC = () => {
  const [mode, setMode] = useState<'assemble' | 'cook'>('assemble');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Cookbook</h1>
        </div>
        <p className="text-gray-600">AI-powered recipe generation from ingredients</p>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Choose Mode</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('assemble')}
            className={`p-6 rounded-xl border-2 transition-all ${
              mode === 'assemble'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">🥗</div>
            <h3 className="font-semibold text-gray-900 mb-1">Assemble</h3>
            <p className="text-sm text-gray-600">
              Use existing ingredients without cooking
            </p>
          </button>
          <button
            onClick={() => setMode('cook')}
            className={`p-6 rounded-xl border-2 transition-all ${
              mode === 'cook'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">🍳</div>
            <h3 className="font-semibold text-gray-900 mb-1">Cook</h3>
            <p className="text-sm text-gray-600">
              Create cooked recipes with instructions
            </p>
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Upload Ingredients</h2>
        
        {/* Camera Button */}
        <button className="w-full bg-primary-600 text-white py-4 rounded-xl mb-4 hover:bg-primary-700 transition-colors flex items-center justify-center gap-3">
          <Camera size={24} />
          <span className="font-medium">Take Photo</span>
        </button>

        {/* Upload Button */}
        <button className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:border-gray-400 transition-colors flex items-center justify-center gap-3">
          <Upload size={24} />
          <span className="font-medium">Upload from Gallery</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Or type ingredients manually below
        </p>
      </div>

      {/* Manual Input */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Type ingredients (e.g., chicken, tomatoes, rice)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button 
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl mb-6 hover:shadow-lg transition-all font-semibold disabled:opacity-50"
      >
        {loading ? 'Generating Recipe...' : 'Generate Recipe'}
      </button>

      {/* Recipes List */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <ChefHat className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 mb-2">No recipes yet</p>
          <p className="text-sm text-gray-400">
            Upload ingredients to generate AI-powered recipes!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <img
                src={recipe.image || 'https://via.placeholder.com/400x200'}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <span>⏱️ {recipe.prep_time}</span>
                  <span>🔥 {recipe.difficulty}</span>
                  <span>🌱 {recipe.carbon_kg}kg CO₂</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
