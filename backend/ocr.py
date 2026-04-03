import cv2
import pytesseract
import numpy as np
from PIL import Image

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    kernel = np.ones((1, 1), np.uint8)
    processed = cv2.dilate(denoised, kernel, iterations=1)
    processed = cv2.erode(processed, kernel, iterations=1)
    
    return processed

def extract_text(image_path):
    processed = preprocess_image(image_path)
    if processed is None:
        return ""
    
    text = pytesseract.image_to_string(processed)
    return text

def extract_medical_data(text):
    import re
    
    data = {}
    
    bp_pattern = r'(?:BP|blood pressure|systolic|diastolic)[:\s]*(\d+)[/\s]*(\d+)'
    bp_match = re.search(bp_pattern, text, re.IGNORECASE)
    if bp_match:
        data['systolic_bp'] = int(bp_match.group(1))
        data['diastolic_bp'] = int(bp_match.group(2))
    
    sugar_pattern = r'(?:blood sugar|glucose|b s|glucose)[:\s]*(\d+(?:\.\d+)?)'
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
    
    return data
