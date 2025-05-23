import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../utils/api';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signupUser(username, password, email);
            navigate('/login');
        } catch (err) {
            setError('Username taken or invalid input');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md">
                <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-6 text-center">Create Account</h2>                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="input-field mb-4"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="input-field mb-4"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="input-field mb-4"
                    />
                    {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="btn-primary w-full"
                    >
                        Signup
                    </button>
                </form>
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-center">
                    Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;