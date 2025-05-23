import React, { useState, useEffect } from 'react';
import { getAllUrls } from '../utils/api';

const AllReportedUrls = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getAllUrls();
                setReports(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch reports');
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="min-h-screen flex flex-col p-6">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">All Reported URLs</h1>
            {loading && <p className="text-gray-200 dark:text-gray-300 text-lg text-center">Loading...</p>}
            {error && <p className="text-red-500 text-lg text-center">{error}</p>}
            {!loading && !error && (
                reports.length === 0 ? (
                    <p className="text-gray-200 dark:text-gray-300 text-lg text-center">No URLs reported yet.</p>
                ) : (
                    <div className="card w-full overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-blue-700 dark:bg-gray-700 text-white">
                                    <th className="p-4 text-left font-semibold">ID</th>
                                    <th className="p-4 text-left font-semibold">URL</th>
                                    <th className="p-4 text-left font-semibold">Prediction</th>
                                    <th className="p-4 text-left font-semibold">Probability</th>
                                    <th className="p-4 text-left font-semibold">Reported At</th>
                                    <th className="p-4 text-left font-semibold">Username</th>
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
                                        <td className="p-4 text-gray-800 dark:text-white">{report.username || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default AllReportedUrls;