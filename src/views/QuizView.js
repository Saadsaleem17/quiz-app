import React, { useEffect } from 'react';
// Firebase imports removed for local/demo mode
// import { db, appId } from '../firebase/config';
// import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

export const QuizView = ({ quiz, userId, quizCode, currentQuestionIndex, selectedAnswer, setSelectedAnswer, setCurrentQuiz, setView, setQuizResults, setCurrentQuestionIndex, setLocalQuizzes, localQuizzes, playerName, userAnswers, setUserAnswers }) => {
    const isHost = quiz?.createdBy === userId;

    useEffect(() => {
        setSelectedAnswer(null);
    }, [currentQuestionIndex, setSelectedAnswer]);

    if (!quiz || quiz.status === 'lobby' || !quiz.questions || !quiz.questions[currentQuestionIndex]) {
        return <div className="text-center text-2xl">Waiting for the quiz to start...</div>;
    }
    
    const question = quiz.questions[currentQuestionIndex];

    const handleAnswerSubmit = (optionIndex) => {
        setSelectedAnswer(optionIndex);
        
        // Store the user's answer for score calculation
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
        
        console.log("Answer submitted:", optionIndex, "for question", currentQuestionIndex + 1);
        
        // All quiz modes now work locally - no Firebase operations needed
    };

    const handleNextQuestion = () => {
        try {
            console.log("=== BUTTON CLICKED - DEBUG INFO ===");
            console.log("Button clicked! Function parameters check:");
            console.log("setQuizResults:", typeof setQuizResults);
            console.log("setView:", typeof setView);
            console.log("setCurrentQuiz:", typeof setCurrentQuiz);
            console.log("setCurrentQuestionIndex:", typeof setCurrentQuestionIndex);
            console.log("userAnswers:", userAnswers);
            console.log("quiz:", quiz);
            console.log("=====================================");
            
            const nextIndex = currentQuestionIndex + 1;
            
            console.log("handleNextQuestion called", {
                nextIndex,
                totalQuestions: quiz.questions.length,
                quizCode,
                isDemo: quizCode === 'DEMO' || quizCode === 'TEST',
                isLocal: localQuizzes && localQuizzes[quizCode],
                isHost,
                userId: userId,
                createdBy: quiz?.createdBy
            });
            
            // Handle demo mode and local quizzes
            if (quizCode === 'DEMO' || quizCode === 'TEST' || (localQuizzes && localQuizzes[quizCode])) {
                console.log("Processing demo/local quiz logic...");
                
                if (nextIndex < quiz.questions.length) {
                    console.log("Moving to next question:", nextIndex + 1);
                    // Update the quiz state locally for demo mode and local quizzes
                    const updatedQuiz = { ...quiz, currentQuestionIndex: nextIndex };
                    setCurrentQuiz(updatedQuiz);
                    setCurrentQuestionIndex(nextIndex);
                    setSelectedAnswer(null);
                    
                    // If it's a local quiz, update the stored data too
                    if (localQuizzes && localQuizzes[quizCode]) {
                        setLocalQuizzes(prevQuizzes => ({
                            ...prevQuizzes,
                            [quizCode]: updatedQuiz
                        }));
                    }
                    
                    console.log("Local/Demo mode: Moving to question", nextIndex + 1);
                } else {
                    console.log("Quiz finished, calculating results");
                    // Calculate real scores based on user answers
                    let userScore = 0;
                    quiz.questions.forEach((question, index) => {
                        if (question.correctAnswer !== undefined && userAnswers[index] === question.correctAnswer) {
                            userScore++;
                        }
                    });
                    
                    console.log("User score:", userScore, "out of", quiz.questions.length);
                    
                    const realResults = {
                        scores: [
                            { name: playerName || "You", score: userScore },
                            { name: "Demo Player 1", score: Math.floor(Math.random() * quiz.questions.length) },
                            { name: "Demo Player 2", score: Math.floor(Math.random() * quiz.questions.length) }
                        ],
                        totalQuestions: quiz.questions.length
                    };
                    realResults.scores.sort((a, b) => b.score - a.score);
                    
                    console.log("Setting quiz results:", realResults);
                    setQuizResults(realResults);
                    
                    console.log("Changing view to results...");
                    setView('results');
                    
                    console.log("Local/Demo mode: Quiz finished, showing results with real scores");
                }
                return;
            }
            
            console.log("Not a demo/local quiz - would use Firebase logic (disabled)");
        } catch (error) {
            console.error("Error in handleNextQuestion:", error);
            alert("Error in handleNextQuestion: " + error.message);
        }
    };
    
    // Firebase function disabled for local/demo mode
    /*
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
    */

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
                        
                        let buttonClass = "bg-gray-700 hover:bg-gray-600";
                        if (isSelected) {
                            buttonClass = "bg-green-500 hover:bg-green-600"; // Changed to green and allow hover
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSubmit(index)}
                                className={`w-full text-left p-4 rounded-lg text-lg transition-all duration-200 ${buttonClass}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                {/* For demo/local quizzes, allow anyone to proceed. For real quizzes, only host controls */}
                {(() => {
                    const showButton = isHost || quizCode === 'DEMO' || quizCode === 'TEST' || (localQuizzes && localQuizzes[quizCode]);
                    console.log("Button visibility debug:", {
                        showButton,
                        isHost,
                        quizCode,
                        isDemoOrTest: quizCode === 'DEMO' || quizCode === 'TEST',
                        hasLocalQuiz: localQuizzes && localQuizzes[quizCode],
                        localQuizzes
                    });
                    return showButton;
                })() && (
                    <div className="mt-8">
                        <button 
                            onClick={() => {
                                console.log("=== FINISH QUIZ - REAL CALCULATION ===");
                                console.log("Current quiz:", quiz);
                                console.log("User answers:", userAnswers);
                                console.log("Current question index:", currentQuestionIndex);
                                console.log("Total questions:", quiz.questions.length);
                                
                                // Calculate the user's real score
                                let userScore = 0;
                                quiz.questions.forEach((question, index) => {
                                    console.log(`Question ${index + 1}:`, {
                                        question: question.text,
                                        correctAnswer: question.correctAnswer,
                                        userAnswer: userAnswers[index],
                                        isCorrect: question.correctAnswer !== undefined && userAnswers[index] === question.correctAnswer
                                    });
                                    
                                    if (question.correctAnswer !== undefined && userAnswers[index] === question.correctAnswer) {
                                        userScore++;
                                    }
                                });
                                
                                console.log("Final user score:", userScore, "out of", quiz.questions.length);
                                
                                // Create results with real data
                                const realResults = {
                                    scores: [
                                        { name: playerName || "You", score: userScore },
                                        { name: "Demo Player 1", score: Math.floor(Math.random() * (quiz.questions.length + 1)) },
                                        { name: "Demo Player 2", score: Math.floor(Math.random() * (quiz.questions.length + 1)) }
                                    ],
                                    totalQuestions: quiz.questions.length
                                };
                                
                                // Sort by score (highest first)
                                realResults.scores.sort((a, b) => b.score - a.score);
                                
                                console.log("Final results:", realResults);
                                setQuizResults(realResults);
                                
                                console.log("Changing view to results...");
                                setView('results');
                                
                                console.log("Quiz finished successfully!");
                            }} 
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                        >
                            {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish & Show Results' : 'Next Question'}
                        </button>
                    </div>
                )}
                {!isHost && selectedAnswer !== null && !(quizCode === 'DEMO' || quizCode === 'TEST' || (localQuizzes && localQuizzes[quizCode])) && (
                    <p className="mt-8 text-gray-400">Your answer is submitted. Waiting for the host to proceed...</p>
                )}
            </div>
        </div>
    );
};
