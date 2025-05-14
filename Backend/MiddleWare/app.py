from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import requests
import bcrypt
import datetime
import logging
import logstash
import logging.handlers
import sys

app = Flask(__name__)
CORS(app)

# Configure logging to send logs to Logstash
logger = logging.getLogger('MiddlewareLogger')
logger.setLevel(logging.INFO)

# Logstash handler using python-logstash
try:
    logstash_handler = logstash.TCPLogstashHandler('logstash', 5044, version=1)
    logger.addHandler(logstash_handler)
except Exception as e:
    print(f"Failed to initialize Logstash handler: {str(e)}", file=sys.stderr)

# Add a StreamHandler to log to stdout
stream_handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('{"message": "%(message)s", "level": "%(levelname)s", "timestamp": "%(asctime)s", "module": "%(module)s", "funcName": "%(funcName)s"}')
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

# MySQL Configuration (connects to Kubernetes service)
db = mysql.connector.connect(
    host="phishing-mysql",
    user="root",
    password="root",
    database="phishing_db"
)
cursor = db.cursor()

# Create database and tables if not exists
cursor.execute("CREATE DATABASE IF NOT EXISTS phishing_db")
cursor.execute("USE phishing_db")
cursor.execute("CREATE TABLE IF NOT EXISTS users (username VARCHAR(255) PRIMARY KEY, password VARCHAR(255), email VARCHAR(255))")
cursor.execute("CREATE TABLE IF NOT EXISTS reported_urls (id INT AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255), prediction VARCHAR(50), probability FLOAT, reported_at DATETIME, username VARCHAR(255), FOREIGN KEY (username) REFERENCES users(username))")

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    logger.info(f"Login attempt for username: {username}")
    cursor.execute("SELECT password FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    if result and bcrypt.checkpw(password.encode(), result[0].encode()):
        logger.info(f"Login successful for username: {username}")
        return jsonify({"message": "Login successful", "username": username}), 200
    logger.error(f"Invalid credentials for username: {username}")
    return jsonify({"message": "Invalid credentials"}), 401

# Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    logger.info(f"Signup attempt for username: {username}")
    cursor.execute("SELECT username FROM users WHERE username = %s", (username,))
    if cursor.fetchone():
        logger.error(f"Username taken: {username}")
        return jsonify({"message": "Username taken"}), 400
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    cursor.execute("INSERT INTO users (username, password, email) VALUES (%s, %s, %s)",(username, hashed.decode(), email))
    db.commit()
    logger.info(f"Signup successful for username: {username}")
    return jsonify({"message": "Signup successful"}), 201

# Predict URL
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get('url')
    logger.info(f"Predict request for URL: {url}")
    response = requests.post('http://model-service:5000/api/predict', json={'url': url})
    if response.status_code == 200:
        result = response.json()
        logger.info(f"Prediction successful for URL: {url}, result: {result}")
        return jsonify(result), 200
    logger.error(f"Prediction failed for URL: {url}")
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
        logger.info(f"Report request for URL: {url} by username: {username}")
        if not all([url, prediction, probability, username]):
            logger.error("Missing required fields in report request")
            return jsonify({"message": "Missing required fields"}), 400
        reported_at = datetime.datetime.now()
        cursor.execute("INSERT INTO reported_urls (url, prediction, probability, reported_at, username) VALUES (%s, %s, %s, %s, %s)",
                       (url, prediction, probability, reported_at, username))
        db.commit()
        logger.info(f"URL reported successfully: {url}")
        return jsonify({"message": "URL reported"}), 201
    except mysql.connector.Error as db_err:
        logger.error(f"Database error during report: {str(db_err)}")
        return jsonify({"message": "Database error during report"}), 500
    except Exception as e:
        logger.error(f"Error during report: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

# View All Reported URLs
@app.route('/urls', methods=['GET'])
def get_urls():
    logger.info("Fetching all reported URLs")
    cursor.execute("SELECT * FROM reported_urls")
    rows = cursor.fetchall()
    urls = [{"id": row[0], "url": row[1], "prediction": row[2], "probability": row[3], "reported_at": row[4].isoformat(), "username": row[5]} for row in rows]
    logger.info(f"Fetched {len(urls)} reported URLs")
    return jsonify(urls), 200

# View User-Specific Reported URLs
@app.route('/user_urls/<username>', methods=['GET'])
def get_user_urls(username):
    logger.info(f"Fetching URLs for username: {username}")
    cursor.execute("SELECT * FROM reported_urls WHERE username = %s", (username,))
    rows = cursor.fetchall()
    urls = [{"id": row[0], "url": row[1], "prediction": row[2], "probability": row[3], "reported_at": row[4].isoformat(), "username": row[5]} for row in rows]
    logger.info(f"Fetched {len(urls)} URLs for username: {username}")
    return jsonify(urls), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)