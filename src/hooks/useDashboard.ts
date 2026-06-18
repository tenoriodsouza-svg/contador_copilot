import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { startOfMonth, endOfMonth, addDays, format } from 'date-fns'

export function useDashboardStats() {
  const { user } = useAuth()
  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const in30Days = format(addDays(now, 30), 'yyyy-MM-dd')
  const today = format(now, 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      const [
        clientsRes,
        activeClientsRes,
        tasksRes,
        documentsRes,
        certificatesRes,
        obligationsRes,
        tasksWithClientsRes,
        recentDocsRes,
      ] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('ativo', true),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .neq('status', 'concluido')
          .gte('due_date', monthStart)
          .lte('due_date', monthEnd),
        supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .gte('uploaded_at', monthStart)
          .lte('uploaded_at', monthEnd + 'T23:59:59'),
        supabase
          .from('obligations')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'Certificados Digitais')
          .gte('due_date', today)
          .lte('due_date', in30Days),
        supabase
          .from('obligations')
          .select('*, clients(razao_social, nome_fantasia)')
          .gte('due_date', today)
          .order('due_date')
          .limit(5),
        supabase
          .from('tasks')
          .select('*, clients(razao_social, nome_fantasia)')
          .neq('status', 'concluido')
          .order('due_date')
          .limit(5),
        supabase
          .from('documents')
          .select('*, clients(razao_social, nome_fantasia)')
          .order('uploaded_at', { ascending: false })
          .limit(5),
      ])

      return {
        totalClients: clientsRes.count ?? 0,
        activeClients: activeClientsRes.count ?? 0,
        monthlyTasks: tasksRes.count ?? 0,
        monthlyDocuments: documentsRes.count ?? 0,
        upcomingCertificates: certificatesRes.count ?? 0,
        upcomingObligations: obligationsRes.data ?? [],
        clientsWithTasks: tasksWithClientsRes.data ?? [],
        recentDocuments: recentDocsRes.data ?? [],
      }
    },
    enabled: !!user,
  })
}
