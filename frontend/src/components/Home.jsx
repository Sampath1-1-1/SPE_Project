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
        setPrediction(null);
        try {
            const data = await predictUrl(url);
            setPrediction(data);
        } catch (err) {
            setError('Failed to get prediction');
            setPrediction(null);
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">            <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 dark:text-white mb-4">Phishing URL Detector</h1>
            <p className="text-lg text-white dark:text-gray-300 max-w-2xl mx-auto">
                Stay safe online by checking URLs for potential phishing threats with our advanced detection system.
            </p>
        </div>
            <div className="card w-full max-w-xl">
                <form onSubmit={handlePredict}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL (e.g., https://example.com)"
                        className="input-field mb-4"
                    />
                    {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Checking...' : 'Check URL'}
                    </button>
                </form>
                {prediction && (
                    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-white mb-2"><strong>URL:</strong> {prediction.url}</p>
                        <p className="text-gray-800 dark:text-white mb-2"><strong>Prediction:</strong> {prediction.result}</p>
                        <p className="text-gray-800 dark:text-white mb-4"><strong>Probability:</strong> {prediction.prediction}</p>
                        <div className="flex justify-evenly">
                            <button onClick={handleWrongPrediction} className="btn-secondary">
                                Report Wrong Prediction
                            </button>
                            <button className="btn-secondary bg-green-500 hover:bg-green-700">
                                <a href={url}> Proceed</a>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;