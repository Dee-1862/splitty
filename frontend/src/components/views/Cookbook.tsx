import React, { useState, useRef, useEffect } from 'react';
// 1. Added Trash2 to the import
import { Camera, Upload, ChefHat, X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { geminiApi } from '../../utils/geminiApi';
import type { DetectedIngredient } from '../../utils/geminiApi';
import type { Recipe } from '../../utils/database';
import { useAuth } from '../../AuthContext';
import { getRecipes, addRecipe, deleteRecipe, getProfile, type Profile } from '../../utils/database';

export const Cookbook: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'assemble' | 'cook'>('assemble');
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]); // Gemini API recipes
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [manualIngredients, setManualIngredients] = useState('');
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [nutritionalFilters, setNutritionalFilters] = useState<Array<{
    id: string;
    type: 'calories' | 'protein' | 'carbs' | 'fats' | 'carbon';
    min: number;
    max: number;
  }>>([
    { id: '1', type: 'calories', min: 0, max: 1000 }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load saved recipes and user profile from Supabase when component mounts
  useEffect(() => {
    if (user?.id) {
      loadSavedRecipes();
      loadUserProfile();
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

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await getProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't show error toast for profile loading as it's not critical for cookbook functionality
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
      { value: 'calories', label: '🔥 Calories', unit: 'cal', defaultMax: 1000 },
      { value: 'protein', label: '🥩 Protein', unit: 'grams', defaultMax: 50 },
      { value: 'carbs', label: '🍞 Carbs', unit: 'grams', defaultMax: 100 },
      { value: 'fats', label: '🧈 Fats', unit: 'grams', defaultMax: 30 },
      { value: 'carbon', label: '🌱 Carbon Footprint', unit: 'kg', defaultMax: 2 }
    ];
    return allTypes.filter(type => !selectedTypes.includes(type.value as any));
  };

  // Add new nutritional filter
  const addNutritionalFilter = (type: 'calories' | 'protein' | 'carbs' | 'fats' | 'carbon') => {
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
      const newType = value as 'calories' | 'protein' | 'carbs' | 'fats' | 'carbon';
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

  // Save generated recipe to cookbook
  const saveRecipe = async (recipe: any) => {
    if (!user?.id) {
      toast.error('Please log in to save recipes');
      return;
    }

    try {
      // Convert Gemini recipe format to database format with proper data types
      const recipeData = {
        user_id: user.id,
        title: recipe.title || 'Generated Recipe',
        description: recipe.description || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        prep_time: parseInt(recipe.prep_time) || 0,
        cook_time: parseInt(recipe.cook_time) || 0,
        servings: parseInt(recipe.servings) || 1,
        calories_per_serving: parseInt(recipe.calories_per_serving) || 0,
        protein_per_serving: parseFloat(recipe.protein_per_serving) || 0,
        carbs_per_serving: parseFloat(recipe.carbs_per_serving) || 0,
        fats_per_serving: parseFloat(recipe.fats_per_serving) || 0,
        carbon_per_serving: parseFloat(recipe.carbon_per_serving) || 0,
        image_url: recipe.image_url || null,
        is_ai_generated: true
      };

      console.log('Saving recipe data:', recipeData); // Debug log
      const savedRecipe = await addRecipe(recipeData);
      if (savedRecipe) {
        setSavedRecipes(prev => [savedRecipe, ...prev]);
        toast.success('Recipe saved to cookbook!');
      } else {
        toast.error('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
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
      for (const image of images) {
        const ingredients = await geminiApi.detectIngredientsFromImage(image);
        setDetectedIngredients(prev => [...prev, ...ingredients]);
      }
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      
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

      // Create preference context for recipe generation (using Chinese to save tokens)
      const preferenceContext = foodPreferences.length > 0 
      // ? `\n\nPlease consider these preferences: ${foodPreferences.map(pref => {
        ? `\n考虑偏好：${foodPreferences.map(pref => {
            const option = foodPreferenceOptions.find(opt => opt.id === pref);
            return option ? option.description : pref;
          //}).join(', ')}`
          }).join('、')}`
        : '';

      // Add allergy restrictions to the context (using Chinese to save tokens)
      const allergyContext = userProfile?.allergies && userProfile.allergies.trim()
      //? `\n\nIMPORTANT: The user has the following allergies and dietary restrictions that MUST be avoided: ${userProfile.allergies}. Do not include these ingredients in your recipes.
        ? `\n\n重要：用户对以下过敏原过敏，必须避免：${userProfile.allergies}。不要在食谱中包含这些成分。`
        : '';

      const fullContext = preferenceContext + allergyContext;

      console.log('Generating recipe with:', {
        ingredients: allIngredients,
        mode,
        preferences: foodPreferences,
        allergies: userProfile?.allergies,
        preferenceContext: fullContext
      });

      const recipe = await geminiApi.generateRecipe(allIngredients, mode, fullContext);
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

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
                {/* Minimal Header */}
        <div className="mb-12 sm:mb-16 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-2">
            Cookbook
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            AI-powered recipe generation from ingredients
          </p>
      </div>

        {/* Mode Selection Tabs */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setMode('assemble')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              mode === 'assemble'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-slate-900/30 text-slate-400 border border-slate-800/50 hover:bg-slate-900/50'
            }`}
          >
            🥗 Assemble
          </button>
          <button
            onClick={() => setMode('cook')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              mode === 'cook'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-slate-900/30 text-slate-400 border border-slate-800/50 hover:bg-slate-900/50'
            }`}
          >
            🍳 Cook
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Preferences & Filters (Narrower) */}
          <div className="lg:col-span-3">
          
            <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-6 overflow-hidden sticky top-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <ChefHat size={20} className="text-blue-400" />
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Filters
                  </h2>
      </div>

                {/* Food Preferences */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">Diet Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {foodPreferenceOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleFoodPreference(option.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 backdrop-blur-sm ${
                          foodPreferences.includes(option.id)
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-800/30 text-slate-400 border border-slate-700/30 hover:bg-slate-700/40 hover:text-slate-300 hover:border-slate-600/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergy Information */}
                {userProfile?.allergies && userProfile.allergies.trim() && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">Allergy Restrictions</h3>
                    <div className="relative bg-amber-500/10 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
                            Active Restrictions
                          </p>
                          <p className="text-sm text-amber-300">
                            {userProfile.allergies}
                          </p>
                          <p className="text-xs text-amber-400/80 mt-2">
                            These allergens will be avoided in all generated recipes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
         
                {/* Nutritional Filters */}
                <div>
                  <h3 className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">Nutrition</h3>
                  <div className="space-y-3">
                    {nutritionalFilters.map((filter) => (
                      <div key={filter.id} className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <select
                              value={filter.type}
                              onChange={(e) => updateNutritionalFilter(filter.id, 'type', e.target.value)}
                              className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                            >
                              <option value="calories">🔥 Calories</option>
                              <option value="protein">🥩 Protein</option>
                              <option value="carbs">🍞 Carbs</option>
                              <option value="fats">🧈 Fats</option>
                              <option value="carbon">🌱 Carbon Footprint</option>
                            </select>
                          </div>
                          {nutritionalFilters.length > 1 && (
                            <button
                              onClick={() => removeNutritionalFilter(filter.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
                            >
                              <X size={16} />
        </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">Min</label>
                            <input
                              type="number"
                              value={filter.min}
                              onChange={(e) => updateNutritionalFilter(filter.id, 'min', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-slate-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">Max</label>
                            <input
                              type="number"
                              value={filter.max}
                              onChange={(e) => updateNutritionalFilter(filter.id, 'max', parseInt(e.target.value) || 1000)}
                              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-slate-500"
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        const availableTypes: ('calories' | 'protein' | 'carbs' | 'fats' | 'carbon')[] = ['calories', 'protein', 'carbs', 'fats', 'carbon'];
                        const usedTypes = nutritionalFilters.map(f => f.type);
                        const nextType = availableTypes.find(type => !usedTypes.includes(type));
                        if (nextType) {
                          addNutritionalFilter(nextType);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl text-slate-400 hover:bg-slate-700/40 hover:text-white hover:border-slate-600/50 transition-all duration-200 text-sm font-medium"
                    >
                      <span className="text-lg">+</span>
                      Add Filter
        </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Input & Results (Wider) */}
          <div className="lg:col-span-9 space-y-6">

            {/* Two Column Layout for Image Upload and Manual Entry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
              {/* Image Upload Section */}
              <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="text-amber-400" size={20} />
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                      Upload Ingredients
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
                    >
                      <Camera size={24} className="text-amber-400" />
                      <span className="text-sm font-medium text-white">Camera</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
                    >
                      <Upload size={24} className="text-rose-400" />
                      <span className="text-sm font-medium text-white">Gallery</span>
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
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Images</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-slate-700/50"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <h3 className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">Detected</h3>
                      <div className="space-y-1">
                        {detectedIngredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-emerald-300">{ingredient.name}</span>
                            <span className="text-emerald-400/70">{ingredient.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
        </div>
      </div>

              {/* Manual Entry Section */}
              <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide block">
                      Manual Entry
                    </label>
                    <textarea
                      value={manualIngredients}
                      onChange={(e) => setManualIngredients(e.target.value)}
                      placeholder="e.g., tomatoes, onions, garlic, olive oil"
                       className="w-full h-32 p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
      <button 
                    onClick={generateRecipe}
                    disabled={loading || (detectedIngredients.length === 0 && !manualIngredients.trim())}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Generating...</span>
                      </>
                    ) : (
                     <>
                        <ChefHat size={20} />
                        <span>Generate Recipe</span>
                      </>
                    )}
      </button>
                </div>
              </div>
            </div>

            {/* Generated Recipes */}
            {generatedRecipes.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4 tracking-tight">Generated Recipes</h2>
                <div className="space-y-4">
                  {generatedRecipes.map((recipe, index) => ( // Added index for key
                    <RecipeCard key={recipe.id || `gen-${index}`} recipe={recipe} onSave={saveRecipe} /> // Added onSave prop
                  ))}
            </div>
          </div>
          )}

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
                <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 text-center">
                  <p className="text-white/60 mb-2 font-medium">No recipes match your nutritional filters</p>
                s <p className="text-sm text-slate-500">Try adjusting your nutritional boundaries above</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

// Recipe Card Component
const RecipeCard: React.FC<{ recipe: any; onSave: (recipe: any) => void }> = ({ recipe, onSave }) => { // Added onSave prop
  return (
    <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">{recipe.title || 'Generated Recipe'}</h3>
        <p className="text-sm text-slate-400 mb-4">{recipe.description || 'No description provided.'}</p>
        
        {/* Recipe Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-white">{recipe.prep_time || 'N/A'}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Prep Time</div>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-white">{recipe.servings || 'N/A'}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Servings</div>
          </div>
        </div>

        {/* Nutritional Information */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Nutrition (per serving)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NutritionStat icon="🔥" label="Calories" value={recipe.calories_per_serving || 0} unit="cal" color="yellow" />
            <NutritionStat icon="🥩" label="Protein" value={recipe.protein_per_serving || 0} unit="g" color="purple" />
            <NutritionStat icon="🍞" label="Carbs" value={recipe.carbs_per_serving || 0} unit="g" color="orange" />
            <NutritionStat icon="🧈" label="Fats" value={recipe.fats_per_serving || 0} unit="g" color="red" />
          </div>
          
          <div className="mt-3 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400">🌱</span>
              <span className="text-xs font-semibold text-white uppercase tracking-wide">Carbon Footprint</span>
           </div>
            <div className="text-xl font-bold text-white">{(recipe.carbon_per_serving || 0).toFixed(2)}kg</div>
            <div className="text-xs text-slate-400">CO₂ per serving</div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Ingredients</h4>
          <ul className="text-sm text-gray-300 space-y-1.5">
            {(recipe.ingredients || []).map((ingredient: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Instructions</h4>
          <ol className="text-sm text-gray-300 space-y-2">
            {(recipe.instructions || []).map((instruction: string, index: number) => (
             <li key={index} className="flex gap-3">
                <span className="text-emerald-400 font-bold text-sm">{index + 1}.</span>
                <span>{instruction}</span>
             </li>
            ))}
          </ol>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-800/50">
          <button 
            onClick={() => onSave(recipe)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <ChefHat size={18} />
            Save to Cookbook
          </button>
        </div>
              </div>
            </div>
  );
};

// Nutrition Stat Component
const NutritionStat: React.FC<{
  icon: string;
  label: string;
  value: number;
  unit: string;
  color: string;
}> = ({ icon, label, value, unit, color }) => {
  const colorMap: Record<string, string> = {
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400'
 };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <span className={colorMap[color]}>{icon}</span>
        <span className="text-xs font-semibold text-white">{label}</span>
     </div>
      <div className="text-lg font-bold text-white">{value || 0}</div>
      <div className="text-xs text-slate-400">{unit}</div>
    </div>
  );
};

// Saved Recipe Card Component
const SavedRecipeCard: React.FC<{
  recipe: Recipe;
  onRemove: (recipeId: string) => void;
}> = ({ recipe, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-200 overflow-hidden">
      {/* Condensed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-white mb-1">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              🔥 {(recipe.calories_per_serving || 0) * (recipe.servings || 1)} cal
            </span>
            <span className="flex items-center gap-1">
              👥 {recipe.servings} servings
          </span>
            <span className="flex items-center gap-1">
              ⏱️ {recipe.prep_time}
            </span>
          </div>
        </div>
        
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-800/50">
          <div className="pt-4">
            <p className="text-sm text-slate-400 mb-4">{recipe.description}</p>
           
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <NutritionStat icon="🔥" label="Calories" value={recipe.calories_per_serving} unit="cal" color="yellow" />
              <NutritionStat icon="🥩" label="Protein" value={recipe.protein_per_serving} unit="g" color="purple" />
              <NutritionStat icon="🍞" label="Carbs" value={recipe.carbs_per_serving} unit="g" color="orange" />
           <NutritionStat icon="🧈" label="Fats" value={recipe.fats_per_serving} unit="g" color="red" />
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Ingredients</h4>
           <ul className="text-sm text-gray-300 space-y-1.5">
                {(recipe.ingredients || []).map((ingredient: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                 {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Instructions</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                {(recipe.instructions || []).map((instruction: string, index: number) => (
               <li key={index} className="flex gap-3">
                    <span className="text-emerald-400 font-bold text-sm">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
         </div>

            {/* Remove Recipe Button */}
            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <button
                onClick={() => onRemove(recipe.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl transition-colors border border-red-500/20 hover:border-red-500/30 font-medium text-sm"
              >
                <Trash2 size={16} />
                Remove Recipe
              </button>
         </div>
          </div>
        </div>
      )}
    </div>
  );
};