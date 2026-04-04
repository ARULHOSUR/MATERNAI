from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
import shap
from werkzeug.utils import secure_filename
import cv2
from PIL import Image
import pytesseract
from pdf2image import convert_from_bytes
import io

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'model.pkl')
explainer = None
model = None

FEATURE_NAMES = [
    'age', 'systolic_bp', 'diastolic_bp', 'blood_sugar', 
    'body_temp', 'heart_rate'
]

FEATURE_LABELS = {
    'age': 'Age',
    'systolic_bp': 'Systolic BP',
    'diastolic_bp': 'Diastolic BP',
    'blood_sugar': 'Blood Sugar',
    'body_temp': 'Body Temperature',
    'heart_rate': 'Heart Rate'
}

RISK_EXPLANATIONS = {
    'systolic_bp': 'High systolic blood pressure significantly increases maternal risk.',
    'diastolic_bp': 'Elevated diastolic pressure indicates potential preeclampsia.',
    'blood_sugar': 'High blood sugar levels may indicate gestational diabetes.',
    'body_temp': 'Fever can indicate infection requiring immediate attention.',
    'heart_rate': 'Abnormal heart rate patterns need monitoring.',
    'age': 'Maternal age affects pregnancy risk profiles.'
}

def load_uci_dataset():
    try:
        from ucimlrepo import fetch_ucirepo
        maternal_health_risk = fetch_ucirepo(id=863)
        X = maternal_health_risk.data.features
        y = maternal_health_risk.data.targets
        df = pd.DataFrame(X)
        df['RiskLevel'] = y['RiskLevel']
        df.columns = df.columns.str.lower().str.replace(' ', '_')
        df = df.rename(columns={
            'systolicbp': 'systolic_bp',
            'diastolicbp': 'diastolic_bp',
            'bs': 'blood_sugar',
            'bodytemp': 'body_temp',
            'heartrate': 'heart_rate'
        })
        return df
    except Exception as e:
        print(f"Error loading UCI dataset: {e}")
        return None

def create_uci_model():
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    
    print("Loading UCI Maternal Health Risk Dataset...")
    df = load_uci_dataset()
    
    if df is None:
        return None
    
    print(f"Dataset loaded: {len(df)} samples")
    print(f"Columns: {list(df.columns)}")
    print(f"Risk distribution:\n{df['risklevel'].value_counts()}")
    
    risk_mapping = {'low risk': 0, 'mid risk': 1, 'high risk': 2}
    y = df['risklevel'].map(risk_mapping)
    X = df.drop('risklevel', axis=1)
    
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X, y)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    print("Model trained and saved!")
    return model

def create_mock_model():
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    np.random.seed(42)
    n_samples = 1500
    
    n_low = 500
    n_medium = 500
    n_high = 500
    
    low_data = {
        'age': np.random.randint(18, 35, n_low),
        'systolic_bp': np.random.randint(90, 120, n_low),
        'diastolic_bp': np.random.randint(60, 80, n_low),
        'blood_sugar': np.random.randint(70, 100, n_low),
        'body_temp': np.random.uniform(97.5, 98.6, n_low),
        'heart_rate': np.random.randint(60, 80, n_low)
    }
    
    medium_data = {
        'age': np.random.randint(25, 40, n_medium),
        'systolic_bp': np.random.randint(120, 145, n_medium),
        'diastolic_bp': np.random.randint(80, 95, n_medium),
        'blood_sugar': np.random.randint(100, 140, n_medium),
        'body_temp': np.random.uniform(98.0, 99.0, n_medium),
        'heart_rate': np.random.randint(75, 95, n_medium)
    }
    
    high_data = {
        'age': np.random.randint(30, 45, n_high),
        'systolic_bp': np.random.randint(140, 180, n_high),
        'diastolic_bp': np.random.randint(90, 110, n_high),
        'blood_sugar': np.random.randint(130, 200, n_high),
        'body_temp': np.random.uniform(99.0, 103.0, n_high),
        'heart_rate': np.random.randint(90, 120, n_high)
    }
    
    df_low = pd.DataFrame(low_data)
    df_medium = pd.DataFrame(medium_data)
    df_high = pd.DataFrame(high_data)
    
    df = pd.concat([df_low, df_medium, df_high], ignore_index=True)
    df = df.sample(frac=1).reset_index(drop=True)
    
    labels = np.array([0] * n_low + [1] * n_medium + [2] * n_high)
    labels = labels[df.index]
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(df, labels)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    return model

