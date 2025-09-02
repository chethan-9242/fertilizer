'use strict';

// Neon spheres background on canvas
(function createNeonSpheresBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  const colors = [
    { edge: 'rgba(0,229,255,1)', glow: 'rgba(0,229,255,0.35)' },
    { edge: 'rgba(122,92,255,1)', glow: 'rgba(122,92,255,0.35)' },
    { edge: 'rgba(255,61,191,1)', glow: 'rgba(255,61,191,0.35)' },
  ];

  const spheres = Array.from({ length: 18 }).map(() => {
    const radius = Math.random() * 80 + 40; // 40 - 120
    const x = Math.random() * width;
    const y = Math.random() * height;
    const vx = (Math.random() - 0.5) * 0.3;
    const vy = (Math.random() - 0.5) * 0.3;
    const c = colors[Math.floor(Math.random() * colors.length)];
    return { x, y, vx, vy, radius, c, phase: Math.random() * Math.PI * 2 };
  });

  function drawSphere(s) {
    const gradient = ctx.createRadialGradient(s.x, s.y, s.radius * 0.1, s.x, s.y, s.radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.04)');
    gradient.addColorStop(0.5, s.c.glow);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Edge glow
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = s.c.edge;
    ctx.shadowBlur = 18;
    ctx.shadowColor = s.c.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    for (const s of spheres) {
      s.x += s.vx;
      s.y += s.vy;
      // gentle breathing effect
      s.radius += Math.sin(s.phase) * 0.03;
      s.phase += 0.01;

      if (s.x < -150) s.x = width + 150;
      if (s.x > width + 150) s.x = -150;
      if (s.y < -150) s.y = height + 150;
      if (s.y > height + 150) s.y = -150;

      drawSphere(s);
    }

    requestAnimationFrame(tick);
  }

  tick();
})();

