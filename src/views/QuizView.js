import React, { useEffect } from 'react';

export const QuizView = ({ quiz, userId, quizCode, currentQuestionIndex, selectedAnswer, setSelectedAnswer, setCurrentQuiz, setView, setQuizResults, setCurrentQuestionIndex, localQuizzes, setLocalQuizzes, playerName, userAnswers, setUserAnswers }) => {
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
    };

    const handleNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
        
        // This logic now correctly handles both advancing the question and finishing the quiz.
        if (nextIndex < quiz.questions.length) {
            // --- Move to the next question ---
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
        } else {
            // --- Finish the quiz and calculate results ---
            let userScore = 0;
            quiz.questions.forEach((question, index) => {
                if (question.correctAnswer !== undefined && userAnswers[index] === question.correctAnswer) {
                    userScore++;
                }
            });
            
            const realResults = {
                scores: [
                    { name: playerName || "You", score: userScore },
                    { name: "Demo Player 1", score: Math.floor(Math.random() * (quiz.questions.length + 1)) },
                    { name: "Demo Player 2", score: Math.floor(Math.random() * (quiz.questions.length + 1)) }
                ],
                totalQuestions: quiz.questions.length
            };
            realResults.scores.sort((a, b) => b.score - a.score);
            
            setQuizResults(realResults);
            setView('results');
        }
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
                        
                        let buttonClass = "bg-gray-700 hover:bg-gray-600";
                        if (isSelected) {
                            buttonClass = "bg-green-500 hover:bg-green-600";
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
                
                {/* This button now correctly calls the handleNextQuestion function */}
                {(isHost || quizCode === 'DEMO' || quizCode === 'TEST' || (localQuizzes && localQuizzes[quizCode])) && (
                    <div className="mt-8">
                        <button 
                            onClick={handleNextQuestion} 
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
