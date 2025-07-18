
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'

interface Message {
  id: string
  message: string
  is_user: boolean
  created_at: string
}

interface AIAssistantProps {
  onClose: () => void
}

export function AIAssistant({ onClose }: AIAssistantProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchChatHistory()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatHistory = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching chat history:', error)
    } else {
      setMessages(data || [])
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user || loading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      message: userMessage,
      is_user: true,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      // Save user message to database
      await supabase
        .from('ai_chat_history')
        .insert({
          user_id: user.id,
          message: userMessage,
          is_user: true
        })

      // Get AI response
      const { data, error } = await supabase.functions.invoke('diet-assistant', {
        body: {
          message: userMessage,
          userId: user.id
        }
      })

      if (error) throw error

      const aiResponse = data.response

      // Add AI response to chat
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: aiResponse,
        is_user: false,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, newAiMessage])

      // Save AI response to database
      await supabase
        .from('ai_chat_history')
        .insert({
          user_id: user.id,
          message: aiResponse,
          is_user: false
        })

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.',
        is_user: false,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-green-500 text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">Diyet Asistanı</h3>
        </div>
        <p className="text-xs opacity-90">Beslenme sorularınızı sorun</p>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">
                Merhaba! Size beslenme konusunda nasıl yardımcı olabilirim?
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.is_user ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.is_user ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {message.is_user ? (
                  <User className="h-3 w-3 text-white" />
                ) : (
                  <Bot className="h-3 w-3 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.is_user
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-black'
                }`}
              >
                {message.message}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            disabled={loading}
            className="border-gray-300"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
