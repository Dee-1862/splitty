# USDA API Setup Guide

## Getting Your API Key

1. Go to https://fdc.nal.usda.gov/api-key-signup.html
2. Fill out the form to get a free API key
3. You'll receive an email with your API key

## Setting Up the Environment Variable

1. Create a file called `.env.local` in the `frontend` directory
2. Add your API key to the file:

```
VITE_USDA_API_KEY=your-actual-api-key-here
```

3. Restart your development server (`npm run dev`)

## Testing the API

1. Open the browser console
2. Look for "USDA API Key Status" log message
3. If you see `hasKey: true`, the API key is loaded correctly
4. If you see `hasKey: false`, check your `.env.local` file

## Troubleshooting

- Make sure the file is named `.env.local` (not `.env`)
- Make sure it's in the `frontend` directory
- Restart the dev server after adding the API key
- Check the console for any error messages

## Example .env.local file:

```
VITE_USDA_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```
