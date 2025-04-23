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
            } catch (err) {
                setError('Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">All Reported URLs</h1>
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

export default AllReportedUrls;