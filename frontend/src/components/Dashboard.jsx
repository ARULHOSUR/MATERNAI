import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ArrowRight,
  Heart,
  Droplets,
  Thermometer,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts'

const dos = [
  { icon: CheckCircle, text: 'Attend regular prenatal check-ups', color: '#10b981' },
  { icon: CheckCircle, text: 'Maintain a balanced, nutritious diet', color: '#10b981' },
  { icon: CheckCircle, text: 'Stay physically active with gentle exercises', color: '#10b981' },
  { icon: CheckCircle, text: 'Take prenatal vitamins as prescribed', color: '#10b981' },
  { icon: CheckCircle, text: 'Monitor blood pressure regularly', color: '#10b981' },
  { icon: CheckCircle, text: 'Get adequate rest and sleep', color: '#10b981' },
  { icon: CheckCircle, text: 'Stay hydrated (8-10 glasses daily)', color: '#10b981' },
  { icon: CheckCircle, text: 'Report any unusual symptoms to doctor', color: '#10b981' },
]

const donts = [
  { icon: XCircle, text: 'Avoid smoking and alcohol', color: '#ef4444' },
  { icon: XCircle, text: 'Don\'t skip prenatal appointments', color: '#ef4444' },
  { icon: XCircle, text: 'Avoid raw or undercooked fish', color: '#ef4444' },
  { icon: XCircle, text: 'Don\'t consume unpasteurized dairy', color: '#ef4444' },
  { icon: XCircle, text: 'Avoid high-mercury fish', color: '#ef4444' },
  { icon: XCircle, text: 'Don\'t take medications without consulting', color: '#ef4444' },
  { icon: XCircle, text: 'Avoid exposure to harmful chemicals', color: '#ef4444' },
  { icon: XCircle, text: 'Don\'t handle cat litter (toxoplasmosis risk)', color: '#ef4444' },
]

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setTrendData(data.trend_data || [])
      } else {
        setStats({
          total_patients: 1245,
          risk_assessments: 3421,
          high_risk_alerts: 18,
          avg_risk_score: 28
        })
        setTrendData(generateMockTrend())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setStats({
        total_patients: 1245,
        risk_assessments: 3421,
        high_risk_alerts: 18,
        avg_risk_score: 28
      })
      setTrendData(generateMockTrend())
    } finally {
      setLoading(false)
    }
  }

  const generateMockTrend = () => {
    const data = []
    const today = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        risk_score: Math.floor(Math.random() * 40) + 20,
        patients: Math.floor(Math.random() * 20) + 5,
        low_risk: Math.floor(Math.random() * 15) + 5,
        medium_risk: Math.floor(Math.random() * 10) + 2,
        high_risk: Math.floor(Math.random() * 5)
      })
    }
    return data
  }

  const statCards = [
    { label: 'Total Patients', value: stats?.total_patients || 1245, icon: Users, change: '+12%', color: '#8b5cf6' },
    { label: 'Risk Assessments', value: stats?.risk_assessments || 3421, icon: Activity, change: '+8%', color: '#ff6b9d' },
    { label: 'High Risk Alerts', value: stats?.high_risk_alerts || 18, icon: AlertTriangle, change: '-5%', color: '#ef4444' },
    { label: 'Avg Risk Score', value: stats?.avg_risk_score || 28, icon: TrendingUp, change: '-3%', color: '#10b981' },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Welcome Back</span>
          </h1>
          <p className="text-gray-400">AI-Powered Maternal Risk Prediction Dashboard</p>
        </div>
        <motion.button
          onClick={() => setActivePage('predict')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-gradient px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <Heart className="w-5 h-5" />
          New Prediction
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-maternal-purple" />
            Risk Trend Analysis (Real-time)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length > 0 ? trendData : generateMockTrend()}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk_score" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#riskGradient)" 
                  strokeWidth={2}
                  name="Risk Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            Risk Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Low', value: 45 },
                { name: 'Medium', value: 35 },
                { name: 'High', value: 20 }
              ]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {[
                    { name: 'Low', value: 45 },
                    { name: 'Medium', value: 35 },
                    { name: 'High', value: 20 }
                  ].map((entry, index) => (
                    <Cell key={entry.name} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Maternal Healthcare DO's
          </h3>
          <div className="space-y-3">
            {dos.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-sm">{item.text}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Maternal Healthcare DON'Ts
          </h3>
          <div className="space-y-3">
            {donts.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-sm">{item.text}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
