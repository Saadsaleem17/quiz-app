// Quiz Database utility functions using localStorage
// This provides persistent storage for user quizzes

const QUIZ_STORAGE_KEY = 'quiz_app_user_quizzes';
const QUIZ_HISTORY_KEY = 'quiz_app_quiz_history';

// Get all saved quizzes for a user
export const getUserQuizzes = (userId) => {
    try {
        const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
        return allQuizzes[userId] || {};
    } catch (error) {
        console.error('Error reading user quizzes:', error);
        return {};
    }
};

// Save a quiz for a user
export const saveQuiz = (userId, quizId, quizData) => {
    try {
        const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
        
        if (!allQuizzes[userId]) {
            allQuizzes[userId] = {};
        }
        
        // Add metadata
        const quizWithMetadata = {
            ...quizData,
            id: quizId,
            savedAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            timesUsed: 0
        };
        
        allQuizzes[userId][quizId] = quizWithMetadata;
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
        
        console.log('Quiz saved to database:', quizId);
        return true;
    } catch (error) {
        console.error('Error saving quiz:', error);
        return false;
    }
};

// Delete a quiz
export const deleteQuiz = (userId, quizId) => {
    try {
        const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
        
        if (allQuizzes[userId] && allQuizzes[userId][quizId]) {
            delete allQuizzes[userId][quizId];
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
            console.log('Quiz deleted from database:', quizId);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return false;
    }
};

// Update quiz usage (when someone starts the quiz)
export const updateQuizUsage = (userId, quizId) => {
    try {
        const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
        
        if (allQuizzes[userId] && allQuizzes[userId][quizId]) {
            allQuizzes[userId][quizId].lastUsed = new Date().toISOString();
            allQuizzes[userId][quizId].timesUsed = (allQuizzes[userId][quizId].timesUsed || 0) + 1;
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error updating quiz usage:', error);
        return false;
    }
};

// Get quiz statistics
export const getQuizStats = (userId) => {
    try {
        const userQuizzes = getUserQuizzes(userId);
        const quizzes = Object.values(userQuizzes);
        
        return {
            totalQuizzes: quizzes.length,
            totalQuestions: quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0),
            mostUsedQuiz: quizzes.reduce((max, quiz) => 
                (quiz.timesUsed || 0) > (max.timesUsed || 0) ? quiz : max, 
                quizzes[0] || null
            ),
            recentQuizzes: quizzes
                .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
                .slice(0, 5)
        };
    } catch (error) {
        console.error('Error getting quiz stats:', error);
        return {
            totalQuizzes: 0,
            totalQuestions: 0,
            mostUsedQuiz: null,
            recentQuizzes: []
        };
    }
};

// Search quizzes by title
export const searchQuizzes = (userId, searchTerm) => {
    try {
        const userQuizzes = getUserQuizzes(userId);
        const searchLower = searchTerm.toLowerCase();
        
        const matchingQuizzes = Object.entries(userQuizzes).filter(([quizId, quiz]) => 
            quiz.title?.toLowerCase().includes(searchLower)
        );
        
        return Object.fromEntries(matchingQuizzes);
    } catch (error) {
        console.error('Error searching quizzes:', error);
        return {};
    }
};

// Export all user data (for backup)
export const exportUserData = (userId) => {
    try {
        const userQuizzes = getUserQuizzes(userId);
        const stats = getQuizStats(userId);
        
        return {
            userId,
            exportDate: new Date().toISOString(),
            quizzes: userQuizzes,
            stats
        };
    } catch (error) {
        console.error('Error exporting user data:', error);
        return null;
    }
};

// Import user data (for restore)
export const importUserData = (userId, userData) => {
    try {
        const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
        allQuizzes[userId] = userData.quizzes;
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
        
        console.log('User data imported successfully');
        return true;
    } catch (error) {
        console.error('Error importing user data:', error);
        return false;
    }
};
