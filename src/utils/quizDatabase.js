// Quiz Database utility functions with MongoDB and localStorage fallback
// This provides persistent storage for user quizzes

const QUIZ_STORAGE_KEY = 'quiz_app_user_quizzes';
const QUIZ_HISTORY_KEY = 'quiz_app_quiz_history';

// API base URL (you can change this to your backend URL when available)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Check if we're in demo mode or have API access
const isDemoMode = () => {
    return process.env.REACT_APP_DEMO_MODE === 'true';
};

// Get all saved quizzes for a user
export const getUserQuizzes = async (userId) => {
    console.log("getUserQuizzes called with userId:", userId);
    console.log("Demo mode:", isDemoMode());
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("REACT_APP_DEMO_MODE:", process.env.REACT_APP_DEMO_MODE);
    console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
    
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            console.log("All quizzes from localStorage:", allQuizzes);
            const userQuizzes = allQuizzes[userId] || {};
            console.log(`User ${userId} quizzes:`, userQuizzes);
            return userQuizzes;
        } catch (error) {
            console.error('Error reading user quizzes from localStorage:', error);
            return {};
        }
    }

    // Use MongoDB API for production
    try {
        console.log("Making API request to:", `${API_BASE_URL}/quizzes/user/${userId}`);
        const response = await fetch(`${API_BASE_URL}/quizzes/user/${userId}`);
        console.log("API response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const quizzes = await response.json();
        console.log("API response data:", quizzes);
        
        // Backend already returns object format, no need to convert
        console.log("Returning quizzes object:", quizzes);
        return quizzes;
    } catch (error) {
        console.error('Error fetching user quizzes from API:', error);
        // Fallback to localStorage if API fails
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            return allQuizzes[userId] || {};
        } catch (localError) {
            console.error('Error reading from localStorage fallback:', localError);
            return {};
        }
    }
};

// Save a quiz for a user
export const saveQuiz = async (userId, quizId, quizData) => {
    console.log("saveQuiz called with:", { userId, quizId, quizData });
    console.log("Demo mode:", isDemoMode());
    
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            console.log("Current allQuizzes before save:", allQuizzes);
            
            if (!allQuizzes[userId]) {
                allQuizzes[userId] = {};
            }
            
            // Add metadata
            const quizWithMetadata = {
                ...quizData,
                id: quizId,
                userId: userId,
                savedAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                timesUsed: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            allQuizzes[userId][quizId] = quizWithMetadata;
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
            
            console.log('Quiz saved to localStorage:', quizId);
            console.log("Updated allQuizzes after save:", allQuizzes);
            return true;
        } catch (error) {
            console.error('Error saving quiz to localStorage:', error);
            return false;
        }
    }

    // Use MongoDB API for production
    try {
        const quizWithMetadata = {
            ...quizData,
            id: quizId,
            userId: userId,
            savedAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            timesUsed: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = await fetch(`${API_BASE_URL}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quizWithMetadata)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Quiz saved to MongoDB:', quizId);
        return true;
    } catch (error) {
        console.error('Error saving quiz to API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            
            if (!allQuizzes[userId]) {
                allQuizzes[userId] = {};
            }
            
            const quizWithMetadata = {
                ...quizData,
                id: quizId,
                userId: userId,
                savedAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                timesUsed: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            allQuizzes[userId][quizId] = quizWithMetadata;
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
            
            console.log('Quiz saved to localStorage (fallback):', quizId);
            return true;
        } catch (localError) {
            console.error('Error saving to localStorage fallback:', localError);
            return false;
        }
    }
};

// Delete a quiz
export const deleteQuiz = async (userId, quizId) => {
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            
            if (allQuizzes[userId] && allQuizzes[userId][quizId]) {
                delete allQuizzes[userId][quizId];
                localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
                console.log('Quiz deleted from localStorage:', quizId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error deleting quiz from localStorage:', error);
            return false;
        }
    }

    // Use MongoDB API for production
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Quiz deleted from MongoDB:', quizId);
        return true;
    } catch (error) {
        console.error('Error deleting quiz from API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            
            if (allQuizzes[userId] && allQuizzes[userId][quizId]) {
                delete allQuizzes[userId][quizId];
                localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
                console.log('Quiz deleted from localStorage (fallback):', quizId);
                return true;
            }
            
            return false;
        } catch (localError) {
            console.error('Error deleting from localStorage fallback:', localError);
            return false;
        }
    }
};

// Update quiz usage (when someone starts the quiz)
export const updateQuizUsage = async (userId, quizId) => {
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            
            if (allQuizzes[userId] && allQuizzes[userId][quizId]) {
                allQuizzes[userId][quizId].lastUsed = new Date().toISOString();
                allQuizzes[userId][quizId].timesUsed = (allQuizzes[userId][quizId].timesUsed || 0) + 1;
                allQuizzes[userId][quizId].updatedAt = new Date().toISOString();
                localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error updating quiz usage in localStorage:', error);
            return false;
        }
    }

    // Use MongoDB API for production
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/usage`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error updating quiz usage via API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            
            if (allQuizzes[userId] && allQuizzes[userId][quizId]) {
                allQuizzes[userId][quizId].lastUsed = new Date().toISOString();
                allQuizzes[userId][quizId].timesUsed = (allQuizzes[userId][quizId].timesUsed || 0) + 1;
                allQuizzes[userId][quizId].updatedAt = new Date().toISOString();
                localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
                return true;
            }
            
            return false;
        } catch (localError) {
            console.error('Error updating quiz usage in localStorage fallback:', localError);
            return false;
        }
    }
};

