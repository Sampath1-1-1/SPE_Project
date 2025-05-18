import unittest
import json
from unittest.mock import patch
from flask import Flask
import sys
import os

# Add Backend/Model-service to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../Backend/Model-service')))

from app import app
from feature_extraction import FeatureExtraction, predict_url
import datetime
import pickle

class TestModelService(unittest.TestCase):
    def setUp(self):
        """Set up the test client and app context."""
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_model_loading(self):
        """Test if the model.pkl file is loaded correctly."""
        with self.app.app_context():
            try:
                # Use path relative to Backend/Model-service
                model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../Backend/Model-service/model.pkl')
                with open(model_path, 'rb') as file:
                    model = pickle.load(file)
                self.assertIsNotNone(model, "Model should be loaded successfully")
            except FileNotFoundError:
                self.fail(f"model.pkl file not found at {model_path}")

    @patch('feature_extraction.search')  # Updated mock path
    @patch('feature_extraction.requests.get')
    @patch('feature_extraction.whois.whois')
    def test_predict_endpoint_valid_url(self, mock_whois, mock_requests_get, mock_search):
        """Test /api/predict with a valid URL."""
        # Mock requests.get to simulate a successful response
        mock_response = unittest.mock.Mock()
        mock_response.text = "<html><body>Test</body></html>"
        mock_response.status_code = 200
        mock_requests_get.return_value = mock_response

        # Mock whois response
        mock_whois.return_value = {
            'creation_date': [datetime.datetime(2020, 1, 1)],
            'expiration_date': [datetime.datetime(2025, 1, 1)]
        }

        # Mock google search to return empty results
        mock_search.return_value = []

        # Send POST request to /api/predict
        response = self.client.post(
            '/api/predict',
            data=json.dumps({'url': 'https://example.com'}),
            content_type='application/json'
        )

        # Check response
        self.assertEqual(response.status_code, 200, f"Expected 200, got {response.status_code}: {response.data}")
        response_data = json.loads(response.data)
        self.assertIn('url', response_data)
        self.assertIn('result', response_data)
        self.assertIn('prediction', response_data)
        self.assertEqual(response_data['url'], 'https://example.com')
        self.assertTrue(isinstance(response_data['result'], str))
        self.assertTrue(isinstance(response_data['prediction'], str))

    def test_predict_endpoint_missing_url(self):
        """Test /api/predict with missing URL in request."""
        response = self.client.post(
            '/api/predict',
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input. Please provide a URL in the JSON body.')

    def test_predict_endpoint_empty_url(self):
        """Test /api/predict with empty URL."""
        response = self.client.post(
            '/api/predict',
            data=json.dumps({'url': ''}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'URL cannot be empty.')

    @patch('feature_extraction.requests.get')
    def test_predict_endpoint_invalid_url(self, mock_requests_get):
        """Test /api/predict with an invalid URL causing feature extraction failure."""
        # Mock requests.get to simulate a failure
        mock_requests_get.side_effect = Exception("Connection error")

        response = self.client.post(
            '/api/predict',
            data=json.dumps({'url': 'http://invalid-url'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 500)
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)
        self.assertTrue('An error occurred' in response_data['error'])

    def test_feature_extraction_integration(self):
        """Test integration with FeatureExtraction class."""
        url = 'https://example.com'
        feature_extractor = FeatureExtraction(url)
        features = feature_extractor.getFeaturesList()
        self.assertEqual(len(features), 30, "FeatureExtraction should return 30 features")
        self.assertTrue(all(isinstance(f, int) for f in features), "Features should be integers")

    def tearDown(self):
        """Clean up after tests."""
        pass

if __name__ == '__main__':
    unittest.main()



    