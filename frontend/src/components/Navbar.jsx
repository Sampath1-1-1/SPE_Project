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
        <nav className="bg-blue-600 dark:bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-bold">Phishing Detection</Link>
                <div className="flex space-x-4 items-center">
                    <Link to="/" className="text-white hover:text-gray-200">Home</Link>
                    <Link to="/report" className="text-white hover:text-gray-200">Report</Link>
                    <Link to="/reports" className="text-white hover:text-gray-200">See All Reports</Link>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="text-white hover:text-gray-200"
                    >
                        {darkMode ? '☀️ Light' : '🌙 Dark'}
                    </button>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-white hover:text-gray-200">Dashboard</Link>
                            <button onClick={handleLogout} className="text-white hover:text-gray-200">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
                            <Link to="/signup" className="text-white hover:text-gray-200">Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;