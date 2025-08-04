from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np
import os

# Load the trained model and scaler
model = joblib.load('fertilizer_model.joblib')
scaler = joblib.load('fertilizer_scaler.joblib')

# List the order of features expected by the model
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Serve static files (HTML, CSS, JS)
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    # Extract features in the correct order
    try:
        input_data = np.array([[data[feature] for feature in FEATURES]])
    except KeyError as e:
        return jsonify({'error': f'Missing feature: {e}'}), 400

    # Scale the input
    input_scaled = scaler.transform(input_data)
    # Predict
    prediction = model.predict(input_scaled)
    return jsonify({'prediction': prediction[0]})

if __name__ == '__main__':
    print("🌱 SmartCrop Prediction System")
    print("=" * 40)
    print("🚀 Starting server on http://localhost:5000")
    print("📱 Access your website at: http://localhost:5000")
    print("🔧 API endpoint: http://localhost:5000/predict")
    print("=" * 40)
    app.run(debug=True, host='0.0.0.0', port=5000)