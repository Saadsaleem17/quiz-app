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
