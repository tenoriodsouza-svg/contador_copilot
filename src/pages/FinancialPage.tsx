import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useFinancialRecords,
  useFinancialStats,
  useCreateFinancialRecord,
  useUpdateFinancialRecord,
  useDeleteFinancialRecord,
} from '@/hooks/useFinancial'
import { useClients } from '@/hooks/useClients'
import { financialSchema, PAYMENT_STATUSES, type FinancialForm } from '@/lib/validators/schemas'
import type { FinancialRecordWithClient } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/dashboard/StatCard'
import { DollarSign, TrendingUp, AlertCircle, Wallet } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const statusLabels: Record<string, string> = {
  pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado',
}
const statusVariants: Record<string, 'success' | 'secondary' | 'destructive'> = {
  pago: 'success', pendente: 'secondary', atrasado: 'destructive',
}

export function FinancialPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FinancialRecordWithClient | null>(null)

  const { records, monthlyRevenue, annualRevenue, totalReceived, delinquentClients } = useFinancialStats()
  const { isLoading } = useFinancialRecords()
  const { data: clients = [] } = useClients()
  const createRecord = useCreateFinancialRecord()
  const updateRecord = useUpdateFinancialRecord()
  const deleteRecord = useDeleteFinancialRecord()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FinancialForm>({
    resolver: zodResolver(financialSchema),
    defaultValues: { payment_status: 'pendente' },
  })

  const openCreate = () => {
    reset({ payment_status: 'pendente', client_id: '', monthly_fee: 0, billing_date: '' })
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (record: FinancialRecordWithClient) => {
    reset({
      client_id: record.client_id,
      monthly_fee: Number(record.monthly_fee),
      billing_date: record.billing_date,
      payment_status: record.payment_status as FinancialForm['payment_status'],
    })
    setEditing(record)
    setDialogOpen(true)
  }

  const onSubmit = async (data: FinancialForm) => {
    try {
      if (editing) {
        await updateRecord.mutateAsync({ ...data, id: editing.id })
        toast.success('Registro atualizado!')
      } else {
        await createRecord.mutateAsync(data)
        toast.success('Registro criado!')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar', { description: (err as Error).message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Controle de mensalidades e receita</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Cobrança</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Receita Mensal" value={formatCurrency(monthlyRevenue)} icon={DollarSign} />
        <StatCard title="Receita Anual" value={formatCurrency(annualRevenue)} icon={TrendingUp} />
        <StatCard title="Total Recebido" value={formatCurrency(totalReceived)} icon={Wallet} />
        <StatCard
          title="Clientes Inadimplentes"
          value={delinquentClients}
          icon={AlertCircle}
          variant={delinquentClients > 0 ? 'danger' : 'default'}
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Registros de Cobrança</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Data Cobrança</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.clients?.nome_fantasia || record.clients?.razao_social}</TableCell>
                    <TableCell>{formatCurrency(Number(record.monthly_fee))}</TableCell>
                    <TableCell>{formatDate(record.billing_date)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[record.computedStatus]}>
                        {statusLabels[record.computedStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(record)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteRecord.mutate(record.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar Cobrança' : 'Nova Cobrança'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={watch('client_id')} onValueChange={(v) => setValue('client_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor da Mensalidade *</Label>
              <Input type="number" step="0.01" {...register('monthly_fee')} />
              {errors.monthly_fee && <p className="text-sm text-destructive">{errors.monthly_fee.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data de Cobrança *</Label>
              <Input type="date" {...register('billing_date')} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch('payment_status')} onValueChange={(v) => setValue('payment_status', v as FinancialForm['payment_status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
