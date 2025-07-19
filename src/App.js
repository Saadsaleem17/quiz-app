import React, { useState, useEffect } from 'react';
// import { auth, db, appId } from './firebase/config';
// import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
// import { doc, onSnapshot } from 'firebase/firestore';
// import { db, appId } from './firebase/config';

// Import Views
import { HomeView } from './views/HomeView';
import { CreateQuizView } from './views/CreateQuizView';
import { AttemptQuizView } from './views/AttemptQuizView';
import { LobbyView } from './views/LobbyView';
import { QuizView } from './views/QuizView';
import { ResultsView } from './views/ResultsView';
import { QuizLibrary } from './views/QuizLibrary';

// Import Common Components
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Import Database utilities
import { getUserQuizzes, saveQuiz } from './utils/quizDatabase';


function App() {
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
    const [localQuizzes, setLocalQuizzes] = useState({}); // Store created quizzes locally
    const [playerName, setPlayerName] = useState(''); // Store player name for quizzes
    const [userAnswers, setUserAnswers] = useState({}); // Store user's answers for score calculation
    const [savedQuizzes, setSavedQuizzes] = useState({}); // Store permanently saved quizzes

    // --- Authentication Effect ---
    useEffect(() => {
        // For demo mode, we'll skip Firebase authentication and use a mock user ID
        console.log("Setting up demo authentication");
        const demoUserId = `demo-user-${Math.random().toString(36).substr(2, 9)}`;
        setUserId(demoUserId);
        setIsAuthReady(true);
        
        // Load saved quizzes from database
        loadSavedQuizzes(demoUserId);
        
        // Commenting out Firebase auth for demo mode
        /*
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    // For demo purposes, we'll use anonymous authentication
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Authentication failed:", error);
                    setError("Could not connect to the service. Please refresh.");
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
        */
    }, []);

    // Load saved quizzes from database
    const loadSavedQuizzes = (userId) => {
        if (userId) {
            const quizzes = getUserQuizzes(userId);
            setSavedQuizzes(quizzes);
            setMyQuizzes(Object.values(quizzes));
        }
    };

    // Save quiz to database
    const saveQuizToDatabase = (userId, quizId, quizData) => {
        const success = saveQuiz(userId, quizId, quizData);
        if (success) {
            loadSavedQuizzes(userId);
            console.log('Quiz saved to permanent database');
        }
        return success;
    };

    // --- Fetch User's Quizzes Effect ---
    // Commented out since we're using local storage instead of Firebase
    /*
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
    */
    
    // --- Lobby Snapshot Effect ---
    useEffect(() => {
        if (view !== 'lobby' || !createdQuizCode) return;

        // Handle locally created quizzes
        if (localQuizzes && localQuizzes[createdQuizCode]) {
            console.log("Loading local quiz for lobby:", createdQuizCode);
            const localQuiz = localQuizzes[createdQuizCode];
            setCurrentQuiz(localQuiz);
            setPlayers(localQuiz.players || []);
            return;
        }

        // Handle saved quizzes from database
        if (savedQuizzes && savedQuizzes[createdQuizCode]) {
            console.log("Loading saved quiz for lobby:", createdQuizCode);
            const savedQuiz = savedQuizzes[createdQuizCode];
            setCurrentQuiz(savedQuiz);
            setPlayers(savedQuiz.players || []);
            return;
        }

        // Firebase fallback disabled for local/demo mode
        /*
        const lobbyDocPath = `/artifacts/${appId}/public/data/quizzes/${createdQuizCode}`;
        const unsubscribe = onSnapshot(doc(db, lobbyDocPath), (docSnap) => {
            if (docSnap.exists()) {
                const quizData = docSnap.data();
                setCurrentQuiz(quizData);
                setPlayers(quizData.players || []);
            }
        });

        return () => unsubscribe();
        */
    }, [view, createdQuizCode, localQuizzes, savedQuizzes]);

    // --- Quiz Attempt Snapshot Effect ---
    useEffect(() => {
        if (view !== 'quiz' || !quizCode) return;

        // First, check if this is a locally created quiz
        if (localQuizzes && localQuizzes[quizCode]) {
            console.log("Loading local quiz:", quizCode);
            const localQuiz = { ...localQuizzes[quizCode] };
            // Set status to active so the quiz can start
            localQuiz.status = 'active';
            setCurrentQuiz(localQuiz);
            setCurrentQuestionIndex(localQuiz.currentQuestionIndex || 0);
            setUserAnswers({}); // Reset user answers for new quiz
            return;
        }

        // Check if this is a saved quiz from database
        if (savedQuizzes && savedQuizzes[quizCode]) {
            console.log("Loading saved quiz:", quizCode);
            const savedQuiz = { ...savedQuizzes[quizCode] };
            // Set status to active so the quiz can start
            savedQuiz.status = 'active';
            setCurrentQuiz(savedQuiz);
            setCurrentQuestionIndex(savedQuiz.currentQuestionIndex || 0);
            setUserAnswers({}); // Reset user answers for new quiz
            return;
        }

        // Handle demo quizzes
        if (quizCode === 'DEMO' || quizCode === 'TEST') {
            console.log("Setting up demo quiz data");
            setUserAnswers({}); // Reset user answers for new quiz
            const demoQuiz = {
                title: "Demo Quiz",
                questions: [
                    {
                        text: "What is the capital of France?",
                        options: ["London", "Berlin", "Paris", "Madrid"],
                        correctAnswer: 2 // Paris is the correct answer (index 2)
                    },
                    {
                        text: "Which planet is known as the Red Planet?",
                        options: ["Venus", "Mars", "Jupiter", "Saturn"],
                        correctAnswer: 1 // Mars is the correct answer (index 1)
                    },
                    {
                        text: "What is 2 + 2?",
                        options: ["3", "4", "5", "6"],
                        correctAnswer: 1 // 4 is the correct answer (index 1)
                    }
                ],
                status: 'active', // Set to active so the quiz can start
                currentQuestionIndex: 0,
                createdBy: userId,
                players: [
                    { id: userId, name: playerName || "You" },
                    { id: "demo-player-1", name: "Demo Player 1" },
                    { id: "demo-player-2", name: "Demo Player 2" }
                ]
            };
            setCurrentQuiz(demoQuiz);
            setCurrentQuestionIndex(0);
            return;
        }

        // Firebase fallback disabled for local/demo mode
        /*
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
        */
    }, [view, quizCode, userId, localQuizzes, playerName, savedQuizzes]);


    // --- Component Rendering Logic (Router) ---
    const renderView = () => {
        console.log("Current view:", view);
        console.log("Auth ready:", isAuthReady);
        console.log("User ID:", userId);
        
        if (!isAuthReady) {
            return <LoadingSpinner />;
        }
        switch (view) {
            case 'create':
                console.log("Rendering CreateQuizView");
                return <CreateQuizView 
                    setView={setView} 
                    userId={userId} 
                    setCreatedQuizCode={setCreatedQuizCode} 
                    setLocalQuizzes={setLocalQuizzes}
                    saveQuizToDatabase={saveQuizToDatabase}
                />;
            case 'attempt':
                return <AttemptQuizView 
                    setView={setView} 
                    setQuizCode={setQuizCode} 
                    setError={setError} 
                    error={error} 
                    userId={userId} 
                    localQuizzes={localQuizzes}
                    savedQuizzes={savedQuizzes}
                    setPlayerName={setPlayerName} 
                />;
            case 'lobby':
                console.log("Rendering LobbyView with quizCode:", createdQuizCode);
                return <LobbyView setView={setView} quizCode={createdQuizCode} players={players} currentQuiz={currentQuiz} setQuizCode={setQuizCode} />;
            case 'quiz':
                return <QuizView 
                    quiz={currentQuiz} 
                    userId={userId} 
                    quizCode={quizCode} 
                    currentQuestionIndex={currentQuestionIndex} 
                    selectedAnswer={selectedAnswer} 
                    setSelectedAnswer={setSelectedAnswer}
                    setCurrentQuiz={setCurrentQuiz}
                    setView={setView}
                    setQuizResults={setQuizResults}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    setLocalQuizzes={setLocalQuizzes}
                    localQuizzes={localQuizzes}
                    playerName={playerName}
                    userAnswers={userAnswers}
                    setUserAnswers={setUserAnswers}
                />;
            case 'library':
                return <QuizLibrary 
                    setView={setView} 
                    userId={userId} 
                    setCreatedQuizCode={setCreatedQuizCode}
                    setQuizCode={setQuizCode}
                />;
            case 'results':
                return <ResultsView results={quizResults} setView={setView} />;
            default:
                console.log("Rendering HomeView");
                return <HomeView 
                    setView={setView} 
                    myQuizzes={myQuizzes} 
                    setCreatedQuizCode={setCreatedQuizCode} 
                    userId={userId} 
                    loadSavedQuizzes={loadSavedQuizzes}
                />;
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

export default App;
