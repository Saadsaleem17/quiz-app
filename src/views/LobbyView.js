import React from 'react';
// import { db, appId } from '../firebase/config';
// import { doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Copy, Users } from 'lucide-react';
// import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const LobbyView = ({ setView, quizCode, players, currentQuiz, setQuizCode }) => {
    // Demo data for when Firebase isn't connected
    const demoQuiz = {
        title: "Demo Quiz",
        questions: [
            {
                text: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"]
            }
        ]
    };
    
    const demoPlayers = [
        { id: "demo1", name: "Demo Player 1" },
        { id: "demo2", name: "Demo Player 2" }
    ];

    const handleCopyCode = () => {
        const codeToUse = quizCode || "DEMO123";
        const textArea = document.createElement("textarea");
        textArea.value = codeToUse;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert("Quiz code copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy code. Code is: " + codeToUse);
        }
        document.body.removeChild(textArea);
    };

    const handleStartQuiz = async () => {
        console.log("Starting quiz...");
        
        // Set the quiz code so we can transition to the quiz view
        if (quizCode && setQuizCode) {
            setQuizCode(quizCode);
        }
        
        alert("Quiz started! Transitioning to quiz view...");
        setView('quiz');
    };

    // Use demo data if no quiz data is available
    const displayQuiz = currentQuiz || demoQuiz;
    const displayPlayers = players || demoPlayers;
    const displayCode = quizCode || "DEMO123";

    return (
        <div className="w-full max-w-4xl mx-auto text-center">
             <button onClick={() => setView('home')} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                <ArrowLeft size={20} /> Back to My Quizzes
            </button>
            <h2 className="text-3xl font-bold text-gray-300">Quiz Lobby</h2>
            <h1 className="text-5xl font-extrabold text-cyan-400 my-3">{displayQuiz.title}</h1>
            <p className="text-lg text-gray-400 mb-6">Share the code below with your team to have them join.</p>
            
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 mb-8 inline-flex items-center gap-4">
                <span className="text-4xl font-mono tracking-widest text-white">{displayCode}</span>
                <button onClick={handleCopyCode} className="bg-gray-700 hover:bg-gray-600 text-cyan-400 p-3 rounded-lg">
                    <Copy size={24} />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 justify-center"><Users size={24} /> Players Joined ({displayPlayers.length})</h3>
                    <div className="h-64 overflow-y-auto pr-2">
                        {displayPlayers.length > 0 ? (
                            <ul className="space-y-2">
                                {displayPlayers.map(player => (
                                    <li key={player.id} className="bg-gray-700 p-3 rounded-md text-lg">{player.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Waiting for players to join...</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg flex flex-col justify-center items-center">
                     <h3 className="text-2xl font-bold mb-4">Ready to go?</h3>
                     <p className="text-gray-400 mb-6">Once everyone is in, start the quiz for all players.</p>
                     <button onClick={handleStartQuiz} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg shadow-green-500/20">
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};
