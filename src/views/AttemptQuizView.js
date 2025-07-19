import React, { useState } from 'react';
import { db, appId } from '../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export const AttemptQuizView = ({ setView, setQuizCode, setError, error, userId, localQuizzes, savedQuizzes, setPlayerName }) => {
    const [localCode, setLocalCode] = useState('');
    const [playerNameInput, setPlayerNameInput] = useState('');

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedCode = localCode.trim();
        const trimmedName = playerNameInput.trim();
        
        if (!trimmedCode) {
            setError("Please enter a quiz code.");
            return;
        }
        
        if (!trimmedName) {
            setError("Please enter your name.");
            return;
        }

        setQuizCode(trimmedCode);
        setPlayerName(trimmedName);

        // First, check if this is a locally created quiz
        if (localQuizzes && localQuizzes[trimmedCode]) {
            console.log("Found local quiz with code:", trimmedCode);
            alert(`Welcome ${trimmedName}! Joining local quiz...`);
            setView('quiz');
            return;
        }

        // Check if this is a saved quiz from database
        if (savedQuizzes && savedQuizzes[trimmedCode]) {
            console.log("Found saved quiz with code:", trimmedCode);
            alert(`Welcome ${trimmedName}! Joining saved quiz...`);
            setView('quiz');
            return;
        }

        // Check if this is a demo quiz code (for testing without Firebase)
        if (trimmedCode === 'DEMO' || trimmedCode === 'TEST') {
            console.log("Joining demo quiz with code:", trimmedCode);
            alert(`Welcome ${trimmedName}! Joining demo quiz...`);
            setView('quiz');
            return;
        }

        const quizDocPath = `/artifacts/${appId}/public/data/quizzes/${trimmedCode}`;
        const quizDocRef = doc(db, quizDocPath);

        try {
            const docSnap = await getDoc(quizDocRef);
            if (docSnap.exists()) {
                const quizData = docSnap.data();

                if (quizData.status !== 'lobby') {
                    setError(`This quiz is already ${quizData.status}. You can no longer join.`);
                    setQuizCode('');
                    return;
                }
                
                if (quizData.players && quizData.players.some(p => p.id === userId)) {
                    setView('quiz');
                    return;
                }

                const newPlayer = { id: userId, name: `Player ${Math.floor(Math.random() * 1000)}` };
                await updateDoc(quizDocRef, {
                    players: arrayUnion(newPlayer)
                });
                
                setView('quiz');
            } else {
                setError("Quiz not found. Please check the code and try again.");
                setQuizCode('');
            }
        } catch (err) {
            console.error("Error joining quiz:", err);
            setError("Could not join the quiz. Please check the code and your connection.");
            setQuizCode('');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto text-center">
            <button onClick={() => { setView('home'); setError(''); }} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mx-auto">
                <ArrowLeft size={20} /> Back to Home
            </button>
            <h2 className="text-4xl font-bold mb-4 text-cyan-400">Join a Quiz</h2>
            <p className="text-gray-400 mb-4">Enter the code from the quiz host to join.</p>
            <p className="text-yellow-400 mb-8 text-sm">💡 Try "DEMO" or "TEST" for demo mode (works without Firebase)</p>
            <form onSubmit={handleJoin}>
                <input
                    type="text"
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-800 text-white p-3 rounded-lg text-center text-lg border-2 border-gray-600 focus:ring-4 focus:ring-cyan-500/50 focus:outline-none mb-4"
                    required
                />
                <input
                    type="text"
                    value={localCode}
                    onChange={(e) => setLocalCode(e.target.value)}
                    placeholder="ENTER CODE"
                    className="w-full bg-gray-800 text-white p-4 rounded-lg text-center text-2xl tracking-widest font-bold border-2 border-gray-600 focus:ring-4 focus:ring-cyan-500/50 focus:outline-none"
                    required
                />
                {error && <p className="text-red-400 mt-4">{error}</p>}
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl mt-6">
                    Join Quiz
                </button>
            </form>
        </div>
    );
};
