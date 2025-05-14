import React, { useState, useContext } from 'react';
import { predictUrl, reportUrl } from '../utils/api';
import { AuthContext } from '../hooks/useAuth';

const Report = () => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const handleReport = async (e) => {
        e.preventDefault();
        if (!url) {
            setError('Please enter a URL');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const predictData = await predictUrl(url);
            const { result: predResult, prediction } = predictData;
            const probability = parseFloat(prediction.match(/[\d.]+/)[0]) / 100;
            await reportUrl(url, predResult, probability, user.username);
            setResult({ url, prediction: predResult, probability });
        } catch (err) {
            setError('Failed to report URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Report a URL</h1>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handleReport}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to report"
                        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Reporting...' : 'Report URL'}
                    </button>
                </form>
                {result && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-gray-800 dark:text-white"><strong>URL:</strong> {result.url}</p>
                        <p className="text-gray-800 dark:text-white"><strong>Prediction:</strong> {result.prediction}</p>
                        <p className="text-gray-800 dark:text-white"><strong>Probability:</strong> {(result.probability * 100).toFixed(2)}%</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;