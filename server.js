const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saadsaleem17oct:mmsMijMD1g9r1uyM@cluster0.xwdy0te.mongodb.net/quiz-app';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    questions: [{
        text: String,
        options: [String],
        correctAnswer: Number
    }],
    userId: { type: String, required: true },
    createdBy: String,
    status: { type: String, default: 'lobby' },
    players: [{
        id: String,
        name: String
    }],
    currentQuestionIndex: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    savedAt: { type: Date, default: Date.now },
    lastUsed: { type: Date, default: Date.now },
    timesUsed: { type: Number, default: 0 }
});

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    quizId: { type: String, required: true },
    userId: { type: String, required: true },
    playerName: String,
    score: Number,
    totalQuestions: Number,
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean
    }],
    completedAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);

// Routes

// User routes
app.post('/api/users/signup', async (req, res) => {
    try {
        const { username, userId } = req.body;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const user = new User({
            username: username.trim(),
            userId,
            createdAt: new Date(),
            lastLogin: new Date()
        });

        await user.save();
        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username } = req.body;
        
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Quiz routes
app.get('/api/quizzes/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const quizzes = await Quiz.find({ userId }).sort({ lastUsed: -1 });
        
        // Convert to object format expected by frontend
        const quizzesObject = {};
        quizzes.forEach(quiz => {
            quizzesObject[quiz.id] = quiz.toObject();
        });
        
        res.json(quizzesObject);
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

app.post('/api/quizzes', async (req, res) => {
    try {
        const quizData = req.body;
        
        const quiz = new Quiz({
            ...quizData,
            updatedAt: new Date()
        });

        await quiz.save();
        res.status(201).json({ success: true, quiz });
    } catch (error) {
        console.error('Save quiz error:', error);
        res.status(500).json({ error: 'Failed to save quiz' });
    }
});

app.delete('/api/quizzes/:quizId', async (req, res) => {
    try {
        const { quizId } = req.params;
        const { userId } = req.body;
        
        const result = await Quiz.deleteOne({ id: quizId, userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

app.patch('/api/quizzes/:quizId/usage', async (req, res) => {
    try {
        const { quizId } = req.params;
        const { userId } = req.body;
        
        const quiz = await Quiz.findOne({ id: quizId, userId });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        quiz.lastUsed = new Date();
        quiz.timesUsed = (quiz.timesUsed || 0) + 1;
        quiz.updatedAt = new Date();
        
        await quiz.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Update quiz usage error:', error);
        res.status(500).json({ error: 'Failed to update quiz usage' });
    }
});

// Quiz results routes
app.post('/api/quiz-results', async (req, res) => {
    try {
        const resultData = req.body;
        
        const result = new QuizResult({
            ...resultData,
            id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            completedAt: new Date()
        });

        await result.save();
        res.status(201).json({ success: true, result });
    } catch (error) {
        console.error('Save quiz result error:', error);
        res.status(500).json({ error: 'Failed to save quiz result' });
    }
});

app.get('/api/quiz-results/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const results = await QuizResult.find({ userId }).sort({ completedAt: -1 });
        res.json(results);
    } catch (error) {
        console.error('Get quiz results error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
});

app.get('/api/quiz-results/quiz/:quizId/leaderboard', async (req, res) => {
    try {
        const { quizId } = req.params;
        const results = await QuizResult.find({ quizId })
            .sort({ score: -1, completedAt: 1 })
            .limit(10);
        res.json(results);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Quiz App API is running',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
