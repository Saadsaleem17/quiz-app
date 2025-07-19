
/*

// =================================================================================================

/*
/src/views/CreateQuizView.js
- The view for creating a new quiz.
*/
import React, { useState } from 'react';
import { db, appId } from '../firebase/config';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';

export const CreateQuizView = ({ setView, userId, setCreatedQuizCode }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]);

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].text = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswer = oIndex;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
            console.log("Validation failed: Please fill out all fields.");
            return;
        }

        try {
            const privateQuizCollectionPath = `/artifacts/${appId}/users/${userId}/quizzes`;
            const quizData = {
                title,
                questions,
                createdBy: userId,
                createdAt: new Date(),
            };
            const privateDocRef = await addDoc(collection(db, privateQuizCollectionPath), quizData);
            const quizId = privateDocRef.id;

            const publicQuizDocPath = `/artifacts/${appId}/public/data/quizzes/${quizId}`;
            const publicQuizData = {
                title,
                questions: questions.map(q => ({ text: q.text, options: q.options })),
                createdBy: userId,
                status: 'lobby',
                players: [],
                currentQuestionIndex: 0,
                answers: [],
            };
            await setDoc(doc(db, publicQuizDocPath), publicQuizData);

            setCreatedQuizCode(quizId);
            setView('lobby');
        } catch (error) {
            console.error("Error creating quiz:", error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => setView('home')} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                <ArrowLeft size={20} /> Back to Home
            </button>
            <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Create a New Quiz</h2>
            <form onSubmit={handleSubmit}>
                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <label htmlFor="quiz-title" className="block text-lg font-semibold mb-2 text-gray-300">Quiz Title</label>
                    <input
                        id="quiz-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., General Knowledge Challenge"
                        className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        required
                    />
                </div>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700 relative">
                        <h3 className="text-xl font-semibold mb-4 text-gray-300">Question {qIndex + 1}</h3>
                        {questions.length > 1 && (
                             <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-500 hover:text-red-400">
                                <Trash2 size={20} />
                            </button>
                        )}
                        <textarea
                            value={q.text}
                            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                            placeholder="What is the capital of France?"
                            className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 mb-4 h-24 resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name={`correct-answer-${qIndex}`}
                                        id={`q${qIndex}o${oIndex}`}
                                        checked={q.correctAnswer === oIndex}
                                        onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                                        className="h-5 w-5 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-600"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        placeholder={`Option ${oIndex + 1}`}
                                        className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        required
                                     />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="flex justify-between items-center mt-8">
                    <button type="button" onClick={addQuestion} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <Plus size={20} /> Add Question
                    </button>
                    <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg">
                        Create Quiz & Start Lobby
                    </button>
                </div>
            </form>
        </div>
    );
};

// =================================================================================================

/*
/src/views/AttemptQuizView.js
- The view for players to join a quiz.
*/
import React, { useState } from 'react';
import { db, appId } from '../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export const AttemptQuizView = ({ setView, setQuizCode, setError, error, userId }) => {
    const [localCode, setLocalCode] = useState('');

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedCode = localCode.trim();
        if (!trimmedCode) {
            setError("Please enter a quiz code.");
            return;
        }

        setQuizCode(trimmedCode);

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
            <p className="text-gray-400 mb-8">Enter the code from the quiz host to join.</p>
            <form onSubmit={handleJoin}>
                <input
                    type="text"
                    value={localCode}
                    onChange={(e) => setLocalCode(e.target.value)}
                    placeholder="ENTER CODE"
                    className="w-full bg-gray-800 text-white p-4 rounded-lg text-center text-2xl tracking-widest font-bold border-2 border-gray-600 focus:ring-4 focus:ring-cyan-500/50 focus:outline-none"
                />
                {error && <p className="text-red-400 mt-4">{error}</p>}
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl mt-6">
                    Join Quiz
                </button>
            </form>
        </div>
    );
};

// =================================================================================================

