import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Client } from '@/types/database'
import type { ClientForm } from '@/lib/validators/schemas'

export function useClients(search?: string, filters?: { ativo?: boolean; regime?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['clients', user?.id, search, filters],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .order('razao_social')

      if (search) {
        query = query.or(
          `razao_social.ilike.%${search}%,nome_fantasia.ilike.%${search}%,cnpj.ilike.%${search}%`
        )
      }
      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo)
      }
      if (filters?.regime) {
        query = query.eq('regime_tributario', filters.regime)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Client[]
    },
    enabled: !!user,
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Client
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (client: ClientForm) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...client, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...client }: ClientForm & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...client, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
}
