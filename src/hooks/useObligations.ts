import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ObligationWithClient } from '@/types/database'
import type { ObligationForm } from '@/lib/validators/schemas'
import { format, addDays } from 'date-fns'

export function useObligations(filter?: 'overdue' | 'today' | 'week' | 'month' | 'all') {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['obligations', user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from('obligations')
        .select('*, clients(razao_social, nome_fantasia)')
        .order('due_date')

      if (filter === 'overdue') {
        query = query.lt('due_date', today)
      } else if (filter === 'today') {
        query = query.eq('due_date', today)
      } else if (filter === 'week') {
        query = query.gte('due_date', today).lte('due_date', format(addDays(new Date(), 7), 'yyyy-MM-dd'))
      } else if (filter === 'month') {
        query = query.gte('due_date', today).lte('due_date', format(addDays(new Date(), 30), 'yyyy-MM-dd'))
      }

      const { data, error } = await query
      if (error) throw error
      return data as ObligationWithClient[]
    },
    enabled: !!user,
  })
}

export function useCreateObligation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (obligation: ObligationForm) => {
      const { data, error } = await supabase
        .from('obligations')
        .insert({ ...obligation, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateObligation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...obligation }: ObligationForm & { id: string }) => {
      const { data, error } = await supabase
        .from('obligations')
        .update({ ...obligation, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['obligations'] }),
  })
}

export function useDeleteObligation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('obligations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['obligations'] }),
  })
}
