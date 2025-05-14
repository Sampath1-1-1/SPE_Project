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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">User Dashboard</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Welcome, {user.username}!</h2>
                <p className="text-gray-600 dark:text-gray-300">This is your dashboard. View your reported URLs below.</p>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Your Reported URLs</h2>
            {loading && <p className="text-gray-800 dark:text-white">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-blue-600 dark:bg-gray-700 text-white">
                                <th className="p-3 text-left">ID</th>
                                <th className="p-3 text-left">URL</th>
                                <th className="p-3 text-left">Prediction</th>
                                <th className="p-3 text-left">Probability</th>
                                <th className="p-3 text-left">Reported At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="border-b dark:border-gray-700">
                                    <td className="p-3 text-gray-800 dark:text-white">{report.id}</td>
                                    <td className="p-3 text-gray-800 dark:text-white">{report.url}</td>
                                    <td className="p-3 text-gray-800 dark:text-white">{report.prediction}</td>
                                    <td className="p-3 text-gray-800 dark:text-white">{(report.probability * 100).toFixed(2)}%</td>
                                    <td className="p-3 text-gray-800 dark:text-white">{new Date(report.reported_at).toLocaleString()}</td>
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