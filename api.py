from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# Load the trained model and scaler
model = joblib.load('fertilizer_model.joblib')
scaler = joblib.load('fertilizer_scaler.joblib')

# List the order of features expected by the model
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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
    app.run(debug=True)