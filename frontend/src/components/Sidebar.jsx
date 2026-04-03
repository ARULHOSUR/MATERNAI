import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Brain, 
  FileText, 
  Bell, 
  Heart,
  Sparkles,
  MessageCircle
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predict', label: 'Predict Risk', icon: Brain },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'alerts', label: 'Alerts', icon: Bell },
]

export default function Sidebar({ activePage, setActivePage, onOpenChat }) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-white/10 flex flex-col z-40"
    >
      <div className="p-6 border-b border-white/10">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-maternal-pink to-maternal-purple flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">MATERNAI</h1>
            <p className="text-xs text-gray-400">Risk Prediction</p>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            
            return (
              <motion.li
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-maternal-pink/20 to-maternal-purple/20 border border-maternal-purple/30' 
                      : 'hover:bg-white/5'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-maternal-pink' : 'text-gray-400'}`} />
                  </motion.div>
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-maternal-pink"
                    />
                  )}
                </motion.button>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={onOpenChat}
          className="w-full glass rounded-xl p-4 hover:from-maternal-pink/20 hover:to-maternal-purple/20 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-maternal-pink" />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <p className="text-xs text-gray-400">Chat with our AI expert</p>
        </motion.button>
      </div>
    </motion.aside>
  )
}
