import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Search, ChefHat, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { geminiApi } from '../../utils/geminiApi';
import type { DetectedIngredient } from '../../utils/geminiApi';
import type { Recipe } from '../../utils/database';
import { useAuth } from '../../AuthContext';
import { getRecipes, addRecipe, deleteRecipe } from '../../utils/database';

export const Cookbook: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'assemble' | 'cook'>('assemble');
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]); // Gemini API recipes
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [manualIngredients, setManualIngredients] = useState('');
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [nutritionalFilters, setNutritionalFilters] = useState<Array<{
    id: string;
    type: 'calories' | 'protein' | 'carbs' | 'fats';
    min: number;
    max: number;
  }>>([
    { id: '1', type: 'calories', min: 0, max: 1000 }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load saved recipes from Supabase when component mounts
  useEffect(() => {
    if (user?.id) {
      loadSavedRecipes();
    }
  }, [user?.id]);

  const loadSavedRecipes = async () => {
    if (!user?.id) return;
    
    try {
      const recipes = await getRecipes(user.id);
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      toast.error('Failed to load saved recipes');
    }
  };

  // Food preference options
  const foodPreferenceOptions = [
    { id: 'health', label: 'Cook for Health', description: 'Low-calorie, nutritious recipes' },
    { id: 'taste', label: 'Cook for Taste', description: 'Rich, flavorful recipes' },
    { id: 'quick', label: 'Quick & Easy', description: 'Fast preparation recipes' },
    { id: 'budget', label: 'Budget-Friendly', description: 'Affordable ingredient recipes' },
    { id: 'vegetarian', label: 'Vegetarian', description: 'Plant-based recipes' },
    { id: 'vegan', label: 'Vegan', description: 'No animal products' },
    { id: 'keto', label: 'Keto-Friendly', description: 'Low-carb, high-fat recipes' },
    { id: 'gluten-free', label: 'Gluten-Free', description: 'No gluten ingredients' },
    { id: 'protein-rich', label: 'High Protein', description: 'Protein-focused recipes' },
    { id: 'comfort', label: 'Comfort Food', description: 'Hearty, satisfying recipes' }
  ];

  // Get nutrient value from recipe based on type
  const getNutrientValue = (recipe: Recipe, type: string) => {
    switch (type) {
      case 'calories':
        return recipe.calories_per_serving || 0;
      case 'protein':
        return recipe.protein_per_serving || 0;
      case 'carbs':
        return recipe.carbs_per_serving || 0;
      case 'fats':
        return recipe.fats_per_serving || 0;
      default:
        return 0;
    }
  };

  // Toggle food preference
  const toggleFoodPreference = (preferenceId: string) => {
    setFoodPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(p => p !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  // Filter recipes based on nutritional boundaries
  const filteredSavedRecipes = savedRecipes.filter(recipe => {
    return nutritionalFilters.every(filter => {
      const value = getNutrientValue(recipe, filter.type);
      return value >= filter.min && value <= filter.max;
    });
  });

  // Get available nutrient types (excluding already selected ones)
  const getAvailableNutrientTypes = () => {
    const selectedTypes = nutritionalFilters.map(f => f.type);
    const allTypes = [
      { value: 'calories', label: '🔥 Calories', unit: 'kcal', defaultMax: 1000 },
      { value: 'protein', label: '🥩 Protein', unit: 'grams', defaultMax: 50 },
      { value: 'carbs', label: '🍞 Carbs', unit: 'grams', defaultMax: 100 },
      { value: 'fats', label: '🧈 Fats', unit: 'grams', defaultMax: 30 }
    ];
    return allTypes.filter(type => !selectedTypes.includes(type.value as any));
  };

  // Add new nutritional filter
  const addNutritionalFilter = (type: 'calories' | 'protein' | 'carbs' | 'fats') => {
    const newFilter = {
      id: Date.now().toString(),
      type,
      min: 0,
      max: getAvailableNutrientTypes().find(t => t.value === type)?.defaultMax || 100
    };
    setNutritionalFilters(prev => [...prev, newFilter]);
  };

  // Update nutritional filter
  const updateNutritionalFilter = (id: string, field: 'type' | 'min' | 'max', value: string | number) => {
    if (field === 'type') {
      // When changing type, we need to check if the new type is already used by another filter
      const newType = value as 'calories' | 'protein' | 'carbs' | 'fats';
      const isTypeAlreadyUsed = nutritionalFilters.some(filter => 
        filter.id !== id && filter.type === newType
      );
      
      if (isTypeAlreadyUsed) {
        // If type is already used, swap the types
        const otherFilter = nutritionalFilters.find(filter => 
          filter.id !== id && filter.type === newType
        );
        if (otherFilter) {
          const currentFilter = nutritionalFilters.find(filter => filter.id === id);
          if (currentFilter) {
            setNutritionalFilters(prev => prev.map(filter => {
              if (filter.id === id) {
                return { ...filter, type: newType };
              } else if (filter.id === otherFilter.id) {
                return { ...filter, type: currentFilter.type };
              }
              return filter;
            }));
          }
        }
      } else {
        // Type is not used, just update normally
        setNutritionalFilters(prev => prev.map(filter => 
          filter.id === id ? { ...filter, type: newType } : filter
        ));
      }
    } else {
      setNutritionalFilters(prev => prev.map(filter => 
        filter.id === id ? { ...filter, [field]: value } : filter
      ));
    }
  };

  // Remove nutritional filter
  const removeNutritionalFilter = (id: string) => {
    setNutritionalFilters(prev => prev.filter(filter => filter.id !== id));
  };

  // Save recipe to cookbook
  const saveRecipe = async (recipe: any) => { // Using any for now since we have type mismatch
    if (!user?.id) {
      toast.error('Please log in to save recipes');
      return;
    }

    try {
      const recipeData = {
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: parseInt(recipe.prep_time) || 0,
        cook_time: 0, // Default value
        servings: recipe.servings || 4,
        calories_per_serving: recipe.calories_per_serving || 200,
        protein_per_serving: recipe.protein_per_serving || 10,
        carbs_per_serving: recipe.carbs_per_serving || 25,
        fats_per_serving: recipe.fats_per_serving || 8,
        carbon_per_serving: recipe.carbon_per_serving || 0.5,
        image_url: recipe.image || '',
        is_ai_generated: true
      };

      const savedRecipe = await addRecipe(recipeData);
      if (savedRecipe) {
        setSavedRecipes(prev => [savedRecipe, ...prev]);
        toast.success('Recipe saved to your cookbook!');
      } else {
        toast.error('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    }
  };

  // Remove saved recipe
  const removeSavedRecipe = async (recipeId: string) => {
    if (!user?.id) {
      toast.error('Please log in to manage recipes');
      return;
    }

    try {
      const success = await deleteRecipe(recipeId);
      if (success) {
        setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        toast.success('Recipe removed from cookbook');
      } else {
        toast.error('Failed to remove recipe');
      }
    } catch (error) {
      console.error('Error removing recipe:', error);
      toast.error('Failed to remove recipe');
    }
  };

  // Trigger camera input with better error handling
  const triggerCameraCapture = async () => {
    try {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (!isSecure) {
        toast.error('Camera access requires HTTPS. Please use HTTPS or localhost for development.');
        console.warn('Camera access blocked: Not on HTTPS or localhost');
        return;
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not supported on this device/browser');
        console.warn('Camera not supported: getUserMedia not available');
        return;
      }

      // Try to trigger the file input with camera capture
      cameraInputRef.current?.click();
      
      // Add a timeout to detect if camera access was denied
      setTimeout(() => {
        if (!cameraInputRef.current?.files?.length) {
          console.log('Camera access might be denied - no files captured');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check browser permissions.');
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Process images for ingredient detection
      await processImagesForIngredients(newImages);
      
      toast.success(`${newImages.length} photo(s) captured successfully!`);
    }
    event.target.value = '';
  };

  // Handle gallery upload
  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Process images for ingredient detection
      await processImagesForIngredients(newImages);
      
      toast.success(`${newImages.length} image(s) uploaded successfully!`);
    }
    event.target.value = '';
  };

  // Process images for ingredient detection
  const processImagesForIngredients = async (images: File[]) => {
    try {
      setServiceStatus('unknown');
      
      for (const image of images) {
        const ingredients = await geminiApi.detectIngredientsFromImage(image);
        setDetectedIngredients(prev => [...prev, ...ingredients]);
      }
      
      setServiceStatus('online');
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      setServiceStatus('offline');
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          toast.error('Gemini API key not configured. Please check your environment variables.');
        } else if (error.message.includes('temporarily unavailable')) {
          toast.error('Gemini API service is temporarily down. Please try again later.');
        } else if (error.message.includes('access denied')) {
          toast.error('Access denied to Gemini API. Please check your API key permissions.');
        } else if (error.message.includes('server experiencing issues')) {
          toast.error('Gemini API server is experiencing issues. Please try again later.');
        } else if (error.message.includes('Invalid response format')) {
          toast.error('Gemini API returned an invalid response format. The service may be experiencing issues.');
        } else {
          toast.error('Failed to detect ingredients from image. Please try manual entry.');
        }
      } else {
        toast.error('Failed to process image. Please try again.');
      }
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  };

  // Generate recipe using Gemini AI
  const generateRecipe = async () => {
    if (detectedIngredients.length === 0 && !manualIngredients.trim()) {
      toast.error('Please upload images or enter ingredients manually');
      return;
    }

    try {
      setLoading(true);
      
      const allIngredients = [
        ...detectedIngredients.map(ing => `${ing.name} (${ing.quantity})`),
        ...manualIngredients.split(',').map(ing => ing.trim()).filter(ing => ing)
      ];

      // Create preference context for recipe generation
      const preferenceContext = foodPreferences.length > 0 
        ? `\n\nPlease consider these preferences: ${foodPreferences.map(pref => {
            const option = foodPreferenceOptions.find(opt => opt.id === pref);
            return option ? option.description : pref;
          }).join(', ')}`
        : '';

      console.log('Generating recipe with:', {
        ingredients: allIngredients,
        mode,
        preferences: foodPreferences,
        preferenceContext
      });

      const recipe = await geminiApi.generateRecipe(allIngredients, mode, preferenceContext);
      console.log('Generated recipe:', recipe);
      
      setGeneratedRecipes(prev => [recipe, ...prev]);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      console.error('Error generating recipe:', error);
      
      // Show specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          toast.error('Gemini API key not configured. Please check your environment variables.');
        } else if (error.message.includes('temporarily unavailable')) {
          toast.error('Gemini API service is temporarily down. Please try again later.');
        } else if (error.message.includes('access denied')) {
          toast.error('Access denied to Gemini API. Please check your API key permissions.');
        } else if (error.message.includes('server experiencing issues')) {
          toast.error('Gemini API server is experiencing issues. Please try again later.');
        } else if (error.message.includes('Invalid response format')) {
          toast.error('Gemini API returned an invalid response format. The service may be experiencing issues.');
        } else {
          toast.error(`Failed to generate recipe: ${error.message}`);
        }
      } else {
        toast.error('Failed to generate recipe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Test Gemini API connection
  const testGeminiConnection = async () => {
    try {
      const isConnected = await geminiApi.testConnection();
      if (isConnected) {
        setServiceStatus('online');
        toast.success('Gemini API connection successful!');
      } else {
        setServiceStatus('offline');
        toast.error('Gemini API connection failed. Please check your API key.');
      }
    } catch (error) {
      console.error('Error testing Gemini connection:', error);
      setServiceStatus('offline');
      toast.error('Failed to test Gemini API connection.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-24 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-white">Cookbook</h1>
          {/* Service Status Indicator */}
          <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
            serviceStatus === 'online' ? 'bg-green-500/20 text-green-400' :
            serviceStatus === 'offline' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {serviceStatus === 'online' ? '🟢 AI Online' :
             serviceStatus === 'offline' ? '🔴 AI Offline' :
             '⚪ AI Status Unknown'}
          </div>
        </div>
        <p className="text-white/60">AI-powered recipe generation from ingredients</p>
        {serviceStatus === 'offline' && (
          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              ⚠️ AI service is currently experiencing issues. Manual ingredient entry is still available.
            </p>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Food Preferences */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">🎯 Food Preferences</h2>
            <div className="space-y-3">
              {foodPreferenceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleFoodPreference(option.id)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    foodPreferences.includes(option.id)
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{option.label}</div>
                  <div className="text-xs opacity-80">{option.description}</div>
                </button>
              ))}
            </div>
            {foodPreferences.length > 0 && (
              <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <p className="text-primary-400 text-sm">
                  <span className="font-medium">Selected:</span> {foodPreferences.map(pref => {
                    const option = foodPreferenceOptions.find(opt => opt.id === pref);
                    return option ? option.label : pref;
                  }).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Nutritional Filters */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">📊 Nutritional Boundaries</h2>
            <div className="space-y-4">
              {nutritionalFilters.map((filter) => {
                const nutrientInfo = getAvailableNutrientTypes().find(t => t.value === filter.type) || 
                  { value: filter.type, label: `🔥 ${filter.type}`, unit: 'units', defaultMax: 100 };
                
                return (
                  <div key={filter.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={filter.type}
                          onChange={(e) => updateNutritionalFilter(filter.id, 'type', e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                        >
                          {getAvailableNutrientTypes().map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                          {/* Always show current selection */}
                          <option value={filter.type}>
                            {filter.type === 'calories' ? '🔥 Calories' :
                             filter.type === 'protein' ? '🥩 Protein' :
                             filter.type === 'carbs' ? '🍞 Carbs' :
                             filter.type === 'fats' ? '🧈 Fats' : filter.type}
                          </option>
                        </select>
                      </div>
                      {nutritionalFilters.length > 1 && (
                        <button
                          onClick={() => removeNutritionalFilter(filter.id)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          value={filter.min}
                          onChange={(e) => updateNutritionalFilter(filter.id, 'min', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                          placeholder="Min"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={filter.max}
                          onChange={(e) => updateNutritionalFilter(filter.id, 'max', parseInt(e.target.value) || nutrientInfo.defaultMax)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Add Filter Button */}
              {getAvailableNutrientTypes().length > 0 && (
                <button
                  onClick={() => {
                    const availableTypes = getAvailableNutrientTypes();
                    if (availableTypes.length > 0) {
                      addNutritionalFilter(availableTypes[0].value as any);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <span className="text-lg">+</span>
                  Add Filter
                </button>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                <span className="font-medium">Filtering:</span> {filteredSavedRecipes.length} of {savedRecipes.length} recipes match your criteria
              </p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">🍳 Cooking Mode</h2>
            <div className="space-y-3">
              <button
                onClick={() => setMode('assemble')}
                className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                  mode === 'assemble'
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">🥗 Assemble</div>
                  <div className="text-sm opacity-80">Fresh ingredients, no cooking</div>
                </div>
              </button>
              <button
                onClick={() => setMode('cook')}
                className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                  mode === 'cook'
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">🍳 Cook</div>
                  <div className="text-sm opacity-80">Heat and prepare ingredients</div>
                </div>
              </button>
            </div>
          </div>

          {/* Test API Connection */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">🔧 API Status</h2>
            <button
              onClick={testGeminiConnection}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Test Gemini API Connection
            </button>
          </div>
        </div>

        {/* Right Column - Input & Results */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Image Upload Section */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">📸 Upload Images</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={triggerCameraCapture}
                className="flex items-center justify-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors"
              >
                <Camera size={24} />
                <span className="font-medium">Take Photo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors"
              >
                <Upload size={24} />
                <span className="font-medium">Upload from Gallery</span>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleCameraCapture}
              className="hidden"
            />

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Uploaded Images:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onLoad={() => {
                          // Clean up the blob URL after image loads
                          setTimeout(() => {
                            URL.revokeObjectURL(URL.createObjectURL(image));
                          }, 1000);
                        }}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Ingredients */}
            {detectedIngredients.length > 0 && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="text-sm font-semibold text-green-400 mb-2">Detected Ingredients:</h3>
                <div className="space-y-1">
                  {detectedIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-green-300">{ingredient.name}</span>
                      <span className="text-green-400">({ingredient.quantity})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Manual Ingredient Entry */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">✏️ Manual Ingredient Entry</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter ingredients (comma-separated)
              </label>
              <textarea
                value={manualIngredients}
                onChange={(e) => setManualIngredients(e.target.value)}
                placeholder="e.g., tomatoes, onions, garlic, olive oil"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          {/* Generate Recipe Button */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
            <button
              onClick={generateRecipe}
              disabled={loading || (detectedIngredients.length === 0 && !manualIngredients.trim())}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <ChefHat size={24} />
                  Generate Recipe
                </>
              )}
            </button>
          </div>

          {/* Generated Recipes */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🍽️ Generated Recipes</h2>
            {generatedRecipes.length === 0 ? (
              <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center">
                <ChefHat className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-white/60 mb-2 font-medium">No recipes generated yet</p>
                <p className="text-sm text-gray-500">Upload images or enter ingredients to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{recipe.title || 'Untitled Recipe'}</h3>
                      <p className="text-sm text-gray-400 mb-4">{recipe.description || 'No description available'}</p>
                      
                      {/* Recipe Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-lg font-bold text-white">{recipe.prep_time || '0 minutes'}</div>
                          <div className="text-xs text-gray-400">Prep Time</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="text-lg font-bold text-white">{recipe.servings || 0}</div>
                          <div className="text-xs text-gray-400">Servings</div>
                        </div>
                      </div>

                      {/* Nutritional Information */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-3">Nutritional Information (per serving):</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-400">🔥</span>
                              <span className="text-sm font-semibold text-white">Calories</span>
                            </div>
                            <div className="text-lg font-bold text-white">{recipe.calories_per_serving || 0}</div>
                            <div className="text-xs text-gray-400">kcal</div>
                          </div>
                          
                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-purple-400">🥩</span>
                              <span className="text-sm font-semibold text-white">Protein</span>
                            </div>
                            <div className="text-lg font-bold text-white">{recipe.protein_per_serving || 0}</div>
                            <div className="text-xs text-gray-400">grams</div>
                          </div>
                          
                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-orange-400">🍞</span>
                              <span className="text-sm font-semibold text-white">Carbs</span>
                            </div>
                            <div className="text-lg font-bold text-white">{recipe.carbs_per_serving || 0}</div>
                            <div className="text-xs text-gray-400">grams</div>
                          </div>
                          
                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-red-400">🧈</span>
                              <span className="text-sm font-semibold text-white">Fats</span>
                            </div>
                            <div className="text-lg font-bold text-white">{recipe.fats_per_serving || 0}</div>
                            <div className="text-xs text-gray-400">grams</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-400">🌱</span>
                            <span className="text-sm font-semibold text-white">Carbon Footprint</span>
                          </div>
                          <div className="text-lg font-bold text-white">{(recipe.carbon_per_serving || 0).toFixed(2)}kg</div>
                          <div className="text-xs text-gray-400">CO₂ per serving</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Ingredients:</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {(recipe.ingredients || []).map((ingredient: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-primary-400">•</span>
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Instructions:</h4>
                        <ol className="text-sm text-gray-300 space-y-2">
                          {(recipe.instructions || []).map((instruction: string, index: number) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-primary-400 font-bold">{index + 1}.</span>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <button
                          onClick={() => saveRecipe(recipe)}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Search size={16} />
                          Save to Cookbook
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Recipes Section */}
          {savedRecipes.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">📚 Your Saved Recipes</h2>
              <div className="space-y-3">
                {filteredSavedRecipes.map((recipe) => (
                  <SavedRecipeCard key={recipe.id} recipe={recipe} onRemove={removeSavedRecipe} />
                ))}
              </div>
              {filteredSavedRecipes.length === 0 && savedRecipes.length > 0 && (
                <div className="bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
                  <p className="text-white/60 mb-2 font-medium">No recipes match your nutritional filters</p>
                  <p className="text-sm text-gray-500">Try adjusting your nutritional boundaries above</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Saved Recipe Card Component
const SavedRecipeCard: React.FC<{
  recipe: Recipe;
  onRemove: (recipeId: string) => void;
}> = ({ recipe, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCalories = (recipe.calories_per_serving || 0) * (recipe.servings || 1);

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-primary-500/20">
      {/* Condensed View */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              {recipe.title || 'Untitled Recipe'}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">🔥</span>
                {totalCalories.toFixed(0)} cal
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-400">👥</span>
                {recipe.servings || 0} servings
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-400">⏱️</span>
                {recipe.prep_time || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-purple-400">🥩</span>
                {recipe.protein_per_serving || 0}g protein
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={isExpanded ? 'Show less' : 'Show more'}
            >
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          <div className="pt-4">
            <p className="text-sm text-gray-400 mb-4">
              {recipe.description || 'No description available'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-bold text-white">{recipe.prep_time || '0 minutes'}</div>
                <div className="text-xs text-gray-400">Prep Time</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-bold text-white">{(recipe.carbon_per_serving || 0).toFixed(1)}kg</div>
                <div className="text-xs text-gray-400">CO₂ per serving</div>
              </div>
            </div>

            {/* Nutritional Summary */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-3">Nutritional Information (per serving):</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400">🔥</span>
                    <span className="text-sm font-semibold text-white">Calories</span>
                  </div>
                  <div className="text-lg font-bold text-white">{recipe.calories_per_serving || 0}</div>
                  <div className="text-xs text-gray-400">kcal</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-400">🥩</span>
                    <span className="text-sm font-semibold text-white">Protein</span>
                  </div>
                  <div className="text-lg font-bold text-white">{recipe.protein_per_serving || 0}</div>
                  <div className="text-xs text-gray-400">grams</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-400">🍞</span>
                    <span className="text-sm font-semibold text-white">Carbs</span>
                  </div>
                  <div className="text-lg font-bold text-white">{recipe.carbs_per_serving || 0}</div>
                  <div className="text-xs text-gray-400">grams</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-400">🧈</span>
                    <span className="text-sm font-semibold text-white">Fats</span>
                  </div>
                  <div className="text-lg font-bold text-white">{recipe.fats_per_serving || 0}</div>
                  <div className="text-xs text-gray-400">grams</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">Ingredients:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {(recipe.ingredients || []).map((ingredient: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-primary-400">•</span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Instructions:</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                {(recipe.instructions || []).map((instruction: string, index: number) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary-400 font-bold">{index + 1}.</span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            {/* Remove Recipe Button */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => onRemove(recipe.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X size={16} />
                Remove Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};