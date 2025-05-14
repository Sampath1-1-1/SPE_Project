const API_URL = '/api';

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return await response.json();
};

export const signupUser = async (username, password, email) => {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
};

export const predictUrl = async (url) => {
    const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });
    if (!response.ok) {
        throw new Error('Prediction failed');
    }
    return await response.json();
};

export const reportUrl = async (url, prediction, probability) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const username = user ? user.username : null; // Get the logged-in username
    if (!username) {
        throw new Error('User not logged in');
    }
    const response = await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, prediction, probability, username }),
    });
    if (!response.ok) {
        throw new Error('Report failed');
    }
    return await response.json();
};

export const getAllUrls = async () => {
    const response = await fetch(`${API_URL}/urls`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch URLs');
    }
    return await response.json();
};

export const getUserUrls = async (username) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const requestingUser = user ? user.username : null;
    if (!requestingUser) {
        throw new Error('User not logged in');
    }
    const response = await fetch(`${API_URL}/user_urls/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user URLs');
    }
    return await response.json();
};