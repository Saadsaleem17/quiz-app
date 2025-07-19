import React, { useState, useEffect } from 'react';
import { auth, db, appId } from './firebase/config';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';

// Import Views
import { HomeView } from './views/HomeView';
import { CreateQuizView } from './views/CreateQuizView';
import { AttemptQuizView } from './views/AttemptQuizView';
import { LobbyView } from './views/LobbyView';
import { QuizView } from './views/QuizView';
import { ResultsView } from './views/ResultsView';

// Import Common Components
import { LoadingSpinner } from './components/common/LoadingSpinner';


export default function App() {
    const [view, setView] = useState('home');
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [quizCode, setQuizCode] = useState('');
    const [createdQuizCode, setCreatedQuizCode] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizResults, setQuizResults] = useState(null);

    // --- Authentication Effect ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Authentication failed:", error);
                    setError("Could not connect to the service. Please refresh.");
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    // --- Fetch User's Quizzes Effect ---
    useEffect(() => {
        if (!isAuthReady || !userId) return;

        const quizzesCollectionPath = `/artifacts/${appId}/users/${userId}/quizzes`;
        const q = query(collection(db, quizzesCollectionPath));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userQuizzes = [];
            querySnapshot.forEach((doc) => {
                userQuizzes.push({ id: doc.id, ...doc.data() });
            });
            setMyQuizzes(userQuizzes);
        }, (err) => {
            console.error("Error fetching user quizzes:", err);
            setError("Could not load your quizzes.");
        });

        return () => unsubscribe();
    }, [isAuthReady, userId]);
    
    // --- Lobby Snapshot Effect ---
    useEffect(() => {
        if (view !== 'lobby' || !createdQuizCode) return;

        const lobbyDocPath = `/artifacts/${appId}/public/data/quizzes/${createdQuizCode}`;
        const unsubscribe = onSnapshot(doc(db, lobbyDocPath), (docSnap) => {
            if (docSnap.exists()) {
                const quizData = docSnap.data();
                setCurrentQuiz(quizData);
                setPlayers(quizData.players || []);
            }
        });

        return () => unsubscribe();
    }, [view, createdQuizCode]);

    // --- Quiz Attempt Snapshot Effect ---
    useEffect(() => {
        if (view !== 'quiz' || !quizCode) return;

        const quizDocPath = `/artifacts/${appId}/public/data/quizzes/${quizCode}`;
        const unsubscribe = onSnapshot(doc(db, quizDocPath), (docSnap) => {
            if (docSnap.exists()) {
                const quizData = docSnap.data();
                setCurrentQuiz(quizData);
                setCurrentQuestionIndex(quizData.currentQuestionIndex || 0);
                if (quizData.status === 'finished') {
                    setQuizResults(quizData.results);
                    setView('results');
                }
            } else {
                setError("This quiz does not exist or has been closed.");
                setView('attempt');
            }
        });

        return () => unsubscribe();
    }, [view, quizCode]);


    // --- Component Rendering Logic (Router) ---
    const renderView = () => {
        if (!isAuthReady) {
            return <LoadingSpinner />;
        }
        switch (view) {
            case 'create':
                return <CreateQuizView setView={setView} userId={userId} setCreatedQuizCode={setCreatedQuizCode} />;
            case 'attempt':
                return <AttemptQuizView setView={setView} setQuizCode={setQuizCode} setError={setError} error={error} userId={userId} />;
            case 'lobby':
                return <LobbyView setView={setView} quizCode={createdQuizCode} players={players} currentQuiz={currentQuiz} />;
            case 'quiz':
                return <QuizView quiz={currentQuiz} userId={userId} quizCode={quizCode} currentQuestionIndex={currentQuestionIndex} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} />;
            case 'results':
                return <ResultsView results={quizResults} setView={setView} />;
            default:
                return <HomeView setView={setView} myQuizzes={myQuizzes} setCreatedQuizCode={setCreatedQuizCode} userId={userId} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto">
                {renderView()}
            </div>
        </div>
    );
}
