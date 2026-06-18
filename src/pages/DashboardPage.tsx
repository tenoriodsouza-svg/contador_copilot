import { Users, UserCheck, AlertCircle, FileText, Shield } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataList } from '@/components/dashboard/DataList'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua operação contábil</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total de Clientes" value={stats?.totalClients ?? 0} icon={Users} />
        <StatCard title="Clientes Ativos" value={stats?.activeClients ?? 0} icon={UserCheck} />
        <StatCard
          title="Pendências do Mês"
          value={stats?.monthlyTasks ?? 0}
          icon={AlertCircle}
          variant={stats?.monthlyTasks ? 'warning' : 'default'}
        />
        <StatCard title="Documentos Recebidos" value={stats?.monthlyDocuments ?? 0} icon={FileText} />
        <StatCard
          title="Certificados Próximos"
          value={stats?.upcomingCertificates ?? 0}
          icon={Shield}
          variant={stats?.upcomingCertificates ? 'danger' : 'default'}
          description="Vencem em 30 dias"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Resumo Rápido</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <DataList
            title="Próximos Vencimentos"
            items={(stats?.upcomingObligations ?? []).map((o) => ({
              id: o.id,
              primary: o.clients?.nome_fantasia || o.clients?.razao_social || 'Cliente',
              secondary: `${o.type} - ${o.description || 'Sem descrição'}`,
              badge: formatDate(o.due_date),
            }))}
            emptyMessage="Nenhum vencimento próximo"
          />
          <DataList
            title="Clientes com Pendências"
            items={(stats?.clientsWithTasks ?? []).map((t) => ({
              id: t.id,
              primary: t.clients?.nome_fantasia || t.clients?.razao_social || 'Cliente',
              secondary: t.description,
              badge: formatDate(t.due_date),
              urgent: new Date(t.due_date) < new Date(),
            }))}
            emptyMessage="Nenhuma pendência ativa"
          />
          <DataList
            title="Últimos Documentos"
            items={(stats?.recentDocuments ?? []).map((d) => ({
              id: d.id,
              primary: d.file_name,
              secondary: d.clients?.nome_fantasia || d.clients?.razao_social || 'Cliente',
              badge: formatDate(d.uploaded_at),
            }))}
            emptyMessage="Nenhum documento enviado"
          />
        </div>
      </div>
    </div>
  )
}
