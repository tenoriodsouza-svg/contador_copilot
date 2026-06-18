import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { FinancialRecordWithClient } from '@/types/database'
import type { FinancialForm } from '@/lib/validators/schemas'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns'
import { getPaymentStatus } from '@/lib/utils'

export function useFinancialRecords() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['financial-records', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*, clients(razao_social, nome_fantasia)')
        .order('billing_date', { ascending: false })
      if (error) throw error
      return data as FinancialRecordWithClient[]
    },
    enabled: !!user,
  })
}

export function useFinancialStats() {
  const { data: records = [] } = useFinancialRecords()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const yearStart = startOfYear(now)
  const yearEnd = endOfYear(now)

  const enriched = records.map((r) => ({
    ...r,
    computedStatus: getPaymentStatus(r.billing_date, r.payment_status),
  }))

  const monthlyRevenue = enriched
    .filter(
      (r) =>
        r.computedStatus === 'pago' &&
        new Date(r.billing_date) >= monthStart &&
        new Date(r.billing_date) <= monthEnd
    )
    .reduce((sum, r) => sum + Number(r.monthly_fee), 0)

  const annualRevenue = enriched
    .filter(
      (r) =>
        r.computedStatus === 'pago' &&
        new Date(r.billing_date) >= yearStart &&
        new Date(r.billing_date) <= yearEnd
    )
    .reduce((sum, r) => sum + Number(r.monthly_fee), 0)

  const totalReceived = enriched
    .filter((r) => r.computedStatus === 'pago')
    .reduce((sum, r) => sum + Number(r.monthly_fee), 0)

  const delinquentClients = new Set(
    enriched.filter((r) => r.computedStatus === 'atrasado').map((r) => r.client_id)
  ).size

  return { monthlyRevenue, annualRevenue, totalReceived, delinquentClients, records: enriched }
}

export function useCreateFinancialRecord() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (record: FinancialForm) => {
      const { data, error } = await supabase
        .from('financial_records')
        .insert({ ...record, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financial-records'] }),
  })
}

export function useUpdateFinancialRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...record }: FinancialForm & { id: string }) => {
      const { data, error } = await supabase
        .from('financial_records')
        .update({ ...record, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financial-records'] }),
  })
}

export function useDeleteFinancialRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_records').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financial-records'] }),
  })
}
