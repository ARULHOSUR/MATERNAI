import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User } from 'lucide-react'

export default function ChatAssistant({ isOpen: externalIsOpen, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am your AI Maternal Health Assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (externalIsOpen && messages.length === 1) {
      setMessages([
        { id: 1, type: 'bot', text: 'Hello! I\'m your AI Maternal Health Assistant powered by OpenAI. You can ask me anything about maternal health, pregnancy, risk factors, symptoms, and more. How can I help you today?' }
      ])
    }
    if (!externalIsOpen) {
      setMessages([
        { id: 1, type: 'bot', text: 'Hello! I am your AI Maternal Health Assistant. How can I help you today?' }
      ])
      setInput('')
    }
  }, [externalIsOpen])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    if (input.match(/\.(jpg|jpeg|png|gif|webp)$/i) || input.includes('image')) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: 'Sorry, this AI Assistant does not support image input. It can only process text messages about maternal health. You can ask me questions about blood pressure, blood sugar, pregnancy symptoms, risk factors, and more!' 
      }])
      return
    }
    
    const userMessage = { id: Date.now(), type: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/chat/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await response.json()
      
      if (data.error) {
        const fallbackResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        })
        const fallbackData = await fallbackResponse.json()
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: fallbackData.response 
        }])
      } else {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: data.response 
        }])
      }
    } catch (error) {
      try {
        const fallbackResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        })
        const fallbackData = await fallbackResponse.json()
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: fallbackData.response 
        }])
      } catch {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: 'Sorry, I encountered an error. Please try again.' 
        }])
      }
    } finally {
      setLoading(false)
    }
  }

  if (!externalIsOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed top-20 right-8 z-50 w-96 h-[calc(100vh-180px)] glass-card rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-gray-400">AI Maternal Health Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.type === 'user' 
                    ? 'bg-maternal-purple' 
                    : 'bg-gradient-to-br from-cyan-500 to-purple-500'
                }`}>
                  {msg.type === 'user' 
                    ? <User className="w-4 h-4" /> 
                    : <Bot className="w-4 h-4" />
                  }
                </div>
                <div className={`p-3 rounded-xl text-sm ${
                  msg.type === 'user' 
                    ? 'bg-cyan-500/30 rounded-tr-none' 
                    : 'bg-white/10 rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <div className="loading-spinner w-4 h-4" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about maternal health..."
              className="flex-1 glass-input rounded-xl px-4 py-2 outline-none text-sm"
            />
            <motion.button
              onClick={handleSend}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
