import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from feature_extraction import FeatureExtraction, predict_url
import logging
import pandas as pd
import subprocess

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Persistent Volume paths
DATA_PATH = '/var/lib/mlService/data'
MODEL_PATH_DIR = '/var/lib/mlService/ml-model'
FEEDBACK_FILE = os.path.join(DATA_PATH, 'feedback_features.csv')

# Ensure directories exist
os.makedirs(DATA_PATH, exist_ok=True)
os.makedirs(MODEL_PATH_DIR, exist_ok=True)

# Determine model path
MODEL_PATH = os.path.join(MODEL_PATH_DIR, 'model.pkl')

# Load the pre-trained model
try:
    with open(MODEL_PATH, 'rb') as file:
        gbc = pickle.load(file)
except FileNotFoundError:
    raise Exception(f"model.pkl file not found at {MODEL_PATH}. Ensure it is in the correct directory.")

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        logger.debug(f"Received data: {data}")
        if not data or 'url' not in data:
            return jsonify({
                'error': 'Invalid input. Please provide a URL in the JSON body.'
            }), 400

        url = data['url']
        logger.debug(f"Processing URL: {url}")
        if not url:
            return jsonify({
                'error': 'URL cannot be empty.'
            }), 400

        result, pred = predict_url(url)
        logger.debug(f"Prediction result: {result}, prediction: {pred}")

        return jsonify({
            'url': url,
            'result': result,
            'prediction': pred
        }), 200

    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/wrong_prediction', methods=['POST'])
def wrong_prediction():
    try:
        data = request.get_json()
        logger.debug(f"Received wrong prediction data: {data}")
        if not data or 'url' not in data or 'result' not in data or 'probability' not in data:
            return jsonify({
                'error': 'Invalid input. Please provide URL, result, and probability in the JSON body.'
            }), 400

        url = data['url']
        result = data['result']
        probability = float(data['probability'])

        # Extract features
        feature_names = [
            "UsingIP", "LongURL", "ShortURL", "Symbol@", "Redirecting//", "PrefixSuffix-",
            "SubDomains", "HTTPS", "DomainRegLen", "Favicon", "NonStdPort", "HTTPSDomainURL",
            "RequestURL", "AnchorURL", "LinksInScriptTags", "ServerFormHandler", "InfoEmail",
            "AbnormalURL", "WebsiteForwarding", "StatusBarCust", "DisableRightClick",
            "UsingPopupWindow", "IframeRedirection", "AgeofDomain", "DNSRecording",
            "WebsiteTraffic", "PageRank", "GoogleIndex", "LinksPointingToPage", "StatsReport"
        ]
        feature_extractor = FeatureExtraction(url)
        features = feature_extractor.getFeaturesList()

        # Determine the corrected class
        corrected_class = 1 if result == "Phishing URL" else -1

        # Create a DataFrame for the new entry
        new_entry = pd.DataFrame([features + [corrected_class]], columns=feature_names + ['class'])

        # Append to feedback file
        if os.path.exists(FEEDBACK_FILE):
            existing_df = pd.read_csv(FEEDBACK_FILE)
            updated_df = pd.concat([existing_df, new_entry], ignore_index=True)
        else:
            updated_df = new_entry

        # Save to feedback file
        updated_df.to_csv(FEEDBACK_FILE, index=False)
        logger.info(f"Saved feedback for URL: {url}, corrected class: {corrected_class}")

        # Check if we have 10 entries
        if len(updated_df) >= 10:
            logger.info("10 entries reached, triggering retraining")
            try:
                subprocess.run(["python", "/app/retrain.py"], check=True)
                # Reload the model after retraining
                with open(MODEL_PATH, 'rb') as file:
                    global gbc
                    gbc = pickle.load(file)
                logger.info("Retraining completed successfully and model reloaded")
            except subprocess.CalledProcessError as e:
                logger.error(f"Retraining failed: {str(e)}")

        return jsonify({"message": "Feedback processed successfully"}), 200

    except Exception as e:
        logger.error(f"Error in wrong_prediction endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)