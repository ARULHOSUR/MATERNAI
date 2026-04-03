import { motion } from 'framer-motion'
import { Heart, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const riskConfig = {
  'Low Risk': {
    color: '#10b981',
    gradient: 'from-green-500 to-emerald-600',
    icon: Shield,
    bgGradient: 'from-green-500/20 to-emerald-500/10'
  },
  'Medium Risk': {
    color: '#f59e0b',
    gradient: 'from-yellow-500 to-orange-600',
    icon: Activity,
    bgGradient: 'from-yellow-500/20 to-orange-500/10'
  },
  'High Risk': {
    color: '#ef4444',
    gradient: 'from-red-500 to-pink-600',
    icon: AlertTriangle,
    bgGradient: 'from-red-500/20 to-pink-500/10'
  }
}

export default function ResultCard({ result }) {
  const config = riskConfig[result.risk]
  const Icon = config.icon
  
  const pieData = [
    { name: 'Low', value: result.probability_low * 100 },
    { name: 'Medium', value: result.probability_medium * 100 },
    { name: 'High', value: result.probability_high * 100 },
  ]
  
  const COLORS = ['#10b981', '#f59e0b', '#ef4444']

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card rounded-3xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${config.bgGradient} p-8`}>
        <div className="flex items-center justify-between mb-6">
          <motion.div
            animate={result.risk === 'High Risk' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>
          
          <div className="text-right">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-400 mb-1"
            >
              Confidence
            </motion.p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl font-bold"
              style={{ color: config.color }}
            >
              {(result.confidence * 100).toFixed(1)}%
            </motion.p>
          </div>
        </div>
        
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
          style={{ color: config.color }}
        >
          {result.risk}
        </motion.h2>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-gray-300"
        >
          {result.recommendation}
        </motion.p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-4">Risk Probability Distribution</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs text-gray-400">{entry.name}: {entry.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-4">Key Contributing Factors</h4>
            <div className="space-y-3">
              {result.main_factors?.slice(0, 3).map((factor, index) => (
                <motion.div
                  key={factor.feature}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    factor.impact > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}>
                    {factor.impact > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{factor.label}</p>
                    <p className="text-xs text-gray-400 truncate">{factor.explanation}</p>
                  </div>
                  <span className={`text-sm font-bold ${factor.impact > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
