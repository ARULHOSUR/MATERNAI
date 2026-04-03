import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react'

export default function SHAPChart({ data }) {
  const features = Object.entries(data.explanation || {})
    .map(([key, value]) => ({
      feature: key,
      label: value.label,
      value: value.value,
      explanation: value.explanation
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 7)

  const maxValue = Math.max(...features.map(f => Math.abs(f.value)), 0.1)

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-maternal-purple" />
          <h4 className="font-semibold">Feature Impact Analysis</h4>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-400">Increases Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-400">Decreases Risk</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {features.map((feature, index) => {
          const isPositive = feature.value > 0
          const barWidth = (Math.abs(feature.value) / maxValue) * 100
          
          return (
            <motion.div
              key={feature.feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{feature.label}</span>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  )}
                  <span className={`text-sm font-bold ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                    {isPositive ? '+' : ''}{feature.value.toFixed(3)}
                  </span>
                </div>
              </div>
              
              <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-lg ${
                    isPositive 
                      ? 'bg-gradient-to-r from-red-500/80 to-red-500' 
                      : 'bg-gradient-to-r from-green-500 to-green-500/80'
                  }`}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <p className="text-xs text-gray-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {feature.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-maternal-purple/20 to-maternal-pink/20 border border-maternal-purple/20"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-maternal-purple flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-medium mb-1">AI Insight</h5>
            <p className="text-sm text-gray-300">
              {generateInsight(data)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function generateInsight(data) {
  const factors = data.main_factors || []
  const risk = data.risk
  
  if (risk === 'Low Risk') {
    return "Great news! All vital signs are within healthy ranges. Continue maintaining your current health routine and attend regular prenatal checkups."
  }
  
  if (factors.length > 0) {
    const topFactors = factors.slice(0, 2).map(f => f.label.toLowerCase()).join(' and ')
    return `The main contributors to the ${risk.toLowerCase()} assessment are elevated ${topFactors}. We recommend consulting with your healthcare provider to address these concerns.`
  }
  
  return "Several factors are contributing to the current risk assessment. Please review the detailed breakdown above and consider seeking medical advice."
}
