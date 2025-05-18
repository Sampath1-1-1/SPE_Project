import React, { useState } from 'react';
import { predictUrl } from '../utils/api';

const Home = () => {
    const [url, setUrl] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!url) {
            setError('Please enter a URL');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await predictUrl(url);
            setPrediction(data);
        } catch (err) {
            setError('Failed to get prediction');
        } finally {
            setLoading(false);
        }
    };

    const handleWrongPrediction = async () => {
        try {
            const response = await fetch(`/api/wrong_prediction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: prediction.url,
                    result: prediction.result,
                    probability: prediction.prediction.match(/[\d.]+/)[0],
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to report wrong prediction');
            }
            alert('Feedback submitted successfully');
        } catch (err) {
            setError('Failed to submit feedback');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Check URL for Phishing</h1>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <form onSubmit={handlePredict}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL (e.g., https://example.com)"
                        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Checking...' : 'Check URL'}
                    </button>
                </form>
                {prediction && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-gray-800 dark:text-white"><strong>URL:</strong> {prediction.url}</p>
                        <p className="text-gray-800 dark:text-white"><strong>Prediction:</strong> {prediction.result}</p>
                        <p className="text-gray-800 dark:text-white"><strong>Probability:</strong> {prediction.prediction}</p>
                        <button onClick={handleWrongPrediction} className="mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700">
                            Wrong Predicted
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;