// MongoDB schemas for quiz data
import mongoose from 'mongoose';

// Quiz Question Schema
const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, 'Options array must have at least 2 items']
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0
    }
});

function arrayLimit(val) {
    return val.length >= 2;
}

// Quiz Schema
const QuizSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    questions: {
        type: [QuestionSchema],
        required: true,
        validate: [arrayLimit, 'Quiz must have at least one question']
    },
    players: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    timesUsed: {
        type: Number,
        default: 0
    },
    // Additional metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Quiz Result Schema (for storing quiz completion results)
const QuizResultSchema = new mongoose.Schema({
    quizId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    playerName: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: {
        type: Map,
        of: Number
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    }
});

// User Schema (for storing user preferences and stats)
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        default: 'Anonymous User'
    },
    totalQuizzesCreated: {
        type: Number,
        default: 0
    },
    totalQuizzesTaken: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for better performance
QuizSchema.index({ userId: 1, createdAt: -1 });
QuizSchema.index({ id: 1 });
QuizSchema.index({ title: 'text' }); // For text search
QuizResultSchema.index({ quizId: 1, userId: 1 });
QuizResultSchema.index({ userId: 1, completedAt: -1 });
UserSchema.index({ userId: 1 });

// Export models
export const Quiz = mongoose.model('Quiz', QuizSchema);
export const QuizResult = mongoose.model('QuizResult', QuizResultSchema);
export const User = mongoose.model('User', UserSchema);
