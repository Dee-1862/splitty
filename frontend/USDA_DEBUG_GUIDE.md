# USDA API Debugging Guide

## Quick Debug Steps

### 1. Check API Key Status
Open browser console and look for:
- "USDA API Key Status" log message
- "VITE_USDA_API_KEY from env:" log message

### 2. Test API Connection
1. Go to `/usda-test` route in your app
2. Try searching for "apple" with amount 100g
3. Check console logs for detailed information

### 3. Check Environment File
Make sure you have a `.env.local` file in the `frontend` directory with:
```
VITE_USDA_API_KEY=your-actual-api-key-here
```

### 4. Restart Development Server
After adding the API key, restart your dev server:
```bash
npm run dev
```

## Common Issues & Solutions

### Issue: "API key not found" but you have one
**Solution**: 
- Check file name is exactly `.env.local` (not `.env`)
- Check file is in `frontend` directory (not root)
- Restart dev server after adding key

### Issue: Food items found but no nutrition values
**Solution**:
- Check console for "Failed to get nutrition" errors
- Some foods in USDA database have incomplete nutrition data
- Try different food items (apple, chicken, rice work well)

### Issue: All values showing as 0
**Solution**:
- Check console logs for nutrient extraction details
- Some foods use different nutrient IDs
- The API might be returning data in different format

## Testing Commands

### Test API Key Loading
```javascript
// In browser console:
console.log('API Key:', import.meta.env.VITE_USDA_API_KEY);
```

### Test Direct API Call
```javascript
// In browser console:
fetch('https://api.nal.usda.gov/fdc/v1/foods/search?query=apple&api_key=YOUR_KEY')
  .then(r => r.json())
  .then(console.log);
```

## Expected Console Output

When working correctly, you should see:
```
USDA API Key Status: { hasKey: true, keyLength: 32, keyPreview: "abc12345..." }
searchAndGetNutrition called with: { query: "apple", amount: 100, unit: "g", hasApiKey: true }
Searching for foods with query: apple
Search results: [{ fdcId: 171688, description: "Apples, raw, with skin", ... }]
Getting nutrition for Apples, raw, with skin (ID: 171688)
Food details retrieved: { fdcId: 171688, description: "Apples, raw, with skin", nutrientsCount: 45 }
Extracted nutrition: { calories: 52, protein: 0.26, carbs: 13.81, fats: 0.17 }
```
