import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { getUserUrls } from '../utils/api';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getUserUrls(user.username);
                setReports(data);
            } catch (err) {
                setError('Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [user.username]);

    return (
        <div className="min-h-screen flex flex-col p-6">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">User Dashboard</h1>
            <div className="card w-full max-w-4xl mx-auto mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Welcome, {user.username}!</h2>
                <p className="text-gray-600 dark:text-gray-300">View and manage your reported URLs below.</p>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">Your Reported URLs</h2>
            {loading && <p className="text-gray-200 dark:text-gray-300 text-lg text-center">Loading...</p>}
            {error && <p className="text-red-500 text-lg text-center">{error}</p>}
            {!loading && !error && (
                <div className="card w-full max-w-4xl mx-auto overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-blue-700 dark:bg-gray-700 text-white">
                                <th className="p-4 text-left font-semibold">ID</th>
                                <th className="p-4 text-left font-semibold">URL</th>
                                <th className="p-4 text-left font-semibold">Prediction</th>
                                <th className="p-4 text-left font-semibold">Probability</th>
                                <th className="p-4 text-left font-semibold">Reported At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
                                    <td className="p-4 text-gray-800 dark:text-white">{report.id}</td>
                                    <td className="p-4 text-gray-800 dark:text-white">{report.url}</td>
                                    <td className="p-4 text-gray-800 dark:text-white">{report.prediction}</td>
                                    <td className="p-4 text-gray-800 dark:text-white">{(report.probability * 100).toFixed(2)}%</td>
                                    <td className="p-4 text-gray-800 dark:text-white">{new Date(report.reported_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;