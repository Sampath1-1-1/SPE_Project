from flask import Flask, request, jsonify
import pickle
import numpy as np
from feature_extraction import FeatureExtraction, predict_url

app = Flask(__name__)

# Load the pre-trained model
try:
    with open('/app/model.pkl', 'rb') as file:
        gbc = pickle.load(file)
except FileNotFoundError:
    raise Exception("model.pkl file not found. Ensure it is in the project directory.")

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'error': 'Invalid input. Please provide a URL in the JSON body.'
            }), 400

        url = data['url']
        if not url:
            return jsonify({
                'error': 'URL cannot be empty.'
            }), 400

        # Use the predict_url function from feature_extraction.py
        result, pred = predict_url(url)

        # Return the prediction as JSON
        return jsonify({
            'url': url,
            'result': result,
            'prediction': pred
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


# from flask import Flask, request, jsonify
# import pickle
# import numpy as np
# from feature_extraction import FeatureExtraction, predict_url

# app = Flask(__name__)

# # Load model once
# try:
#     with open('model.pkl', 'rb') as file:
#         gbc = pickle.load(file)
# except FileNotFoundError:
#     raise Exception("model.pkl file not found.")

# @app.route('/api/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.get_json()
#         if not data or 'url' not in data:
#             return jsonify({'error': 'Invalid input. Provide a URL.'}), 400
#         url = data['url']
#         if not url:
#             return jsonify({'error': 'URL cannot be empty.'}), 400
#         result, pred = predict_url(url, gbc)  # Pass gbc
#         return jsonify({'url': url, 'result': result, 'prediction': pred}), 200
#     except Exception as e:
#         return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)

# def predict_url(url, gbc):
#     feature_extractor = FeatureExtraction(url)
#     x = np.array(feature_extractor.getFeaturesList()).reshape(1, 30)
#     y_pred = gbc.predict(x)[0]
#     y_pro_phishing = gbc.predict_proba(x)[0, 0]
#     y_pro_non_phishing = gbc.predict_proba(x)[0, 1]
#     if y_pred == 1:
#         result = "Legitimate URL"
#         pred = f"It is {y_pro_non_phishing*100:.2f}% safe to go"
#     else:
#         result = "Phishing URL"
#         pred = f"It is {y_pro_phishing*100:.2f}% likely to be phishing"
#     return result, pred