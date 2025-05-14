from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
import bcrypt
import datetime

app = Flask(__name__)
CORS(app)

# MySQL Configuration (connects to Kubernetes service)
db = mysql.connector.connect(
    host="phishing-mysql",  # Kubernetes service name
    user="root",
    password="root",
    database="phishing_db"
)
cursor = db.cursor()

# Create database and tables if not exists (fallback)
cursor.execute("CREATE DATABASE IF NOT EXISTS phishing_db")
cursor.execute("USE phishing_db")
cursor.execute("CREATE TABLE IF NOT EXISTS users (username VARCHAR(255) PRIMARY KEY, password VARCHAR(255), email VARCHAR(255))")
# cursor.execute("CREATE TABLE IF NOT EXISTS reported_urls (id INT AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255), prediction VARCHAR(50), probability FLOAT, reported_at DATETIME)")
# Modified reported_urls table to include username
cursor.execute("CREATE TABLE IF NOT EXISTS reported_urls (id INT AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255), prediction VARCHAR(50), probability FLOAT, reported_at DATETIME, username VARCHAR(255), FOREIGN KEY (username) REFERENCES users(username))")

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    cursor.execute("SELECT password FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    if result and bcrypt.checkpw(password.encode(), result[0].encode()):
        return jsonify({"message": "Login successful", "username": username}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    cursor.execute("SELECT username FROM users WHERE username = %s", (username,))
    if cursor.fetchone():
        return jsonify({"message": "Username taken"}), 400
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    cursor.execute("INSERT INTO users (username, password, email) VALUES (%s, %s, %s)",
                   (username, hashed.decode(), email))
    db.commit()
    return jsonify({"message": "Signup successful"}), 201

# Predict URL
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get('url')
    response = requests.post('http://model-service:5000/api/predict', json={'url': url})
    if response.status_code == 200:
        result = response.json()
        return jsonify(result), 200
    return jsonify({"message": "Prediction failed"}), 500

# Report URL
@app.route('/report', methods=['POST'])
def report():
    try:
        data = request.get_json()
        url = data.get('url')
        prediction = data.get('prediction')
        probability = data.get('probability')
        username = data.get('username')
        if not all([url, prediction, probability, username]):
            return jsonify({"message": "Missing required fields"}), 400
        reported_at = datetime.datetime.now()
        cursor.execute("INSERT INTO reported_urls (url, prediction, probability, reported_at, username) VALUES (%s, %s, %s, %s, %s)",
                       (url, prediction, probability, reported_at, username))
        db.commit()
        return jsonify({"message": "URL reported"}), 201
    except mysql.connector.Error as db_err:
        print(f"Database error during report: {str(db_err)}")
        return jsonify({"message": "Database error during report"}), 500
    except Exception as e:
        print(f"Error during report: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

# View All Reported URLs
@app.route('/urls', methods=['GET'])
def get_urls():
    cursor.execute("SELECT * FROM reported_urls")
    rows = cursor.fetchall()
    urls = [{"id": row[0], "url": row[1], "prediction": row[2], "probability": row[3], "reported_at": row[4].isoformat(), "username": row[5]} for row in rows]
    return jsonify(urls), 200

# View User-Specific Reported URLs
@app.route('/user_urls/<username>', methods=['GET'])
def get_user_urls(username):
    cursor.execute("SELECT * FROM reported_urls WHERE username = %s", (username,))
    rows = cursor.fetchall()
    urls = [{"id": row[0], "url": row[1], "prediction": row[2], "probability": row[3], "reported_at": row[4].isoformat(), "username": row[5]} for row in rows]
    return jsonify(urls), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)