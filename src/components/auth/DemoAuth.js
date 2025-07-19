import React, { useState } from 'react';
import { User, LogIn, UserPlus } from 'lucide-react';

export const DemoAuth = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isSignup, setIsSignup] = useState(false);

    const handleAuth = async () => {
        if (!username.trim()) {
            alert('Please enter a username');
            return;
        }

        const userId = `demo-${username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
        
        try {
            if (isSignup) {
                // API signup
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/users/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        userId: userId
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert(error.error || 'Signup failed');
                    return;
                }

                const data = await response.json();
                localStorage.setItem('quiz_app_current_user', JSON.stringify({
                    id: data.user.userId,
                    username: data.user.username
                }));
                
                onLogin(data.user.userId, data.user.username);
            } else {
                // API login
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username.trim()
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    alert(error.error || 'Login failed');
                    return;
                }

                const data = await response.json();
                localStorage.setItem('quiz_app_current_user', JSON.stringify({
                    id: data.user.userId,
                    username: data.user.username
                }));
                
                onLogin(data.user.userId, data.user.username);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Connection failed. Please check if the server is running.');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
                <User className="mx-auto mb-4 text-cyan-400" size={48} />
                <h2 className="text-2xl font-bold text-cyan-400">
                    {isSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-400 mt-2">
                    {isSignup ? 'Create a username to save your quizzes' : 'Enter your username to continue'}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                    />
                </div>

                <button
                    onClick={handleAuth}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    {isSignup ? <UserPlus size={20} /> : <LogIn size={20} />}
                    {isSignup ? 'Sign Up' : 'Login'}
                </button>

                <button
                    onClick={() => setIsSignup(!isSignup)}
                    className="w-full text-cyan-400 hover:text-cyan-300 text-sm underline"
                >
                    {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-xs text-gray-500">
                    {process.env.REACT_APP_DEMO_MODE === 'false' ? 
                        'Production Mode - Data stored in MongoDB' : 
                        'Demo Mode - Data stored locally in browser'
                    }
                </p>
            </div>
        </div>
    );
};
