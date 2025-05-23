import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth';

const Navbar = () => {
    const { user, logout, darkMode, setDarkMode } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-900 dark:bg-gray-900 p-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold flex items-center space-x-2">
                    <span className="text-3xl">🛡️</span>
                    <span>Phishing Guard</span>
                </Link>
                <div className="flex space-x-6 items-center">
                    <Link to="/" className="text-white font-medium hover:text-blue-200 transition duration-300">Home</Link>
                    <Link to="/report" className="text-white font-medium hover:text-blue-200 transition duration-300">Report</Link>
                    <Link to="/reports" className="text-white font-medium hover:text-blue-200 transition duration-300">All Reports</Link>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="text-white font-medium hover:text-blue-200 transition duration-300 flex items-center space-x-1"
                    >
                        {darkMode ? (
                            <>
                                <span>☀️</span>
                                <span>Light</span>
                            </>
                        ) : (
                            <>
                                <span>🌙</span>
                                <span>Dark</span>
                            </>
                        )}
                    </button>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-white font-medium hover:text-blue-200 transition duration-300">Dashboard</Link>
                            <button onClick={handleLogout} className="text-white font-medium hover:text-blue-200 transition duration-300">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white font-medium hover:text-blue-200 transition duration-300">Login</Link>
                            <Link to="/signup" className="text-white font-medium hover:text-blue-200 transition duration-300">Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;