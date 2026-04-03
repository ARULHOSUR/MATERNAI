#  MATERNAI – AI Maternal Risk Prediction System

 An intelligent healthcare system that predicts maternal risk using AI and provides early warnings for safer pregnancies.

---

##  Live Demo


---

##  Features

*  AI-based maternal risk prediction (CatBoost)
* OCR system to extract data from medical reports
*  Instant risk classification (Low / Medium / High)
*  Smart health insights & recommendations
*  Modern responsive UI (React + Tailwind)
*  Fast and user-friendly workflow

---

##  Tech Stack

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** Python (Flask)
* **Machine Learning:** CatBoost
* **OCR:** Tesseract / EasyOCR

---

##  Project Structure

```bash
MATERNAI/
│── backend/
│   ├── app.py
│   ├── model.pkl
│   ├── ocr.py
│   └── requirements.txt
│
│── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── package.json
│
│── assets/
│   ├── home.png
│   ├── prediction.png
│   └── result.png
│
│── README.md
```

---

##  Installation & Setup

### 🔹 1. Clone Repository

```bash
git clone https://github.com/ARULHOSUR/MATERNAI.git
cd MATERNAI
```

---

### 🔹 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 🔹 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

##  How to Use

1. Open the web app in browser
2. Enter patient details:

   * Age
   * Blood Pressure
   * Glucose Level
   * Other medical inputs
3. (Optional) Upload medical reports
4. Click **Predict Risk**
5. View:

   * Risk Level (Low / Medium / High)
   * AI insights
   * Recommendations

---

##  Demonstration Steps

### 🔹 Step 1: Introduction

Explain the problem:

* Maternal risks are often detected late
* Lack of early diagnosis tools

---

### 🔹 Step 2: Show UI

* Open homepage
* Highlight:

  * Clean design
  * Input form
  * Upload option

---

### 🔹 Step 3: Input Sample Data

Example:

* Age: 28
* Blood Pressure: High
* Glucose: Normal

---

### 🔹 Step 4: OCR Feature

* Upload sample medical report
* Show automatic text extraction

---

### 🔹 Step 5: Prediction

* Click **Predict Risk**
* Show:

  * Risk category
  * Output result

---

### 🔹 Step 6: AI Explanation

* Model used: CatBoost
* Handles tabular medical data effectively
* Provides accurate predictions

---

### 🔹 Step 7: Impact

* Enables early detection
* Supports doctors
* Saves lives

---

## Demo Script (Quick Presentation)

"Maternal health risks are a serious issue, especially when detected late.
Our system, MATERNAI, uses AI to predict risk levels based on patient data and medical reports.

Here, we input patient details and optionally upload a report.
With a single click, the system predicts whether the risk is low, medium, or high.

This enables early intervention and improves maternal healthcare outcomes."

---

##  UI Preview

(Add screenshots in assets folder)

```md
![Home](assets/home.png)
![Prediction](assets/prediction.png)
![Result](assets/result.png)
```

---

##  Deployment

###  Frontend (Vercel)

* Import GitHub repo
* Select `frontend` as root
* Deploy

---

###  Backend (Render)

* Create Web Service
* Root: `backend`
* Build:

```bash
pip install -r requirements.txt
```

* Start:

```bash
python app.py
```

---

## 🔗 API Connection

Update frontend API URL:

```js
const API = "https://your-backend-url.onrender.com";
```

---

##  Future Enhancements

*  Mobile application
*  Doctor dashboard
*  Advanced analytics (SHAP visualization)
*  Integration with disaster response systems
*  Real-time monitoring

---

##  Author

**ARUL HOSUR**

---


