import React from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ResultsView = ({ results, setView }) => {
    if (!results) {
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Calculating Results...</h2>
                <LoadingSpinner />
            </div>
        );
    }

    const { scores, totalQuestions } = results;
    const topScorer = scores[0];

    return (
        <div className="w-full max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold text-cyan-400 mb-4">Quiz Over!</h1>
            <h2 className="text-3xl font-bold text-white mb-8">Final Leaderboard</h2>

            {topScorer && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg mb-8 text-gray-900 shadow-lg">
                    <span className="text-2xl font-bold block">🏆 Winner 🏆</span>
                    <span className="text-4xl font-extrabold block mt-2">{topScorer.name}</span>
                    <span className="text-2xl font-semibold block mt-1">{topScorer.score} / {totalQuestions}</span>
                </div>
            )}

            <div className="bg-gray-800 p-6 rounded-lg">
                <ul className="space-y-3">
                    {scores.map((player, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-700 p-4 rounded-md text-lg">
                            <span className="font-bold">{index + 1}. {player.name}</span>
                            <span className="font-semibold text-cyan-400">{player.score} / {totalQuestions}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button onClick={() => setView('home')} className="mt-10 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg">
                Back to Home
            </button>
        </div>
    );
};
