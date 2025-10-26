// Gemini AI API integration for recipe generation and ingredient detection

export interface DetectedIngredient {
  name: string;
  quantity: string;
  confidence: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fats_per_serving: number;
  carbon_per_serving: number;
  image?: string;
}

class GeminiApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    if (!this.apiKey) {
      console.warn('VITE_GEMINI_API_KEY not found in environment variables');
    } else {
      console.log('✅ Gemini API key loaded successfully');
    }
  }

  /**
   * Detect ingredients from an image using Gemini Vision
   */
  async detectIngredientsFromImage(imageFile: File): Promise<DetectedIngredient[]> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      // Convert image to base64
      const base64 = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this image and identify all food ingredients visible. For each ingredient, provide:
                1. The name of the ingredient
                2. An estimated quantity (e.g., "200g", "1 cup", "2 pieces")
                3. Your confidence level (0-1)
                
                Return the response as a JSON array with this structure:
                [{"name": "ingredient name", "quantity": "estimated amount", "confidence": 0.95}]`
              },
              {
                inline_data: {
                  mime_type: imageFile.type,
                  data: base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        console.error('Gemini API error details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        if (response.status === 404) {
          throw new Error('Gemini API service is temporarily unavailable. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('Gemini API access denied. Please check your API key.');
        } else if (response.status >= 500) {
          throw new Error('Gemini API server is experiencing issues. Please try again in a few minutes.');
        } else {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content received from Gemini API. The service may be experiencing issues.');
      }

      // Parse the JSON response - handle markdown code blocks
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to parse the JSON
      let ingredients;
      try {
        ingredients = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', jsonContent);
        throw new Error('Invalid response format from Gemini API. The service may be experiencing issues.');
      }
      
      // Validate the response structure
      if (!Array.isArray(ingredients)) {
        throw new Error('Invalid response format from Gemini API. Expected an array of ingredients.');
      }
      
      return ingredients.map((ing: any) => ({
        name: ing.name || 'Unknown ingredient',
        quantity: ing.quantity || 'Unknown amount',
        confidence: ing.confidence || 0.5
      }));

    } catch (error) {
      console.error('Error detecting ingredients:', error);
      
      if (error instanceof Error) {
        throw error; // Re-throw our custom errors
      } else {
        throw new Error('Failed to connect to Gemini API. The service may be temporarily unavailable.');
      }
    }
  }

  /**
   * Generate a recipe using Gemini AI
   */
  async generateRecipe(ingredients: string[], mode: 'assemble' | 'cook', preferenceContext: string = ''): Promise<Recipe> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      const prompt = `Create a ${mode === 'cook' ? 'cooked' : 'fresh/assembled'} recipe using these ingredients: ${ingredients.join(', ')}.${preferenceContext}

      Please provide a detailed recipe in JSON format with this structure:
      {
        "title": "Recipe Name",
        "description": "Brief description of the dish",
        "ingredients": ["ingredient 1", "ingredient 2", ...],
        "instructions": ["step 1", "step 2", ...],
        "prep_time": "X minutes",
        "servings": X,
        "calories_per_serving": XXX,
        "protein_per_serving": XX.X,
        "carbs_per_serving": XX.X,
        "fats_per_serving": XX.X,
        "carbon_per_serving": X.XX
      }

      IMPORTANT: Calculate accurate nutritional values based on the actual ingredients:
      - Estimate realistic servings based on ingredient quantities
      - Calculate calories_per_serving: Total calories divided by servings
      - Calculate protein_per_serving: Total protein in grams divided by servings  
      - Calculate carbs_per_serving: Total carbohydrates in grams divided by servings
      - Calculate fats_per_serving: Total fats in grams divided by servings
      - Calculate carbon_per_serving: Carbon footprint per serving based on ingredients and cooking method
      
      Use realistic nutritional values based on the actual ingredients provided.`;

      console.log('Gemini API - Recipe generation request:', {
        prompt: prompt.substring(0, 200) + '...',
        ingredients,
        mode,
        preferenceContext,
        apiKey: this.apiKey ? 'Present' : 'Missing'
      });

      const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        console.error('Gemini API error details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        if (response.status === 404) {
          throw new Error('Gemini API service is temporarily unavailable. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('Gemini API access denied. Please check your API key.');
        } else if (response.status >= 500) {
          throw new Error('Gemini API server is experiencing issues. Please try again in a few minutes.');
        } else {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Gemini API - Raw response:', data);
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Gemini API - Extracted content:', content);
      
      if (!content) {
        throw new Error('No content received from Gemini API. The service may be experiencing issues.');
      }

      // Parse the JSON response - handle markdown code blocks
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Gemini API - Cleaned JSON content:', jsonContent);
      
      // Try to extract JSON object from the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response:', jsonContent);
        throw new Error('Invalid response format from Gemini API. The service may be experiencing issues.');
      }

      // Try to parse the JSON
      let recipeData;
      try {
        recipeData = JSON.parse(jsonMatch[0]);
        console.log('Gemini API - Parsed recipe data:', recipeData);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', jsonMatch[0]);
        throw new Error('Invalid response format from Gemini API. The service may be experiencing issues.');
      }
      
      return {
        id: Date.now().toString(),
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time: recipeData.prep_time,
        servings: recipeData.servings || 4,
        calories_per_serving: recipeData.calories_per_serving || 200,
        protein_per_serving: recipeData.protein_per_serving || 10,
        carbs_per_serving: recipeData.carbs_per_serving || 25,
        fats_per_serving: recipeData.fats_per_serving || 8,
        carbon_per_serving: recipeData.carbon_per_serving || 0.5,
      };

    } catch (error) {
      console.error('Error generating recipe:', error);
      
      if (error instanceof Error) {
        throw error; // Re-throw our custom errors
      } else {
        throw new Error('Failed to connect to Gemini API. The service may be temporarily unavailable.');
      }
    }
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Test Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      console.log('❌ Gemini API key not found');
      return false;
    }

    console.log('🔍 Testing Gemini API connection...');
    console.log('API Key preview:', this.apiKey.substring(0, 10) + '...');
    console.log('Base URL:', this.baseUrl);

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Hello, are you working?' }]
          }],
          generationConfig: {
            temperature: 0,
            topK: 1,
            topP: 1,
            maxOutputTokens: 10,
          }
        })
      });

      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Gemini API connection successful!', data);
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ Gemini API connection failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.log('❌ Gemini API connection error:', error);
      return false;
    }
  }
}

export const geminiApi = new GeminiApiService();
