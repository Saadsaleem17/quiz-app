import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Trash2, Search, Calendar, BarChart3 } from 'lucide-react';
import { getUserQuizzes, deleteQuiz, searchQuizzes, getQuizStats, updateQuizUsage } from '../utils/quizDatabase';

export const QuizLibrary = ({ setView, userId, setCreatedQuizCode, setQuizCode }) => {
    const [savedQuizzes, setSavedQuizzes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState(null);
    const [filteredQuizzes, setFilteredQuizzes] = useState({});

    useEffect(() => {
        loadQuizzes();
        loadStats();
    }, [userId]);

    useEffect(() => {
        filterQuizzes();
    }, [searchTerm, savedQuizzes, userId]);

    const loadQuizzes = async () => {
        try {
            const quizzes = await getUserQuizzes(userId);
            setSavedQuizzes(quizzes || {});
        } catch (error) {
            console.error('Error loading quizzes:', error);
            setSavedQuizzes({});
        }
    };

    const loadStats = async () => {
        try {
            const quizStats = await getQuizStats(userId);
            setStats(quizStats);
        } catch (error) {
            console.error('Error loading stats:', error);
            setStats(null);
        }
    };

    const filterQuizzes = async () => {
        try {
            if (searchTerm.trim()) {
                const filtered = await searchQuizzes(userId, searchTerm);
                setFilteredQuizzes(filtered || {});
            } else {
                setFilteredQuizzes(savedQuizzes || {});
            }
        } catch (error) {
            console.error('Error filtering quizzes:', error);
            setFilteredQuizzes({});
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            try {
                const success = await deleteQuiz(userId, quizId);
                if (success) {
                    await loadQuizzes();
                    await loadStats();
                    alert('Quiz deleted successfully!');
                } else {
                    alert('Failed to delete quiz. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting quiz:', error);
                alert('Failed to delete quiz. Please try again.');
            }
        }
    };

    const handleStartQuiz = async (quizId) => {
        try {
            await updateQuizUsage(userId, quizId);
            setCreatedQuizCode(quizId);
            setView('lobby');
        } catch (error) {
            console.error('Error starting quiz:', error);
            setView('lobby');
        }
    };

    const handleJoinQuiz = async (quizId) => {
        try {
            await updateQuizUsage(userId, quizId);
            setQuizCode(quizId);
            setView('quiz');
        } catch (error) {
            console.error('Error joining quiz:', error);
            setQuizCode(quizId);
            setView('quiz');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quizArray = Object.entries(filteredQuizzes).sort((a, b) => 
        new Date(b[1].lastUsed) - new Date(a[1].lastUsed)
    );

    return (
        <div className="w-full max-w-6xl mx-auto">
            <button 
                onClick={() => setView('home')} 
                className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
            >
                <ArrowLeft size={20} /> Back to Home
            </button>

            <div className="mb-8">
                <h2 className="text-4xl font-bold text-center mb-4 text-cyan-400">Quiz Library</h2>
                <p className="text-gray-400 text-center">Manage your saved quizzes and view statistics</p>
            </div>

            {/* Stats Section */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-cyan-400">{stats.totalQuizzes}</div>
                        <div className="text-gray-400">Total Quizzes</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-400">{stats.totalQuestions}</div>
                        <div className="text-gray-400">Total Questions</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-400">
                            {stats.mostUsedQuiz?.timesUsed || 0}
                        </div>
                        <div className="text-gray-400">Most Used</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-400">{stats.recentQuizzes.length}</div>
                        <div className="text-gray-400">Recent</div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search your quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 text-white p-3 pl-10 rounded-lg border-2 border-gray-600 focus:ring-4 focus:ring-cyan-500/50 focus:outline-none"
                    />
                </div>
            </div>

            {/* Quizzes Grid */}
            {quizArray.length === 0 ? (
                <div className="text-center py-12">
                    <BarChart3 size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                        {searchTerm ? 'No quizzes found' : 'No saved quizzes yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm 
                            ? 'Try a different search term or create a new quiz.'
                            : 'Create your first quiz to get started!'
                        }
                    </p>
                    {!searchTerm && (
                        <button 
                            onClick={() => setView('create')}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg"
                        >
                            Create Your First Quiz
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizArray.map(([quizId, quiz]) => (
                        <div key={quizId} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white truncate mr-2">{quiz.title}</h3>
                                <button
                                    onClick={() => handleDeleteQuiz(quizId)}
                                    className="text-red-400 hover:text-red-300 flex-shrink-0"
                                    title="Delete Quiz"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Created: {formatDate(quiz.savedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={16} />
                                    <span>{quiz.questions?.length || 0} questions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Play size={16} />
                                    <span>Used {quiz.timesUsed || 0} times</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStartQuiz(quizId)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center justify-center gap-2"
                                    title="Start as Host"
                                >
                                    <Play size={16} />
                                    Host
                                </button>
                                <button
                                    onClick={() => handleJoinQuiz(quizId)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                    title="Join as Player"
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
