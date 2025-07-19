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