/*
/src/views/LobbyView.js
- The pre-quiz waiting lobby.
*/
import React from 'react';
import { db, appId } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const LobbyView = ({ setView, quizCode, players, currentQuiz }) => {

    const handleCopyCode = () => {
        const textArea = document.createElement("textarea");
        textArea.value = quizCode;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };

    const handleStartQuiz = async () => {
        if (!quizCode) return;
        const quizDocPath = `/artifacts/${appId}/public/data/quizzes/${quizCode}`;
        try {
            await updateDoc(doc(db, quizDocPath), {
                status: 'active',
                currentQuestionIndex: 0,
            });
            setView('quiz');
        } catch (error) {
            console.error("Error starting quiz:", error);
        }
    };

    if (!currentQuiz) return <LoadingSpinner />;

    return (
        <div className="w-full max-w-4xl mx-auto text-center">
             <button onClick={() => setView('home')} className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                <ArrowLeft size={20} /> Back to My Quizzes
            </button>
            <h2 className="text-3xl font-bold text-gray-300">Quiz Lobby</h2>
            <h1 className="text-5xl font-extrabold text-cyan-400 my-3">{currentQuiz.title}</h1>
            <p className="text-lg text-gray-400 mb-6">Share the code below with your team to have them join.</p>
            
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 mb-8 inline-flex items-center gap-4">
                <span className="text-4xl font-mono tracking-widest text-white">{quizCode}</span>
                <button onClick={handleCopyCode} className="bg-gray-700 hover:bg-gray-600 text-cyan-400 p-3 rounded-lg">
                    <Copy size={24} />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 justify-center"><Users size={24} /> Players Joined ({players.length})</h3>
                    <div className="h-64 overflow-y-auto pr-2">
                        {players.length > 0 ? (
                            <ul className="space-y-2">
                                {players.map(player => (
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
                     <button onClick={handleStartQuiz} disabled={players.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg shadow-green-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none">
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================================================

/*
/src/views/QuizView.js
- The main quiz gameplay view.
*/
import React, { useEffect } from 'react';
import { db, appId } from '../firebase/config';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

export const QuizView = ({ quiz, userId, quizCode, currentQuestionIndex, selectedAnswer, setSelectedAnswer }) => {
    const isHost = quiz?.createdBy === userId;

    useEffect(() => {
        setSelectedAnswer(null);
    }, [currentQuestionIndex, setSelectedAnswer]);

    if (!quiz || quiz.status === 'lobby' || !quiz.questions || !quiz.questions[currentQuestionIndex]) {
        return <div className="text-center text-2xl">Waiting for the quiz to start...</div>;
    }
    
    const question = quiz.questions[currentQuestionIndex];

    const handleAnswerSubmit = async (optionIndex) => {
        setSelectedAnswer(optionIndex);
        
        const quizAnswersRef = collection(db, `/artifacts/${appId}/public/data/quizzes/${quizCode}/answers`);
        const answerDocId = `${userId}_q${currentQuestionIndex}`;
        
        try {
            await setDoc(doc(quizAnswersRef, answerDocId), {
                userId,
                questionIndex: currentQuestionIndex,
                answer: optionIndex,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error("Error submitting answer:", error);
        }
    };

    const handleNextQuestion = async () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < quiz.questions.length) {
            await updateDoc(doc(db, `/artifacts/${appId}/public/data/quizzes/${quizCode}`), {
                currentQuestionIndex: nextIndex
            });
        } else {
            await calculateAndShowResults();
        }
    };
    
    const calculateAndShowResults = async () => {
        const privateQuizDoc = await getDoc(doc(db, `/artifacts/${appId}/users/${quiz.createdBy}/quizzes/${quizCode}`));
        if (!privateQuizDoc.exists()) {
            console.error("Could not find original quiz data to calculate results.");
            return;
        }
        const correctAnswers = privateQuizDoc.data().questions.map(q => q.correctAnswer);

        const answersSnapshot = await getDocs(collection(db, `/artifacts/${appId}/public/data/quizzes/${quizCode}/answers`));
        const submittedAnswers = answersSnapshot.docs.map(d => d.data());

        const publicQuizDoc = await getDoc(doc(db, `/artifacts/${appId}/public/data/quizzes/${quizCode}`));
        const players = publicQuizDoc.data().players;

        const scores = players.map(player => {
            const playerScore = submittedAnswers
                .filter(ans => ans.userId === player.id && correctAnswers[ans.questionIndex] === ans.answer)
                .length;
            return { name: player.name, score: playerScore };
        });

        scores.sort((a, b) => b.score - a.score);

        await updateDoc(doc(db, `/artifacts/${appId}/public/data/quizzes/${quizCode}`), {
            status: 'finished',
            results: { scores, totalQuestions: quiz.questions.length }
        });
    };

    return (
        <div className="w-full max-w-3xl mx-auto text-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-cyan-400 font-bold">{quiz.title}</span>
                    <span className="bg-gray-700 text-white text-sm font-semibold px-3 py-1 rounded-full">Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
                </div>
                <h2 className="text-3xl font-bold my-6 min-h-[80px]">{question.text}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isSubmitted = selectedAnswer !== null;
                        
                        let buttonClass = "bg-gray-700 hover:bg-gray-600";
                        if (isSubmitted && isSelected) {
                            buttonClass = "bg-yellow-500";
                        } else if (isSubmitted) {
                            buttonClass = "bg-gray-700 opacity-50";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSubmit(index)}
                                disabled={isSubmitted}
                                className={`w-full text-left p-4 rounded-lg text-lg transition-all duration-200 ${buttonClass} disabled:cursor-not-allowed`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                 {isHost && (
                    <div className="mt-8">
                        <button onClick={handleNextQuestion} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg">
                            {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish & Show Results' : 'Next Question'}
                        </button>
                    </div>
                )}
                {!isHost && selectedAnswer !== null && (
                    <p className="mt-8 text-gray-400">Your answer is submitted. Waiting for the host to proceed...</p>
                )}
            </div>
        </div>
    );
};

// =================================================================================================

/*
/src/views/ResultsView.js
- The final results and leaderboard view.
*/
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

// =================================================================================================

/*
/src/App.js
- The main application component.
- Manages state, routing, and Firebase listeners.
*/
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

