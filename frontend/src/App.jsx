import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Predictor from './components/Predictor'
import Reports from './components/Reports'
import Alerts from './components/Alerts'
import Particles from './components/Particles'
import ChatAssistant from './components/ChatAssistant'
import { MapPin, X } from 'lucide-react'

const API_URL = "https://maternai-production.up.railway.app";

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [result, setResult] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [showHospitals, setShowHospitals] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [nearbyHospitals, setNearbyHospitals] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)

  const openHospitalsSearch = () => {
    const url = `https://www.google.com/maps/search/hospitals+near+me/`
    window.open(url, '_blank')
  }

  const openInGoogleMaps = (hospital) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name)}`
    window.open(url, '_blank')
  }

  const handleFindHospitals = async () => {
    setShowHospitals(true)
    setNearbyHospitals([])
    setUserLocation(null)
    setLocationLoading(true)
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Searching general hospitals...")
      window.open('https://www.google.com/maps/search/hospitals+near+me/', '_blank')
      setLocationLoading(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(loc)
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=8&lat=${loc.lat}&lon=${loc.lng}`
          )
          const data = await response.json()
          
          if (data && data.length > 0) {
            const hospitalsWithDistance = data.map(h => {
              const dist = calculateDistance(
                loc.lat, loc.lng,
                parseFloat(h.lat), parseFloat(h.lon)
              )
              return {
                name: h.display_name.split(',')[0],
                address: h.display_name,
                distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`,
                lat: h.lat,
                lon: h.lon
              }
            }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
            
            setNearbyHospitals(hospitalsWithDistance)
          } else {
            openGoogleMapsWithLocation(loc)
          }
        } catch (error) {
          console.error("Search error:", error)
          openGoogleMapsWithLocation(loc)
        }
        setLocationLoading(false)
      },
      (error) => {
        console.log("Geolocation error:", error)
        setLocationLoading(false)
        window.open('https://www.google.com/maps/search/hospitals+near+me/', '_blank')
      }
    )
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const openGoogleMapsWithLocation = (location) => {
    const url = `https://www.google.com/maps/search/hospitals/@${location.lat},${location.lng},14z`
    window.open(url, '_blank')
  }

  const openHospitalDirections = (hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lon}`
      window.open(url, '_blank')
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`
      window.open(url, '_blank')
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />
      case 'predict':
        return <Predictor result={result} setResult={setResult} setShowAlert={setShowAlert} />
      case 'reports':
        return <Reports />
      case 'alerts':
        return <Alerts />
      default:
        return <Dashboard setActivePage={setActivePage} />
        
    }
  }

  useEffect(() => {
    if (result?.risk === 'High Risk') {
      setShowAlert(true)
    }
  }, [result])

  return (
    <div className="min-h-screen relative overflow-hidden main-container">
      <Particles />
      
      <div className="relative z-10 flex min-h-screen">
        <Sidebar activePage={activePage} setActivePage={setActivePage} onOpenChat={() => setChatOpen(true)} />
        
        <main className="flex-1 ml-64 p-8 overflow-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-7xl mx-auto page-content"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setShowAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="glass-card rounded-3xl p-12 max-w-lg mx-4 text-center modal-3d neon-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center neon-pink"
              >
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </motion.div>
              <h2 className="text-3xl font-bold text-red-400 mb-4">High Risk Detected</h2>
              <p className="text-gray-300 mb-6">
                Your assessment indicates elevated risk factors. Please contact your healthcare provider immediately.
              </p>
              <div className="flex gap-4 justify-center">
                <motion.button 
                  onClick={handleFindHospitals}
                  whileHover={{ scale: 1.05, rotateX: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-semibold transition-all flex items-center gap-2 neon-pink"
                >
                  <MapPin className="w-5 h-5" />
                  Find Hospital
                </motion.button>
                <motion.button 
                  onClick={() => setShowAlert(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 glass hover:bg-white/10 rounded-xl font-semibold transition-all"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHospitals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setShowHospitals(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card rounded-3xl p-8 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto modal-3d neon-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-400" />
                  Nearby Hospitals
                </h2>
                <button 
                  onClick={() => setShowHospitals(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-400 mb-4">
                {locationLoading 
                  ? 'Getting your location and finding hospitals...' 
                  : userLocation 
                    ? `Found ${nearbyHospitals.length} hospitals near you` 
                    : 'Click the button below to find hospitals near you'}
              </p>
              
              {locationLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Finding nearby hospitals...</p>
                </div>
              ) : (
              <div className="space-y-4">
                {nearbyHospitals.length > 0 ? (
                  nearbyHospitals.map((hospital, index) => (
                    <motion.div
                      key={hospital.name + index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-white/5"
                      style={{ boxShadow: '0 4px 25px rgba(0, 0, 0, 0.3)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm truncate">{hospital.name}</h4>
                            <p className="text-xs text-gray-400 truncate">{hospital.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-cyan-400 whitespace-nowrap">{hospital.distance}</span>
                          <button
                            onClick={() => openHospitalDirections(hospital)}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-xs font-medium text-white"
                          >
                            Directions
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-white/5"
                    style={{ boxShadow: '0 4px 25px rgba(0, 0, 0, 0.3)' }}
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-gray-400 text-sm mb-4">No hospitals found nearby. Click to search in Google Maps.</p>
                      <button
                        onClick={handleFindHospitals}
                        className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-sm font-medium text-white"
                      >
                        Search in Google Maps
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              )}

      <ChatAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

export default App
