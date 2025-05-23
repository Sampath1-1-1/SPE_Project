import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth';
import { loginUser } from '../utils/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(username, password);
            login({ username: response.username });
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md">
                <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-6 text-center">Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
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
                        Login
                    </button>
                </form>
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-center">
                    Don't have an account? <a href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;