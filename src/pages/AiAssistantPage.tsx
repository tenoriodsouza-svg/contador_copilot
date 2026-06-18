import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Plus } from 'lucide-react'
import { useAiChats, useAiChatMessages, useCreateAiChat, useSendAiMessage } from '@/hooks/useAiChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function AiAssistantPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chats = [] } = useAiChats()
  const { data: messages = [], isLoading: messagesLoading } = useAiChatMessages(activeChatId)
  const createChat = useCreateAiChat()
  const sendMessage = useSendAiMessage()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewChat = async () => {
    const chat = await createChat.mutateAsync(undefined)
    setActiveChatId(chat.id)
  }

  const handleSend = async () => {
    if (!message.trim()) return

    let chatId = activeChatId
    if (!chatId) {
      const chat = await createChat.mutateAsync(undefined)
      chatId = chat.id
      setActiveChatId(chatId)
    }

    const msg = message
    setMessage('')
    try {
      await sendMessage.mutateAsync({ chatId, message: msg })
    } catch {
      setMessage(msg)
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assistente IA</h1>
          <p className="text-muted-foreground">Tire dúvidas sobre contabilidade e rotinas fiscais</p>
        </div>
        <Button onClick={handleNewChat} variant="outline">
          <Plus className="h-4 w-4 mr-2" />Nova Conversa
        </Button>
      </div>

      <div className="flex gap-4 h-full">
        <Card className="w-64 shrink-0 hidden lg:block">
          <CardContent className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Conversas</p>
            {chats.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">Nenhuma conversa</p>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    'w-full text-left text-sm p-2 rounded-lg truncate',
                    activeChatId === chat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}
                >
                  {chat.title}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!activeChatId && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mb-4 text-primary/50" />
                  <p className="font-medium">Olá! Sou seu assistente contábil.</p>
                  <p className="text-sm mt-1">Pergunte sobre Simples Nacional, regimes tributários, rotinas contábeis e mais.</p>
                </div>
              ) : messagesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-16 w-1/2 ml-auto" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-xl px-4 py-3 max-w-[80%] text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {sendMessage.isPending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
                    Pensando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend() }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Digite sua pergunta..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessage.isPending}
                />
                <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
