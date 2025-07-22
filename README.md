# AI Text Analysis API | Node.js + React + OpenAI
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18-blue)
![Express](https://img.shields.io/badge/Express-✓-black)
![SQLite](https://img.shields.io/badge/SQLite-DB-lightblue)
![OpenAI](https://img.shields.io/badge/OpenAI-API-orange)

### Overview
Full-stack challenge integrating AI (OpenAI), Node.js backend, and React frontend with SQLite caching.
The API analyzes text by detecting language, determining sentiment, counting words, identifying stopwords, and listing the top 5 most frequent non-stopwords.

Includes:
- A Node.js + Express backend with SQLite for caching the last analysis.
- A React frontend (bonus) to visualize results easily.
- A Postman collection for testing API endpoints.

## ✅ Features
- POST /analyze-text: Analyze text for language, sentiment, word frequencies, and stopwords.
- GET /search-term: Check if a term exists in the last analyzed text.
- AI-powered sentiment analysis via OpenAI (or compatible API).
- Simple React UI for user-friendly interaction (optional).
- SQLite for storing the last analyzed text.
- Postman collection included for quick testing.

## 🛠 Technologies Used
- Backend: Node.js, Express
- Database: SQLite
- AI Integration: OpenAI API
- Frontend: React (bonus)
- Testing: Postman collection provided

## ⚙ Setup Instructions

### 1. Clone the repository
mkdir ia-text-analysis
cd ia-text-analysis
git clone https://github.com/dalcinbh/fullstack-challenge.git .

### 2. Install backend dependencies
npm install

### 3. Configure environment variables
Create a .env file in the root directory based on .env.example:
PORT=5000
PUBLIC_API_KEY=your_openai_api_key_here

### 4. Run the backend server
# Development mode (recommended)
npm run dev

# Or run without nodemon
npm start

The API will run at:
http://localhost:5000/api

## Optional: Run the React Frontend
Navigate to the simple-frontend folder:
cd simple-frontend
npm install
npm start

The frontend will run at:
http://localhost:3001

## API Endpoints

### POST /api/analyze-text
Request Body:
{
  "text": "I love programming programming with Node.js and building APIs with Express"
}

Response Example:
{
  "idiom": "English",
  "sentiment": "positive",
  "total_words": 12,
  "top_5_words": [
    { "word": "programming", "count": 2, "isStopWord": false },
    { "word": "Node.js", "count": 1, "isStopWord": false }
  ]
}

### GET /api/search-term?term=programming
Response Example:
{
  "term": "programming",
  "found": true
}

## Environment Variables
- PORT: Server port (default: 5000)
- PUBLIC_API_KEY: API key for AI provider (e.g., OpenAI)

See .env.example for reference.

## Testing with Postman
A Postman collection is included in the postman folder:
IA-TEXT-ANALYSIS.postman_collection.json

Steps:
1. Import the file into Postman.
2. Set the variable base_url (default: http://localhost:5000).
3. Test both endpoints.

## Extras
- React Frontend: Simple UI for text input and analysis visualization.
- Postman Collection: For quick API testing.

✅ Challenge by Coodesh
