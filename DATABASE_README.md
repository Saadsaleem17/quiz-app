# Quiz App with MongoDB Integration

This quiz app now supports both local storage (demo mode) and MongoDB cloud database for persistent storage.

## Features

- **Persistent Quiz Storage**: Save quizzes permanently to MongoDB or localStorage
- **Quiz Library**: Browse, search, and manage your saved quizzes
- **Usage Tracking**: Track how many times each quiz has been used
- **Quiz Results**: Store and retrieve quiz completion results
- **Leaderboards**: View top scores for each quiz
- **Import/Export**: Backup and restore your quiz data

## Database Options

### Option 1: Demo Mode (localStorage)
- **Default mode** - No setup required
- Data stored in browser's localStorage
- Perfect for testing and development
- Data persists until browser storage is cleared

### Option 2: MongoDB Production Mode
- Cloud database for permanent storage
- Requires backend server setup
- Data accessible from any device
- Professional-grade persistence

## Running in Demo Mode (Default)

```bash
npm start
```

The app will automatically use localStorage for demo mode.

## Setting up MongoDB Production Mode

### 1. Backend Server Setup

Create a new folder for the backend:
```bash
mkdir quiz-app-backend
cd quiz-app-backend
```

Copy the `backend-server.js` file to this folder as `server.js`.

Install dependencies:
```bash
npm init -y
npm install express mongoose cors dotenv
```

Create a `.env` file in the backend folder:
```
MONGODB_URI=mongodb+srv://saadsaleem17oct:mmsMijMD1g9r1uyM@cluster0.xwdy0te.mongodb.net/quiz-app
PORT=3001
```

Start the backend server:
```bash
node server.js
```

### 2. Frontend Configuration

Update the `.env` file in your React app:
```
REACT_APP_DEMO_MODE=false
REACT_APP_API_URL=http://localhost:3001/api
```

Start the React app:
```bash
npm start
```

## Database Functions

The app includes these database functions:

- `getUserQuizzes(userId)` - Get all quizzes for a user
- `saveQuiz(userId, quizId, quizData)` - Save a new quiz
- `deleteQuiz(userId, quizId)` - Delete a quiz
- `updateQuizUsage(userId, quizId)` - Track quiz usage
- `saveQuizResult(resultData)` - Save quiz completion results
- `getUserQuizResults(userId)` - Get user's quiz history
- `getQuizLeaderboard(quizId)` - Get top scores for a quiz
- `getQuizStats(userId)` - Get user's quiz statistics
- `searchQuizzes(userId, searchTerm)` - Search quizzes by title
- `exportUserData(userId)` - Export user data for backup
- `importUserData(userId, userData)` - Import user data from backup

## Data Structure

### Quiz Object
```javascript
{
  id: "unique-quiz-id",
  title: "Quiz Title",
  userId: "user-id",
  questions: [
    {
      question: "Question text",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: 0
    }
  ],
  players: [],
  savedAt: "2025-01-01T00:00:00.000Z",
  lastUsed: "2025-01-01T00:00:00.000Z",
  timesUsed: 5,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z"
}
```

### Quiz Result Object
```javascript
{
  quizId: "quiz-id",
  userId: "user-id",
  playerName: "Player Name",
  score: 8,
  totalQuestions: 10,
  answers: { "0": 1, "1": 2, "2": 0 },
  completedAt: "2025-01-01T00:00:00.000Z",
  timeTaken: 120
}
```

## MongoDB Collections

The app uses these MongoDB collections:

- `quizzes` - Stores quiz data
- `quizresults` - Stores quiz completion results
- `users` - Stores user preferences and statistics

## API Endpoints (Production Mode)

- `GET /api/quizzes/user/:userId` - Get user's quizzes
- `POST /api/quizzes` - Create a new quiz
- `PATCH /api/quizzes/:quizId/usage` - Update quiz usage
- `DELETE /api/quizzes/:quizId` - Delete a quiz
- `POST /api/quiz-results` - Save quiz result
- `GET /api/quiz-results/user/:userId` - Get user's results
- `GET /api/quiz-results/quiz/:quizId/leaderboard` - Get quiz leaderboard
- `POST /api/users/:userId/import` - Import user data

## Fallback Strategy

The app implements a robust fallback strategy:

1. **Production Mode**: Try MongoDB API first
2. **Fallback**: If API fails, use localStorage
3. **Demo Mode**: Use only localStorage

This ensures the app always works, even if the database is unavailable.

## Development vs Production

- **Development**: Use demo mode with localStorage
- **Production**: Set up backend server with MongoDB
- **Hybrid**: Can switch between modes using environment variables
