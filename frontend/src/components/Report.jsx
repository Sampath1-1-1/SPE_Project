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
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-extrabold text-blue-900 dark:text-white mb-8 text-center">Report a Suspicious URL</h1>            <div className="card w-full max-w-lg">
                <form onSubmit={handleReport}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to report (e.g., https://example.com)"
                        className="input-field mb-4"
                    />
                    {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Reporting...' : 'Report URL'}
                    </button>
                </form>
                {result && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-white mb-2"><strong>URL:</strong> {result.url}</p>
                        <p className="text-gray-800 dark:text-white mb-2"><strong>Prediction:</strong> {result.prediction}</p>
                        <p className="text-gray-800 dark:text-white mb-4"><strong>Probability:</strong> {(result.probability * 100).toFixed(2)}%</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;