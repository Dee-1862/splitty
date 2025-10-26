# Mealy 🍽️

A comprehensive nutrition tracking platform built for students to track meals, reduce carbon footprint, and discover healthy AI-powered recipes.

## About

### The Inspiration

When we entered our freshman year, we noticed something concerning among our friends and classmates. Many of them were struggling with significant weight changes—either gaining or losing weight in unhealthy ways—simply because they couldn't properly manage their nutrition. Between adjusting to college life, managing coursework, and maintaining a social life, eating well seemed almost impossible.

This observation hit close to home. We realized that while nutrition tracking apps existed, they were often either too complex, too expensive, or simply not designed with students in mind. We saw an opportunity to create something that could truly help people make better food choices—something that was accessible, intuitive, and built for the reality of student life.

### Our Philosophy: "Make it exist, then make it perfect"

One of the core principles that drove our development was the idea of "make it exist, then make it perfect." We started with a vision: create a tool that could help students track their nutrition, understand their carbon footprint, and discover new recipes. We built the core functionality first, knowing we could refine and improve it over time.

This approach meant we prioritized getting a working product in users' hands over having every feature perfectly polished. It was about progress over perfection—starting with something functional and iterating based on real feedback.

### What We Built

Mealy isn't just a nutrition tracker—it's a complete food ecosystem for students. You can:

- **Track what you eat**: Log meals with photos and get instant nutritional breakdowns
- **Create recipes**: Use our AI-powered cookbook to generate recipes from whatever ingredients you have. Choose "Assemble" mode for no-cook meals (perfect for dorms!) or "Cook" mode for full recipes
- **Track your impact**: Monitor your carbon footprint alongside your nutrition
- **Achieve goals**: Set personalized nutrition goals based on your body type and activity level

### How We Built It

MindMeal is a comprehensive platform that combines:

- **React + TypeScript**: For a robust, type-safe frontend experience
- **TailwindCSS**: For beautiful, responsive design
- **Supabase**: For authentication and PostgreSQL database
- **Google Cloud Vision API**: For ingredient detection from food photos
- **Gemini AI**: For intelligent recipe generation based on available ingredients
- **USDA API**: For comprehensive nutritional data
- **Carbon Footprint Calculations**: Our own calculations based on food types and sourcing

One of the biggest learning experiences was making Gemini AI talk to other APIs—understanding how to structure prompts, handle API responses, and chain different services together to create a seamless user experience.

Try it out - https://splitty-3sm2.vercel.app/

### Innovation: Token Cost Optimization

One of the most innovative things we did was optimize our Gemini API costs by using Chinese in our prompts. By strategically incorporating Chinese characters into prompts to Gemini, we were able to cut our token costs by approximately 40-50% without any loss in output quality. This approach significantly reduced our API expenses while maintaining the same level of AI-generated recipe quality and suggestions.

This optimization required careful prompt engineering to ensure that:
- The Chinese text conveyed the same semantic meaning
- The model understood all the context and requirements
- Output quality remained consistent
- Token reduction was actually achieved

### Challenges We Faced

Building Mealy came with its fair share of challenges:

1. **API Orchestration**: Getting multiple APIs (Google Cloud Vision, Gemini, USDA) to work together seamlessly required careful error handling and response processing
2. **Database Design**: Structuring data for users, meals, goals, and recipes while maintaining relationships and query efficiency
3. **UI/UX**: Creating an intuitive interface that made nutrition tracking feel effortless, not like a chore
4. **State Management**: Managing complex state across authentication, meal tracking, and profile data
5. **Prompt Engineering**: Making Gemini generate useful, relevant recipes required extensive iteration on prompt design

### What We Learned

This project taught us so much:

- **API Integration**: How to work with RESTful APIs, handle authentication, parse responses, and chain API calls
- **AI Integration**: Working with large language models (Gemini), prompt engineering, and optimizing API costs
- **Full-Stack Development**: Building complete applications from database to frontend
- **User-Centric Design**: Prioritizing user experience and making complex functionality feel simple
- **Problem Solving**: Approaching challenges systematically, breaking down complex problems into manageable pieces

## Features

- **Smart Meal Tracking**: Log meals with photos and get instant nutritional breakdowns
- **AI-Powered Recipe Generation**: Create recipes from any ingredients you have—with both "Assemble" mode for no-cook meals and "Cook" mode for full recipes
- **Carbon Footprint Tracking**: Track not just your nutrition, but your environmental impact
- **Personalized Goals**: Set and achieve nutrition goals tailored to your body type and lifestyle
- **Beautiful, Modern UI**: A clean, dark-mode interface that makes tracking feel effortless

## Tech Stack

- **Frontend**: 
  - ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white) ![Lucide React](https://img.shields.io/badge/Lucide-React-45B8D8?logo=react&logoColor=white)
- **Backend**: 
  - ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) (Authentication, PostgreSQL, Storage)
- **APIs**:
  - ![Google Cloud](https://img.shields.io/badge/Google_Cloud_Vision-4285F4?logo=google-cloud&logoColor=white) (image recognition)
  - ![Gemini](https://img.shields.io/badge/Gemini_AI-F4B400?logo=google&logoColor=white) (recipe generation)
  - ![USDA API](https://img.shields.io/badge/USDA_API-00A86B?logo=government&logoColor=white) (nutritional data)
- **Charts**: 
  - ![Recharts](https://img.shields.io/badge/Recharts-FF6384?logo=chartjs&logoColor=white)
- **Forms**: 
  - ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?logo=react-hook-form&logoColor=white)
- **Notifications**: 
  - ![React Toastify](https://img.shields.io/badge/React_Toastify-1697F6?logo=react&logoColor=white)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- Google Cloud API credentials (for Vision and Gemini)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mealy.git
cd mealy
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables in `frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
mealy/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # Login, Register, Onboarding
│   │   │   ├── views/       # Dashboard, Cookbook, Profile
│   │   │   └── layout/      # Navigation, Layouts
│   │   ├── utils/           # Database helpers, utilities
│   │   └── routes.ts        # Application routing
│   └── package.json
└── README.md
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with love for college students everywhere
- Inspired by the desire to make healthy eating accessible and sustainable
