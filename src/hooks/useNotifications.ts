import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Notification } from '@/types/database'

export function useNotifications() {
  const { user } = useAuth()


  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user,
  })

  useEffect(() => {
    // Realtime temporariamente desativado
  }, [])

  return query
}

export function useUnreadNotificationCount() {
  const { data } = useNotifications()
  return data?.filter((n) => !n.read).length ?? 0
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useGenerateNotifications() {
  const { session } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('generate-notifications', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (error) throw error
    },
  })
}
