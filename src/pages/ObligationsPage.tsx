import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useObligations, useCreateObligation, useUpdateObligation, useDeleteObligation } from '@/hooks/useObligations'
import { useClients } from '@/hooks/useClients'
import { obligationSchema, OBLIGATION_TYPES, type ObligationForm } from '@/lib/validators/schemas'
import type { ObligationWithClient } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, getObligationUrgency } from '@/lib/utils'
import { toast } from 'sonner'

export function ObligationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ObligationWithClient | null>(null)

  const filter = activeTab === 'all' ? undefined : activeTab as 'overdue' | 'today' | 'week' | 'month'
  const { data: obligations = [], isLoading } = useObligations(filter)
  const { data: clients = [] } = useClients()
  const createObligation = useCreateObligation()
  const updateObligation = useUpdateObligation()
  const deleteObligation = useDeleteObligation()

  const { register, handleSubmit, setValue, watch, reset } = useForm<ObligationForm>({
    resolver: zodResolver(obligationSchema),
    defaultValues: {
      type: 'DAS',
      status: 'pendente',
    },
  })

  const openCreate = () => {
    reset({ type: 'DAS', status: 'pendente', client_id: '', description: '', due_date: '' })
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (obligation: ObligationWithClient) => {
    reset({
      client_id: obligation.client_id,
      type: obligation.type as ObligationForm['type'],
      description: obligation.description || '',
      due_date: obligation.due_date,
      status: obligation.status,
    })
    setEditing(obligation)
    setDialogOpen(true)
  }

  const onSubmit = async (data: ObligationForm) => {
    try {
      if (editing) {
        await updateObligation.mutateAsync({ ...data, id: editing.id })
        toast.success('Obrigação atualizada!')
      } else {
        await createObligation.mutateAsync(data)
        toast.success('Obrigação cadastrada!')
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar', { description: (err as Error).message })
    }
  }

  const urgencyClass = (dueDate: string) => {
    const urgency = getObligationUrgency(dueDate)
    if (urgency === 'overdue') return 'text-destructive font-semibold bg-destructive/5'
    if (urgency === 'today') return 'text-amber-600 font-medium'
    return ''
  }

  const ObligationTable = () => (
    isLoading ? (
      <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
    ) : obligations.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Nenhuma obrigação encontrada</p>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {obligations.map((o) => (
            <TableRow key={o.id} className={getObligationUrgency(o.due_date) === 'overdue' ? 'bg-destructive/5' : ''}>
              <TableCell>{o.clients?.nome_fantasia || o.clients?.razao_social}</TableCell>
              <TableCell>{o.type}</TableCell>
              <TableCell>{o.description || '-'}</TableCell>
              <TableCell className={urgencyClass(o.due_date)}>{formatDate(o.due_date)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(o)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteObligation.mutate(o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Obrigações e Vencimentos</h1>
          <p className="text-muted-foreground">Calendário contábil de obrigações fiscais</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nova Obrigação</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="overdue" className="text-destructive">Vencidos</TabsTrigger>
              <TabsTrigger value="today">Vencendo Hoje</TabsTrigger>
              <TabsTrigger value="week">Próximos 7 dias</TabsTrigger>
              <TabsTrigger value="month">Próximos 30 dias</TabsTrigger>
            </TabsList>
            {['all', 'overdue', 'today', 'week', 'month'].map((tab) => (
              <TabsContent key={tab} value={tab}><ObligationTable /></TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar Obrigação' : 'Nova Obrigação'}</DialogTitle></DialogHeader>
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
              <Label>Tipo *</Label>
              <Select value={watch('type')} onValueChange={(v) => setValue('type', v as ObligationForm['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OBLIGATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label>Data de Vencimento *</Label>
              <Input type="date" {...register('due_date')} />
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