// Form logic
(function attachFormHandlers() {
  const form = document.getElementById('predict-form');
  if (!form) return;

  const status = document.getElementById('status');
  const resultSection = document.getElementById('result');
  const predictionValue = document.getElementById('prediction-value');
  const tryAgain = document.getElementById('try-again');

  function setStatus(message, type = 'info') {
    status.textContent = message || '';
    status.style.color = type === 'error' ? '#ff7aa8' : '#8aa0c6';
  }

  function toPayload(formData) {
    const FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
    const payload = {};
    for (const key of FEATURES) {
      const value = formData.get(key);
      if (value === null || value === '') return { error: `Missing value for ${key}` };
      const num = Number(value);
      if (!Number.isFinite(num)) return { error: `Invalid number for ${key}` };
      payload[key] = num;
    }
    if (payload.ph < 0 || payload.ph > 14) return { error: 'Soil pH must be between 0 and 14' };
    return { payload };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('Predicting…');
    resultSection.classList.add('hidden');

    const { payload, error } = toPayload(new FormData(form));
    if (error) { setStatus(error, 'error'); return; }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${response.status})`);
      }
      const data = await response.json();
      const pred = data.prediction;
      predictionValue.textContent = String(pred);
      resultSection.classList.remove('hidden');
      setStatus('');
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Network error';
      setStatus(msg, 'error');
    }
  });

  tryAgain?.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
// Modern JavaScript for SmartCrop Prediction System

// DOM Elements
const form = document.getElementById('fertilizer-form');
const resultDiv = document.getElementById('prediction-result');
const navLinks = document.querySelectorAll('.nav-link');

// Smooth scrolling for navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(l => l.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
});

// Form handling with enhanced UX
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    showLoadingState();
    
    // Gather and validate form data
    const formData = gatherFormData();
    
    if (!validateFormData(formData)) {
        showError('Please fill in all fields with valid values');
        return;
    }
    
    try {
        // Make API call
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        showSuccessResult(data.prediction);
        
    } catch (error) {
        console.error('Prediction error:', error);
        showError('Failed to get prediction. Please try again.');
    }
});

// Gather form data
function gatherFormData() {
    return {
        N: parseFloat(document.getElementById('nitrogen').value),
        P: parseFloat(document.getElementById('phosphorus').value),
        K: parseFloat(document.getElementById('potassium').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        ph: parseFloat(document.getElementById('ph').value),
        rainfall: parseFloat(document.getElementById('rainfall').value)
    };
}

// Validate form data
function validateFormData(data) {
    const ranges = {
        N: { min: 0, max: 200 },
        P: { min: 0, max: 200 },
        K: { min: 0, max: 200 },
        temperature: { min: -10, max: 50 },
        humidity: { min: 0, max: 100 },
        ph: { min: 0, max: 14 },
        rainfall: { min: 0, max: 1000 }
    };

    for (const [key, value] of Object.entries(data)) {
        if (isNaN(value) || value === null || value === undefined) {
            return false;
        }
        
        const range = ranges[key];
        if (range && (value < range.min || value > range.max)) {
            return false;
        }
    }
    
    return true;
}

// Show loading state
function showLoadingState() {
    resultDiv.innerHTML = `
        <div class="loading-container">
            <div class="loading"></div>
            <p>Analyzing soil parameters...</p>
            <div class="loading-text">
                <span>Processing</span>
                <span class="dots">...</span>
            </div>
        </div>
    `;
    resultDiv.classList.add('loading-state');
}

// Show success result
function showSuccessResult(prediction) {
    const cropEmoji = getCropEmoji(prediction);
    const cropInfo = getCropInfo(prediction);
    
    resultDiv.innerHTML = `
        <div class="success-result success-animation">
            <div class="result-icon">
                ${cropEmoji}
            </div>
            <h3 class="result-title">Recommended Crop</h3>
            <div class="crop-name">${prediction}</div>
            <div class="crop-info">
                <p><strong>Category:</strong> ${cropInfo.category}</p>
                <p><strong>Growing Season:</strong> ${cropInfo.season}</p>
                <p><strong>Water Requirement:</strong> ${cropInfo.water}</p>
            </div>
            <div class="confidence-meter">
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: 85%"></div>
                </div>
                <span class="confidence-text">85% Confidence</span>
            </div>
        </div>
    `;
    
    resultDiv.classList.remove('loading-state');
    resultDiv.classList.add('success-state');
    
    // Animate confidence bar
    setTimeout(() => {
        const confidenceFill = resultDiv.querySelector('.confidence-fill');
        confidenceFill.style.width = '85%';
    }, 500);
}

// Show error message
function showError(message) {
    resultDiv.innerHTML = `
        <div class="error-result">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="error-title">Oops!</h3>
            <p class="error-message">${message}</p>
            <button class="retry-button" onclick="resetForm()">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
    
    resultDiv.classList.remove('loading-state');
    resultDiv.classList.add('error-state');
}

// Get crop emoji
function getCropEmoji(crop) {
    const emojiMap = {
        'rice': '🌾',
        'maize': '🌽',
        'chickpea': '🫘',
        'kidneybeans': '🫘',
        'pigeonpeas': '🫘',
        'mothbeans': '🫘',
        'mungbean': '🫘',
        'blackgram': '🫘',
        'lentil': '🫘',
        'pomegranate': '🍎',
        'banana': '🍌',
        'mango': '🥭',
        'grapes': '🍇',
        'watermelon': '🍉',
        'muskmelon': '🍈',
        'apple': '🍎',
        'orange': '🍊',
        'papaya': '🥭',
        'coconut': '🥥',
        'cotton': '🧶',
        'jute': '🧶',
        'coffee': '☕'
    };
    
    return emojiMap[crop.toLowerCase()] || '🌱';
}

// Get crop information
function getCropInfo(crop) {
    const cropInfo = {
        'rice': { category: 'Grains', season: 'Monsoon', water: 'High' },
        'maize': { category: 'Grains', season: 'Summer', water: 'Moderate' },
        'chickpea': { category: 'Pulses', season: 'Winter', water: 'Low' },
        'kidneybeans': { category: 'Pulses', season: 'Summer', water: 'Moderate' },
        'pigeonpeas': { category: 'Pulses', season: 'Monsoon', water: 'Low' },
        'mothbeans': { category: 'Pulses', season: 'Summer', water: 'Low' },
        'mungbean': { category: 'Pulses', season: 'Summer', water: 'Moderate' },
        'blackgram': { category: 'Pulses', season: 'Summer', water: 'Moderate' },
        'lentil': { category: 'Pulses', season: 'Winter', water: 'Low' },
        'pomegranate': { category: 'Fruits', season: 'Year-round', water: 'Moderate' },
        'banana': { category: 'Fruits', season: 'Year-round', water: 'High' },
        'mango': { category: 'Fruits', season: 'Summer', water: 'Moderate' },
        'grapes': { category: 'Fruits', season: 'Summer', water: 'Moderate' },
        'watermelon': { category: 'Fruits', season: 'Summer', water: 'High' },
        'muskmelon': { category: 'Fruits', season: 'Summer', water: 'High' },
        'apple': { category: 'Fruits', season: 'Autumn', water: 'Moderate' },
        'orange': { category: 'Fruits', season: 'Winter', water: 'Moderate' },
        'papaya': { category: 'Fruits', season: 'Year-round', water: 'High' },
        'coconut': { category: 'Others', season: 'Year-round', water: 'High' },
        'cotton': { category: 'Others', season: 'Summer', water: 'Moderate' },
        'jute': { category: 'Others', season: 'Monsoon', water: 'High' },
        'coffee': { category: 'Others', season: 'Year-round', water: 'Moderate' }
    };
    
    return cropInfo[crop.toLowerCase()] || { category: 'Unknown', season: 'Unknown', water: 'Unknown' };
}

// Reset form
function resetForm() {
    form.reset();
    resultDiv.innerHTML = `
        <div class="placeholder-result">
            <i class="fas fa-seedling"></i>
            <p>Enter soil parameters and click "Predict Crop" to get your recommendation</p>
        </div>
    `;
    resultDiv.classList.remove('loading-state', 'success-state', 'error-state');
}

// Input validation and formatting
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        
        if (value < min || value > max) {
            this.style.borderColor = 'var(--error-color)';
        } else {
            this.style.borderColor = 'var(--border-color)';
        }
    });
    
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Add CSS for new states
const style = document.createElement('style');
style.textContent = `
    .loading-container {
        text-align: center;
        padding: 2rem;
    }
    
    .loading {
        margin: 0 auto 1rem;
    }
    
    .loading-text {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .dots {
        animation: blink 1.5s infinite;
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
    
    .success-result {
        text-align: center;
        padding: 2rem;
    }
    
    .result-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .result-title {
        color: var(--success-color);
        margin-bottom: 0.5rem;
    }
    
    .crop-name {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 1.5rem;
    }
    
    .crop-info {
        text-align: left;
        background: var(--background-primary);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        margin-bottom: 1.5rem;
    }
    
    .crop-info p {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }
    
    .confidence-meter {
        margin-top: 1.5rem;
    }
    
    .confidence-bar {
        width: 100%;
        height: 8px;
        background: var(--border-color);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .confidence-fill {
        height: 100%;
        background: var(--gradient-success);
        width: 0;
        transition: width 1s ease-out;
    }
    
    .confidence-text {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
    
    .error-result {
        text-align: center;
        padding: 2rem;
    }
    
    .error-icon {
        font-size: 3rem;
        color: var(--error-color);
        margin-bottom: 1rem;
    }
    
    .error-title {
        color: var(--error-color);
        margin-bottom: 0.5rem;
    }
    
    .error-message {
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
    }
    
    .retry-button {
        background: var(--gradient-primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        transition: var(--transition);
    }
    
    .retry-button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .form-group.focused label {
        color: var(--primary-color);
    }
    
    .form-group.focused input {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`;

document.head.appendChild(style);

// Initialize placeholder result
resetForm();

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Add hover effects to cards
document.querySelectorAll('.dataset-card, .floating-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

console.log('SmartCrop Prediction System initialized successfully! 🚀'); 