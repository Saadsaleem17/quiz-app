// Backend server for Quiz App with MongoDB
// This file should be run as a separate Node.js server
// To use: 1. Create a new folder for backend
//         2. Copy this file to server.js
//         3. Run: npm init -y && npm install express mongoose cors dotenv
//         4. Create .env file with MONGODB_URI
//         5. Run: node server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saadsaleem17oct:mmsMijMD1g9r1uyM@cluster0.xwdy0te.mongodb.net/quiz-app';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Quiz Schema
const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true }
});

const QuizSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    userId: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
    players: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    savedAt: { type: Date, default: Date.now },
    lastUsed: { type: Date, default: Date.now },
    timesUsed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const QuizResultSchema = new mongoose.Schema({
    quizId: { type: String, required: true },
    userId: { type: String, required: true },
    playerName: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: { type: Map, of: Number },
    completedAt: { type: Date, default: Date.now },
    timeTaken: { type: Number, default: 0 }
});

const Quiz = mongoose.model('Quiz', QuizSchema);
const QuizResult = mongoose.model('QuizResult', QuizResultSchema);

// Routes

// Get all quizzes for a user
app.get('/api/quizzes/user/:userId', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new quiz
app.post('/api/quizzes', async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update quiz usage
app.patch('/api/quizzes/:quizId/usage', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ id: req.params.quizId, userId: req.body.userId });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        quiz.lastUsed = new Date();
        quiz.timesUsed = (quiz.timesUsed || 0) + 1;
        quiz.updatedAt = new Date();
        
        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a quiz
app.delete('/api/quizzes/:quizId', async (req, res) => {
    try {
        const result = await Quiz.deleteOne({ id: req.params.quizId, userId: req.body.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Save quiz result
app.post('/api/quiz-results', async (req, res) => {
    try {
        const result = new QuizResult(req.body);
        await result.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get quiz results for a user
app.get('/api/quiz-results/user/:userId', async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.params.userId }).sort({ completedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get leaderboard for a quiz
app.get('/api/quiz-results/quiz/:quizId/leaderboard', async (req, res) => {
    try {
        const results = await QuizResult.find({ quizId: req.params.quizId })
            .sort({ score: -1, completedAt: 1 })
            .limit(10);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import user data
app.post('/api/users/:userId/import', async (req, res) => {
    try {
        const { quizzes } = req.body;
        
        // Delete existing quizzes for this user
        await Quiz.deleteMany({ userId: req.params.userId });
        
        // Insert new quizzes
        const quizArray = Object.values(quizzes);
        if (quizArray.length > 0) {
            await Quiz.insertMany(quizArray);
        }
        
        res.json({ message: 'User data imported successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