// Get quiz statistics
export const getQuizStats = async (userId) => {
    try {
        const userQuizzes = await getUserQuizzes(userId);
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
export const searchQuizzes = async (userId, searchTerm) => {
    try {
        const userQuizzes = await getUserQuizzes(userId);
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
export const exportUserData = async (userId) => {
    try {
        const userQuizzes = await getUserQuizzes(userId);
        const stats = await getQuizStats(userId);
        
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
export const importUserData = async (userId, userData) => {
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            allQuizzes[userId] = userData.quizzes;
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
            
            console.log('User data imported to localStorage successfully');
            return true;
        } catch (error) {
            console.error('Error importing user data to localStorage:', error);
            return false;
        }
    }

    // Use MongoDB API for production
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('User data imported to MongoDB successfully');
        return true;
    } catch (error) {
        console.error('Error importing user data to API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const allQuizzes = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
            allQuizzes[userId] = userData.quizzes;
            localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(allQuizzes));
            
            console.log('User data imported to localStorage (fallback) successfully');
            return true;
        } catch (localError) {
            console.error('Error importing user data to localStorage fallback:', localError);
            return false;
        }
    }
};

// Save quiz result to database
export const saveQuizResult = async (resultData) => {
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const results = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
            const result = {
                ...resultData,
                id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                completedAt: new Date().toISOString()
            };
            results.push(result);
            localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(results));
            
            console.log('Quiz result saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving quiz result to localStorage:', error);
            return false;
        }
    }

    // Use MongoDB API for production
    try {
        const response = await fetch(`${API_BASE_URL}/quiz-results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...resultData,
                completedAt: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Quiz result saved to MongoDB');
        return true;
    } catch (error) {
        console.error('Error saving quiz result to API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const results = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
            const result = {
                ...resultData,
                id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                completedAt: new Date().toISOString()
            };
            results.push(result);
            localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(results));
            
            console.log('Quiz result saved to localStorage (fallback)');
            return true;
        } catch (localError) {
            console.error('Error saving quiz result to localStorage fallback:', localError);
            return false;
        }
    }
};

// Get quiz results for a user
export const getUserQuizResults = async (userId) => {
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const results = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
            return results.filter(result => result.userId === userId);
        } catch (error) {
            console.error('Error reading quiz results from localStorage:', error);
            return [];
        }
    }

    // Use MongoDB API for production
    try {
        const response = await fetch(`${API_BASE_URL}/quiz-results/user/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching quiz results from API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const results = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
            return results.filter(result => result.userId === userId);
        } catch (localError) {
            console.error('Error reading quiz results from localStorage fallback:', localError);
            return [];
        }
    }
};

// Get leaderboard for a specific quiz
export const getQuizLeaderboard = async (quizId) => {
    if (isDemoMode()) {
        // Use localStorage for demo mode
        try {
            const results = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
            return results
                .filter(result => result.quizId === quizId)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10); // Top 10 scores
        } catch (error) {
            console.error('Error reading leaderboard from localStorage:', error);
            return [];
        }
    }

    // Use MongoDB API for production
    try {
        const response = await fetch(`${API_BASE_URL}/quiz-results/quiz/${quizId}/leaderboard`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching leaderboard from API:', error);
        
        // Fallback to localStorage if API fails
        try {
            const results = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || '[]');
            return results
                .filter(result => result.quizId === quizId)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10); // Top 10 scores
        } catch (localError) {
            console.error('Error reading leaderboard from localStorage fallback:', localError);
            return [];
        }
    }
};
