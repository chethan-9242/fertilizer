// Form Handling

document.getElementById('fertilizer-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Gather form data
    const formData = {
        N: parseFloat(document.getElementById('nitrogen').value),
        P: parseFloat(document.getElementById('phosphorus').value),
        K: parseFloat(document.getElementById('potassium').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        ph: parseFloat(document.getElementById('ph').value),
        rainfall: parseFloat(document.getElementById('rainfall').value)
    };

    // Show loading message
    const resultDiv = document.getElementById('prediction-result');
    resultDiv.innerHTML = "Analyzing soil parameters...";

    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Prediction failed');
        }

        const data = await response.json();
        resultDiv.innerHTML = `<h3>Recommended Crop: ${data.prediction}</h3>`;
    } catch (error) {
        resultDiv.innerHTML = `<span style="color:red;">Error: ${error.message}</span>`;
    }
});

function validateInputs(data) {
    const ranges = {
        temperature: { min: -10, max: 50 },
        humidity: { min: 0, max: 100 },
        ph: { min: 0, max: 14 },
        rainfall: { min: 0, max: 1000 },
        nitrogen: { min: 0, max: 100 },
        phosphorus: { min: 0, max: 100 },
        potassium: { min: 0, max: 100 }
    };

    for (const [key, value] of Object.entries(data)) {
        if (value < ranges[key].min || value > ranges[key].max) {
            alert(`Please enter a valid ${key} value between ${ranges[key].min} and ${ranges[key].max}`);
            return false;
        }
    }
    return true;
}

function predictFertilizer(data) {
    if (!fertilizerData) {
        return {
            recommended: "Dataset not loaded",
            confidence: 0,
            details: "Please wait while the dataset is being loaded."
        };
    }

    // Normalize input data
    const normalizedInput = {
        temperature: normalizeValue(data.temperature, 0, 50),
        humidity: normalizeValue(data.humidity, 0, 100),
        ph: normalizeValue(data.ph, 0, 14),
        rainfall: normalizeValue(data.rainfall, 0, 1000),
        nitrogen: normalizeValue(data.nitrogen, 0, 100),
        phosphorus: normalizeValue(data.phosphorus, 0, 100),
        potassium: normalizeValue(data.potassium, 0, 100)
    };

    // Find the most similar cases in the dataset
    const similarCases = findSimilarCases(normalizedInput);
    
    // Get the most common fertilizer recommendation
    const recommendation = getMostCommonFertilizer(similarCases);
    
    return {
        recommended: recommendation.fertilizer,
        confidence: recommendation.confidence,
        details: `Based on ${similarCases.length} similar cases in our database, we recommend ${recommendation.fertilizer} with ${recommendation.confidence}% confidence.`
    };
}

function normalizeValue(value, min, max) {
    return (value - min) / (max - min);
}

function findSimilarCases(input) {
    const similarityThreshold = 0.8;
    const similarCases = [];

    for (const dataPoint of fertilizerData) {
        const similarity = calculateSimilarity(input, dataPoint);
        if (similarity >= similarityThreshold) {
            similarCases.push({...dataPoint, similarity});
        }
    }

    return similarCases.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

function calculateSimilarity(input, dataPoint) {
    const weights = {
        temperature: 0.15,
        humidity: 0.15,
        ph: 0.2,
        rainfall: 0.1,
        nitrogen: 0.15,
        phosphorus: 0.15,
        potassium: 0.1
    };

    let similarity = 0;
    for (const [key, weight] of Object.entries(weights)) {
        similarity += weight * (1 - Math.abs(input[key] - dataPoint[key]));
    }

    return similarity;
}

function getMostCommonFertilizer(similarCases) {
    const fertilizerCounts = {};
    let maxCount = 0;
    let mostCommon = '';

    similarCases.forEach(dataPoint => {
        const fertilizer = dataPoint.fertilizer;
        fertilizerCounts[fertilizer] = (fertilizerCounts[fertilizer] || 0) + 1;
        
        if (fertilizerCounts[fertilizer] > maxCount) {
            maxCount = fertilizerCounts[fertilizer];
            mostCommon = fertilizer;
        }
    });

    return {
        fertilizer: mostCommon,
        confidence: Math.round((maxCount / similarCases.length) * 100)
    };
}

function displayResult(prediction) {
    const resultDiv = document.getElementById('prediction-result');
    resultDiv.innerHTML = `
        <h3>Recommended Fertilizer: ${prediction.recommended}</h3>
        <p>Confidence: ${prediction.confidence}%</p>
        <p>${prediction.details}</p>
    `;
    
    // Add animation to the result
    resultDiv.style.animation = 'none';
    resultDiv.offsetHeight; // Trigger reflow
    resultDiv.style.animation = 'fadeIn 0.5s ease-in';
} 