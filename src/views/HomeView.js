import React from 'react';
import { Plus, Play, Trash2, Library } from 'lucide-react';
import { deleteQuiz } from '../utils/quizDatabase';

export const HomeView = ({ setView, myQuizzes, setCreatedQuizCode, userId, loadSavedQuizzes }) => {
    
    const handleResumeQuiz = (quizId) => {
        setCreatedQuizCode(quizId);
        setView('lobby');
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz and all its data? This action cannot be undone.")) {
            return;
        }
        
        try {
            const success = deleteQuiz(userId, quizId);
            if (success) {
                // Reload the quizzes after deletion
                if (loadSavedQuizzes) {
                    loadSavedQuizzes(userId);
                }
                console.log("Quiz deleted successfully");
            } else {
                console.error("Failed to delete quiz");
            }
        } catch (error) {
            console.error("Error deleting quiz:", error);
        }
    };

    return (
        <div className="text-center">
            <h1 className="text-5xl font-bold text-cyan-400 mb-4">QuizMaster</h1>
            <p className="text-lg text-gray-400 mb-12">Create, share, and play quizzes with your team in real-time.</p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
                <button onClick={() => setView('create')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg shadow-cyan-500/20 transition-transform transform hover:scale-105 flex items-center justify-center gap-3">
                    <Plus size={24} /> Create New Quiz
                </button>
                <button onClick={() => setView('attempt')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg shadow-gray-700/20 transition-transform transform hover:scale-105 flex items-center justify-center gap-3">
                    <Play size={24} /> Attempt a Quiz
                </button>
                <button onClick={() => setView('library')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg shadow-purple-600/20 transition-transform transform hover:scale-105 flex items-center justify-center gap-3">
                    <Library size={24} /> Quiz Library
                </button>
            </div>
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-gray-300 mb-6">My Quizzes</h2>
                {myQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                        {myQuizzes.map(quiz => (
                            <div key={quiz.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-cyan-400 mb-2">{quiz.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4">Code: {quiz.id}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleResumeQuiz(quiz.id)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm flex-grow">Resume</button>
                                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-md"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">You haven't created any quizzes yet.</p>
                )}
            </div>
        </div>
    );
};