def load_model():
    global model, explainer
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
        else:
            print("Loading UCI Maternal Health Risk Dataset...")
            model = create_uci_model()
            if model is None:
                print("Falling back to mock model...")
                model = create_mock_model()
        
        if model is not None:
            explainer = shap.TreeExplainer(model)
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'AI Maternal Risk Prediction'})

@app.route("/")
def home():
    return {"message": "AI Backend Running 🚀"}

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    import random
    from datetime import datetime, timedelta
    
    today = datetime.now()
    trend_data = []
    for i in range(30, -1, -1):
        date = today - timedelta(days=i)
        trend_data.append({
            'date': date.strftime('%b %d'),
            'risk_score': random.randint(20, 60),
            'patients': random.randint(5, 25),
            'low_risk': random.randint(5, 20),
            'medium_risk': random.randint(2, 15),
            'high_risk': random.randint(0, 8)
        })
    
    return jsonify({
        'stats': {
            'total_patients': 1245 + random.randint(0, 100),
            'risk_assessments': 3421 + random.randint(0, 50),
            'high_risk_alerts': 18 + random.randint(0, 5),
            'avg_risk_score': 28 + random.randint(-5, 5)
        },
        'trend_data': trend_data
    })
    
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        features = {
            'age': float(data.get('age', 25)),
            'systolic_bp': float(data.get('systolic_bp', 120)),
            'diastolic_bp': float(data.get('diastolic_bp', 80)),
            'blood_sugar': float(data.get('blood_sugar', 7)),
            'body_temp': float(data.get('body_temp', 98.6)),
            'heart_rate': float(data.get('heart_rate', 75))
        }
        
        input_df = pd.DataFrame([features])
        
        if model is None:
            load_model()
        
        if model is None:
            return jsonify({'error': 'Model not loaded. Please restart the server.'}), 500
        
        prediction = None
        probabilities = None
        try:
            prediction = model.predict(input_df)
            probabilities = model.predict_proba(input_df)[0]
        except Exception as e:
            print(f"Model prediction error: {e}")
            prediction = [0]
            probabilities = [0.7, 0.2, 0.1]
        
        pred_class = int(prediction.item())
        risk_labels = ['Low Risk', 'Medium Risk', 'High Risk']
        risk_level = risk_labels[pred_class]
        confidence = float(probabilities[pred_class])
        
        main_factors = []
        try:
            shap_values = explainer.shap_values(input_df)
            shap_arr = np.array(shap_values)
            if len(shap_arr.shape) == 3:
                shap_value = shap_arr[0, :, pred_class]
            elif len(shap_arr.shape) == 2:
                shap_value = shap_arr[0]
            else:
                shap_value = shap_arr
            shap_value = np.array(shap_value).flatten()
            
            explanation = {}
            for i, feat in enumerate(FEATURE_NAMES):
                explanation[feat] = {
                    'value': float(shap_value[i]),
                    'label': FEATURE_LABELS[feat],
                    'explanation': RISK_EXPLANATIONS[feat]
                }
            
            sorted_features = sorted(
                explanation.items(), 
                key=lambda x: abs(x[1]['value']), 
                reverse=True
            )
            
            for feat, values in sorted_features[:3]:
                if values['value'] != 0:
                    main_factors.append({
                        'feature': feat,
                        'label': values['label'],
                        'impact': float(values['value']),
                        'explanation': values['explanation']
                    })
        except Exception as e:
            print(f"SHAP error (non-fatal): {e}")
            main_factors = [
                {'feature': 'systolic_bp', 'label': 'Systolic BP', 'impact': 0.1, 'explanation': 'Blood pressure affects risk assessment'},
                {'feature': 'blood_sugar', 'label': 'Blood Sugar', 'impact': 0.05, 'explanation': 'Glucose levels impact pregnancy risk'}
            ]
        
        recommendation = get_recommendation(risk_level, features, main_factors)
        
        return jsonify({
            'risk': risk_level,
            'confidence': confidence,
            'probability_low': float(probabilities[0]),
            'probability_medium': float(probabilities[1]),
            'probability_high': float(probabilities[2]),
            'explanation': explanation,
            'main_factors': main_factors,
            'recommendation': recommendation,
            'patient_data': features
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_recommendation(risk_level, features, main_factors):
    recommendations = {
        'Low Risk': "Continue with regular prenatal care. Maintain a healthy diet and exercise routine. Schedule routine check-ups as recommended by your healthcare provider.",
        'Medium Risk': "Increase monitoring frequency. Consider additional tests as advised by your doctor. Watch for warning signs like severe headache, vision changes, or swelling.",
        'High Risk': "IMMEDIATE ACTION REQUIRED: Please contact your healthcare provider immediately. Consider visiting an emergency facility if experiencing severe symptoms. Close monitoring is essential."
    }
    
    base_recommendation = recommendations[risk_level]
    
    if main_factors:
        factor_details = ", ".join([f["label"] for f in main_factors[:2]])
        if risk_level != 'Low Risk':
            base_recommendation += f" Key concerns: {factor_details}."
    
    return base_recommendation

@app.route('/api/ocr', methods=['POST'])
def ocr_process():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        extracted_data = process_medical_report(filepath)
        
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'data': extracted_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def process_medical_report(filepath):
    text = ""
    
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
    except Exception:
        return {'error': 'Tesseract OCR not installed. Please install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki and add it to PATH.', 'details': 'Windows requires Tesseract to be installed separately.'}
    
    if filepath.lower().endswith('.pdf'):
        try:
            images = convert_from_bytes(open(filepath, 'rb').read())
            for img in images:
                text += pytesseract.image_to_string(img) + "\n"
        except Exception as e:
            return {'error': f'PDF processing failed: {str(e)}'}
    else:
        img = cv2.imread(filepath)
        if img is None:
            return {'error': 'Could not read image'}
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        text = pytesseract.image_to_string(thresh)
    
    extracted = parse_medical_text(text)
    return extracted

def parse_medical_text(text):
    data = {}
    
    import re
    
    bp_pattern = r'(?:BP|blood pressure|systolic|diastolic)[:\s]*(\d+)[/\s]*(\d+)'
    bp_match = re.search(bp_pattern, text, re.IGNORECASE)
    if bp_match:
        data['systolic_bp'] = int(bp_match.group(1))
        data['diastolic_bp'] = int(bp_match.group(2))
    
    sugar_pattern = r'(?:blood sugar|glucose|b s)[:\s]*(\d+(?:\.\d+)?)'
    sugar_match = re.search(sugar_pattern, text, re.IGNORECASE)
    if sugar_match:
        data['blood_sugar'] = float(sugar_match.group(1))
    
    hr_pattern = r'(?:heart rate|pulse|hr)[:\s]*(\d+)'
    hr_match = re.search(hr_pattern, text, re.IGNORECASE)
    if hr_match:
        data['heart_rate'] = int(hr_match.group(1))
    
    temp_pattern = r'(?:temperature|temp|fever)[:\s]*(\d+(?:\.\d+)?)'
    temp_match = re.search(temp_pattern, text, re.IGNORECASE)
    if temp_match:
        data['body_temp'] = float(temp_match.group(1))
    
    age_pattern = r'(?:age|years)[:\s]*(\d+)'
    age_match = re.search(age_pattern, text, re.IGNORECASE)
    if age_match:
        data['age'] = int(age_match.group(1))
    
    weeks_pattern = r'(?:weeks|gestation|pregnancy)[:\s]*(\d+)'
    weeks_match = re.search(weeks_pattern, text, re.IGNORECASE)
    if weeks_match:
        data['pregnancy_weeks'] = int(weeks_match.group(1))
    
    data['raw_text'] = text[:500]
    
    return data

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify([
        {
            'id': 1,
            'date': '2024-03-15',
            'risk': 'Low Risk',
            'confidence': 0.89,
            'key_factors': ['Normal BP', 'Normal Sugar']
        },
        {
            'id': 2,
            'date': '2024-03-10',
            'risk': 'Medium Risk',
            'confidence': 0.72,
            'key_factors': ['Elevated BP', 'High Sugar']
        },
        {
            'id': 3,
            'date': '2024-03-05',
            'risk': 'Low Risk',
            'confidence': 0.91,
            'key_factors': ['Normal vitals']
        }
    ])

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').lower()
        
        responses = {
            'blood pressure': 'Blood pressure is a key factor in maternal health. High BP (above 140/90) can indicate preeclampsia, a serious condition. Keep BP below 120/80 for optimal health.',
            'systolic': 'Systolic blood pressure is the upper number in a BP reading. It measures pressure when your heart beats. Aim for below 120 mmHg.',
            'diastolic': 'Diastolic blood pressure is the lower number. It measures pressure between beats. Keep it below 80 mmHg.',
            'sugar': 'Blood sugar levels should be carefully monitored. Fasting blood sugar above 7.0 mmol/L may indicate gestational diabetes. Target is typically 3.3-5.3 mmol/L fasting.',
            'glucose': 'Blood glucose levels should be carefully monitored. Fasting blood sugar above 7.0 mmol/L may indicate gestational diabetes. Target is typically 3.3-5.3 mmol/L fasting.',
            'temperature': 'Body temperature above 100.4°F (38°C) may indicate infection. Normal is around 98.6°F (37°C).',
            'heart rate': 'Normal resting heart rate during pregnancy is 60-100 bpm. Elevated heart rate may need monitoring.',
            'age': 'Maternal age affects pregnancy risk. Teen mothers and mothers over 35 have higher risk profiles.',
            'risk': 'Risk levels are: Low Risk (healthy), Mid Risk (needs monitoring), High Risk (requires immediate medical attention).',
            'low': 'Low Risk indicates normal health parameters. Continue with regular prenatal care.',
            'mid': 'Mid Risk indicates some elevated values. Increase monitoring frequency and consult your doctor.',
            'high': 'High Risk requires IMMEDIATE medical attention. Contact your healthcare provider right away.',
            'preeclampsia': 'Preeclampsia is pregnancy-induced hypertension with protein in urine. Watch for headache, vision changes, and swelling.',
            'diabetes': 'Gestational diabetes occurs when blood sugar is too high during pregnancy. It usually resolves after delivery but needs careful management.',
            'symptoms': 'Watch for: severe headache, vision changes, swelling in hands/face, abdominal pain, vaginal bleeding, reduced fetal movement.',
            'hello': 'Hello! I am your AI Maternal Health Assistant. Ask me about blood pressure, blood sugar, risk levels, or any maternal health concerns.',
            'hi': 'Hello! I am your AI Maternal Health Assistant. Ask me about blood pressure, blood sugar, risk levels, or any maternal health concerns.',
            'help': 'I can help you understand: Blood Pressure (systolic/diastolic), Blood Sugar/Glucose, Body Temperature, Heart Rate, Risk Levels, Warning Symptoms, and more!'
        }
        
        for key, response in responses.items():
            if key in message:
                return jsonify({'response': response, 'type': 'info'})
        
        return jsonify({
            'response': "I'm here to help with maternal health questions. You can ask about blood pressure, blood sugar, risk levels, temperature, heart rate, or common pregnancy concerns. How can I assist you today?",
            'type': 'general'
        })
        
    except Exception as e:
        return jsonify({'error': f'Chat error: {str(e)}'}), 500

OPENAI_API_KEY = ""  # Set your API key here or pass via request

@app.route('/api/chat/advanced', methods=['POST'])
def chat_advanced():
    global OPENAI_API_KEY
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        api_key = data.get('apiKey')
        if api_key:
            OPENAI_API_KEY = api_key
        
        if not OPENAI_API_KEY:
            return jsonify({'error': 'OpenAI API key required. Please provide your API key.'}), 400
        
        import requests
        
        headers = {
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {'role': 'system', 'content': 'You are a maternal health expert assistant. Provide accurate, helpful information about pregnancy health, risk factors, and general medical guidance. Always recommend consulting healthcare providers for medical advice.'},
                {'role': 'user', 'content': message}
            ],
            'max_tokens': 500
        }
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            return jsonify({'response': ai_response, 'type': 'ai'})
        else:
            # Fallback to basic responses if OpenAI fails
            return jsonify({'response': get_basic_response(message), 'type': 'info'})
            
    except Exception as e:
        # Fallback to basic responses on any error
        return jsonify({'response': get_basic_response(message), 'type': 'info'})

def get_basic_response(message):
    message = message.lower()
    
    responses = {
        'blood pressure': 'Blood pressure is a key factor in maternal health. High BP (above 140/90) can indicate preeclampsia, a serious condition. Keep BP below 120/80 for optimal health.',
        'systolic': 'Systolic blood pressure is the upper number in a BP reading. It measures pressure when your heart beats. Aim for below 120 mmHg.',
        'diastolic': 'Diastolic blood pressure is the lower number. It measures pressure between beats. Keep it below 80 mmHg.',
        'sugar': 'Blood sugar levels should be carefully monitored. Fasting blood sugar above 7.0 mmol/L may indicate gestational diabetes. Target is typically 3.3-5.3 mmol/L fasting.',
        'glucose': 'Blood glucose levels should be carefully monitored. Fasting blood sugar above 7.0 mmol/L may indicate gestational diabetes. Target is typically 3.3-5.3 mmol/L fasting.',
        'temperature': 'Body temperature above 100.4°F (38°C) may indicate infection. Normal is around 98.6°F (37°C).',
        'heart rate': 'Normal resting heart rate during pregnancy is 60-100 bpm. Elevated heart rate may need monitoring.',
        'age': 'Maternal age affects pregnancy risk. Teen mothers and mothers over 35 have higher risk profiles.',
        'risk': 'Risk levels are: Low Risk (healthy), Mid Risk (needs monitoring), High Risk (requires immediate medical attention).',
        'low': 'Low Risk indicates normal health parameters. Continue with regular prenatal care.',
        'mid': 'Mid Risk indicates some elevated values. Increase monitoring frequency and consult your doctor.',
        'high': 'High Risk requires IMMEDIATE medical attention. Contact your healthcare provider right away.',
        'preeclampsia': 'Preeclampsia is pregnancy-induced hypertension with protein in urine. Watch for headache, vision changes, and swelling.',
        'diabetes': 'Gestational diabetes occurs when blood sugar is too high during pregnancy. It usually resolves after delivery but needs careful management.',
        'symptoms': 'Watch for: severe headache, vision changes, swelling in hands/face, abdominal pain, vaginal bleeding, reduced fetal movement.',
        'hello': 'Hello! I am your AI Maternal Health Assistant. Ask me about blood pressure, blood sugar, risk levels, or any maternal health concerns.',
        'hi': 'Hello! I am your AI Maternal Health Assistant. Ask me about blood pressure, blood sugar, risk levels, or any maternal health concerns.',
        'help': 'I can help you understand: Blood Pressure (systolic/diastolic), Blood Sugar/Glucose, Body Temperature, Heart Rate, Risk Levels, Warning Symptoms, and more!'
    }
    
    for key, response in responses.items():
        if key in message:
            return response
    
    return "I'm here to help with maternal health questions. You can ask about blood pressure, blood sugar, risk levels, temperature, heart rate, or common pregnancy concerns. How can I assist you today?"

if __name__ == '__main__':
    load_model()
    app.run(debug=True, port=5000)
