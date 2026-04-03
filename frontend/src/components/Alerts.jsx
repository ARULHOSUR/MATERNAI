import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, MapPin, Phone, Clock, CheckCircle, XCircle, Filter, X, Calendar, User, Activity } from 'lucide-react'

const mockAlerts = [
  { id: 1, patient: 'Maria Garcia', time: '2 hours ago', severity: 'critical', message: 'High risk assessment detected - Immediate action required', resolved: false, age: 35, weeks: 32, bp: '158/98', sugar: 165, heart_rate: 95, temp: 100.2 },
  { id: 2, patient: 'Emily Davis', time: '5 hours ago', severity: 'warning', message: 'Elevated blood pressure readings', resolved: false, age: 32, weeks: 28, bp: '138/88', sugar: 142, heart_rate: 82, temp: 98.8 },
  { id: 3, patient: 'Sarah Johnson', time: '1 day ago', severity: 'info', message: 'Follow-up appointment reminder', resolved: true, age: 28, weeks: 24, bp: '118/78', sugar: 95, heart_rate: 72, temp: 98.4 },
  { id: 4, patient: 'Lisa Chen', time: '2 days ago', severity: 'warning', message: 'Abnormal blood sugar levels detected', resolved: false, age: 26, weeks: 20, bp: '115/75', sugar: 180, heart_rate: 68, temp: 98.2 },
]

const indianHospitals = [
  { name: 'Government Mohan Kumaramangalam Medical College', distance: '2.3 km', address: 'Steel Road, Salem, Tamil Nadu', phone: '+91 427 231 500', available: true, type: 'Government Medical College' },
  { name: 'Vijay Marie Hospital', distance: '4.1 km', address: 'Cherry Road, Near Clock Tower, Salem', phone: '+91 427 231 200', available: true, type: 'Multi-Specialty Hospital' },
  { name: 'Smt. Kannamal Memorial Hospital', distance: '6.8 km', address: 'Fort Main Road, Salem', phone: '+91 427 233 100', available: true, type: 'Women & Child Hospital' },
  { name: 'Manipal Hospital', distance: '8.5 km', address: 'Bengaluru Highway, Salem', phone: '+91 427 244 500', available: true, type: 'Super Speciality Hospital' },
  { name: 'Ashoka Hospital', distance: '12.2 km', address: 'OMR Road, Chengam', phone: '+91 434 222 100', available: false, type: 'General Hospital' },
]

export default function Alerts() {
  const [filter, setFilter] = useState('all')
  const [alerts, setAlerts] = useState(mockAlerts)
  const [selectedAlert, setSelectedAlert] = useState(null)

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unresolved') return !alert.resolved
    return alert.severity === filter
  })

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const handleMarkResolved = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
  }

  const closeModal = () => {
    setSelectedAlert(null)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Alerts</span>
          </h1>
          <p className="text-gray-400">Monitor and manage patient alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <span className="text-sm text-gray-400">{alerts.filter(a => !a.resolved).length} active alerts</span>
        </div>
      </motion.div>

      <div className="flex gap-2">
        {['all', 'unresolved', 'critical', 'warning'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'glass hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'All Alerts' : f === 'unresolved' ? 'Unresolved' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Recent Alerts
          </h3>
          
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card rounded-2xl p-5 border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              } ${alert.resolved ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getSeverityStyle(alert.severity)}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{alert.patient}</h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityStyle(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">{alert.message}</p>
              
              <div className="flex gap-2">
                {!alert.resolved && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMarkResolved(alert.id)}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Resolved
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewDetails(alert)}
                  className="px-4 py-2 glass hover:bg-white/10 rounded-xl"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Emergency Resources (Salem, Tamil Nadu)
          </h3>
          
          <div className="glass-card rounded-2xl p-6">
            <p className="text-gray-400 mb-6">Nearest hospitals and clinics for emergency care</p>
            
            <div className="space-y-4">
              {indianHospitals.map((hospital, index) => (
                <motion.div
                  key={hospital.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-4 rounded-xl ${hospital.available ? 'bg-white/5' : 'bg-white/5 opacity-50'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{hospital.name}</h4>
                      <p className="text-xs text-gray-400">{hospital.type}</p>
                    </div>
                    <span className={`text-sm ${hospital.available ? 'text-green-400' : 'text-gray-400'}`}>
                      {hospital.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {hospital.address}
                  </p>
                  <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {hospital.phone}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cyan-400">{hospital.distance}</span>
                    {hospital.available && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`, '_blank')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:bg-maternal-violet rounded-xl text-sm font-medium"
                      >
                        Get Directions
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-6 bg-gradient-to-br from-red-500/20 to-orange-500/10"
          >
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-400" />
              Emergency Hotline
            </h4>
            <p className="text-3xl font-bold text-red-400 mb-4">0444 631 4300</p>
            <p className="text-sm text-gray-400">
              For immediate assistance with pregnancy-related emergencies, available 24/7
            </p>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="w-6 h-6 text-cyan-400" />
                  Alert Details
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Patient Name</p>
                    <p className="font-semibold text-lg">{selectedAlert.patient}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Time</p>
                    <p className="font-semibold text-lg">{selectedAlert.time}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Age</p>
                    <p className="font-semibold text-lg">{selectedAlert.age} years</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Pregnancy Weeks</p>
                    <p className="font-semibold text-lg">{selectedAlert.weeks} weeks</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-sm mb-2">Severity</p>
                  <span className={`px-4 py-2 rounded-full text-lg font-medium ${getSeverityStyle(selectedAlert.severity)}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Blood Pressure</p>
                    <p className="font-semibold text-xl">{selectedAlert.bp} mmHg</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Blood Sugar</p>
                    <p className="font-semibold text-xl">{selectedAlert.sugar} mg/dL</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Heart Rate</p>
                    <p className="font-semibold text-xl">{selectedAlert.heart_rate} bpm</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-gray-400 text-sm">Body Temperature</p>
                    <p className="font-semibold text-xl">{selectedAlert.temp}°F</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-sm mb-2">Alert Message</p>
                  <p className="text-lg">{selectedAlert.message}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  {!selectedAlert.resolved && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { handleMarkResolved(selectedAlert.id); closeModal(); }}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Resolved
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=hospital+near+Salem+Tamil+Nadu`, '_blank')}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:bg-maternal-violet rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-5 h-5" />
                    Find Hospital
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
