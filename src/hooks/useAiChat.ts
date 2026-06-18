import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { AiChat, AiChatMessage } from '@/types/database'

export function useAiChats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['ai-chats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as AiChat[]
    },
    enabled: !!user,
  })
}

export function useAiChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: ['ai-chat-messages', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('chat_id', chatId!)
        .order('created_at')
      if (error) throw error
      return data as AiChatMessage[]
    },
    enabled: !!chatId,
  })
}

export function useCreateAiChat() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data, error } = await supabase
        .from('ai_chats')
        .insert({ user_id: user!.id, title: title || 'Nova conversa' })
        .select()
        .single()
      if (error) throw error
      return data as AiChat
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-chats'] }),
  })
}

export function useSendAiMessage() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      await supabase.from('ai_chat_messages').insert({
        chat_id: chatId,
        role: 'user',
        content: message,
      })

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { chat_id: chatId, message },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })

      if (error) throw error
      return data as { content: string }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-messages', variables.chatId] })
    },
  })
}
