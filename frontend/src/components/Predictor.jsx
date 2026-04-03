import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Activity, 
  Droplets, 
  Thermometer, 
  Heart,
  Calendar,
  Upload,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import SHAPChart from './SHAPChart'
import ResultCard from './ResultCard'

const symptoms = [
  { id: 'headache', label: 'Severe Headache', icon: '🤕' },
  { id: 'vision', label: 'Vision Changes', icon: '👁️' },
  { id: 'swelling', label: 'Swelling', icon: '🦶' },
  { id: 'pain', label: 'Abdominal Pain', icon: '😣' },
  { id: 'bleeding', label: 'Vaginal Bleeding', icon: '🩸' },
  { id: 'nausea', label: 'Severe Nausea', icon: '🤢' },
  { id: 'fatigue', label: 'Extreme Fatigue', icon: '😴' },
  { id: 'breathing', label: 'Shortness of Breath', icon: '😮' },
]

export default function Predictor({ result, setResult, setShowAlert }) {
  const [formData, setFormData] = useState({
    patient_name: '',
    age: 25,
    pregnancy_weeks: 20,
    systolic_bp: 120,
    diastolic_bp: 80,
    blood_sugar: 7,
    body_temp: 98.6,
    heart_rate: 75,
    selectedSymptoms: []
  })
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setOcrLoading(true)
      setShowResult(false)
      setResult(null)
      
      const formDataFile = new FormData()
      formDataFile.append('file', file)
      
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formDataFile
        })
        const data = await response.json()
        
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...data.data
          }))
          alert('Medical report scanned successfully! Data extracted. Click Predict to analyze.')
        } else if (data.error) {
          alert('OCR Error: ' + data.error + '. Please enter data manually.')
        } else {
          alert('Could not extract data from document. Please enter data manually.')
        }
      } catch (error) {
        console.error('OCR Error:', error)
        alert('Failed to process document. Please enter data manually.')
      } finally {
        setOcrLoading(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const handleSymptomToggle = (symptomId) => {
    setFormData(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter(id => id !== symptomId)
        : [...prev.selectedSymptoms, symptomId]
    }))
  }

  const handlePredict = async () => {
    setLoading(true)
    setShowResult(false)
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          age: formData.age,
          pregnancy_weeks: formData.pregnancy_weeks,
          systolic_bp: formData.systolic_bp,
          diastolic_bp: formData.diastolic_bp,
          blood_sugar: formData.blood_sugar,
          body_temp: formData.body_temp,
          heart_rate: formData.heart_rate
        })
      })
      const data = await response.json()
      setResult(data)
      setShowResult(true)
    } catch (error) {
      console.error('Prediction Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Risk Assessment</span>
        </h1>
        <p className="text-gray-400">Enter patient data or upload medical reports for AI-powered analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-maternal-pink" />
              Patient Information
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Patient Name</label>
                <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                    placeholder="Enter patient name"
                    className="bg-transparent w-full outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Age</label>
                  <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                      className="bg-transparent w-full outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Pregnancy Weeks</label>
                  <div className="glass-input rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-maternal-pink">{formData.pregnancy_weeks}</span>
                      <span className="text-sm text-gray-400">weeks</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="42"
                      value={formData.pregnancy_weeks}
                      onChange={(e) => setFormData({...formData, pregnancy_weeks: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-maternal-purple" />
              Health Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  Systolic BP <span className="tooltip" data-tooltip="Upper blood pressure number">ⓘ</span>
                </label>
                <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-red-400" />
                  <input
                    type="number"
                    value={formData.systolic_bp}
                    onChange={(e) => setFormData({...formData, systolic_bp: parseInt(e.target.value)})}
                    className="bg-transparent w-full outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  Diastolic BP <span className="tooltip" data-tooltip="Lower blood pressure number">ⓘ</span>
                </label>
                <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <input
                    type="number"
                    value={formData.diastolic_bp}
                    onChange={(e) => setFormData({...formData, diastolic_bp: parseInt(e.target.value)})}
                    className="bg-transparent w-full outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  Blood Sugar <span className="tooltip" data-tooltip="mg/dL">ⓘ</span>
                </label>
                <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-yellow-400" />
                  <input
                    type="number"
                    value={formData.blood_sugar}
                    onChange={(e) => setFormData({...formData, blood_sugar: parseInt(e.target.value)})}
                    className="bg-transparent w-full outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  Heart Rate <span className="tooltip" data-tooltip="Beats per minute">ⓘ</span>
                </label>
                <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({...formData, heart_rate: parseInt(e.target.value)})}
                    className="bg-transparent w-full outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-gray-400">Body Temperature (°F)</label>
                <div className="glass-input rounded-xl px-4 py-3 flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.body_temp}
                    onChange={(e) => setFormData({...formData, body_temp: parseFloat(e.target.value)})}
                    className="bg-transparent w-full outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Symptoms
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {symptoms.map((symptom) => (
                <motion.button
                  key={symptom.id}
                  onClick={() => handleSymptomToggle(symptom.id)}
                  className={`symptom-chip p-3 rounded-xl text-left flex items-center gap-2 ${
                    formData.selectedSymptoms.includes(symptom.id)
                      ? 'selected'
                      : 'glass hover:bg-white/10'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{symptom.icon}</span>
                  <span className="text-sm">{symptom.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <motion.div
            {...getRootProps()}
            className={`drop-zone glass-card rounded-2xl p-8 text-center cursor-pointer ${
              isDragActive ? 'active' : ''
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: [1, 1.2, 1] } : {}}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-maternal-pink to-maternal-purple flex items-center justify-center"
            >
              <Upload className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? 'Drop here!' : 'Upload Medical Report'}
            </h3>
            <p className="text-gray-400 mb-4">
              Drag & drop or click to upload PDF or image
            </p>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-3 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-maternal-pink" />
                <span>{uploadedFile.name}</span>
              </motion.div>
            )}
            {ocrLoading && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="loading-spinner w-5 h-5" />
                <span className="text-gray-400">Processing with OCR...</span>
              </div>
            )}
          </motion.div>

          <motion.button
            onClick={handlePredict}
            disabled={loading}
            className="w-full btn-gradient py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="loading-spinner w-6 h-6" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Predict Risk
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {showResult && result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ResultCard result={result} />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-maternal-purple" />
                    AI Explanation (SHAP)
                  </h3>
                  <SHAPChart data={result} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
