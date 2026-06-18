import { FileDown, Users, CheckSquare, Calendar, DollarSign, Shield } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useTasks } from '@/hooks/useTasks'
import { useObligations } from '@/hooks/useObligations'
import { useFinancialRecords } from '@/hooks/useFinancial'
import {
  generateClientsReport,
  generateTasksReport,
  generateObligationsReport,
  generateFinancialReport,
  generateCertificatesReport,
} from '@/lib/reports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const reports = [
  {
    id: 'clients',
    title: 'Clientes',
    description: 'Lista completa de clientes cadastrados',
    icon: Users,
    action: 'clients' as const,
  },
  {
    id: 'tasks',
    title: 'Pendências',
    description: 'Todas as pendências e tarefas',
    icon: CheckSquare,
    action: 'tasks' as const,
  },
  {
    id: 'obligations',
    title: 'Obrigações',
    description: 'Obrigações fiscais e vencimentos',
    icon: Calendar,
    action: 'obligations' as const,
  },
  {
    id: 'financial',
    title: 'Financeiro',
    description: 'Registros de cobrança e mensalidades',
    icon: DollarSign,
    action: 'financial' as const,
  },
  {
    id: 'certificates',
    title: 'Certificados',
    description: 'Certificados digitais e vencimentos',
    icon: Shield,
    action: 'certificates' as const,
  },
]

export function ReportsPage() {
  const { data: clients = [] } = useClients()
  const { data: tasks = [] } = useTasks()
  const { data: obligations = [] } = useObligations('all')
  const { data: financial = [] } = useFinancialRecords()

  const handleExport = (action: typeof reports[number]['action']) => {
    try {
      switch (action) {
        case 'clients':
          if (clients.length === 0) { toast.error('Nenhum cliente para exportar'); return }
          generateClientsReport(clients)
          break
        case 'tasks':
          if (tasks.length === 0) { toast.error('Nenhuma pendência para exportar'); return }
          generateTasksReport(tasks)
          break
        case 'obligations':
          if (obligations.length === 0) { toast.error('Nenhuma obrigação para exportar'); return }
          generateObligationsReport(obligations)
          break
        case 'financial':
          if (financial.length === 0) { toast.error('Nenhum registro financeiro para exportar'); return }
          generateFinancialReport(financial)
          break
        case 'certificates': {
          const certs = obligations.filter((o) => o.type === 'Certificados Digitais')
          if (certs.length === 0) { toast.error('Nenhum certificado para exportar'); return }
          generateCertificatesReport(certs)
          break
        }
      }
      toast.success('Relatório exportado com sucesso!')
    } catch (err) {
      toast.error('Erro ao gerar relatório', { description: (err as Error).message })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Exporte relatórios em PDF</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleExport(report.action)} className="w-full">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
