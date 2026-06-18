import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import { REGIME_TRIBUTARIO } from '@/lib/validators/schemas'
import type { ClientForm } from '@/lib/validators/schemas'
import type { Client } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientFormComponent } from '@/components/clients/ClientForm'
import { toast } from 'sonner'

export function ClientsPage() {
  const [search, setSearch] = useState('')
  const [ativoFilter, setAtivoFilter] = useState<string>('all')
  const [regimeFilter, setRegimeFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null)

  const filters = {
    ativo: ativoFilter === 'all' ? undefined : ativoFilter === 'ativo',
    regime: regimeFilter === 'all' ? undefined : regimeFilter,
  }

  const { data: clients = [], isLoading } = useClients(search, filters)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const handleSubmit = async (data: ClientForm) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({ ...data, id: editingClient.id })
        toast.success('Cliente atualizado!')
      } else {
        await createClient.mutateAsync(data)
        toast.success('Cliente criado!')
      }
      setDialogOpen(false)
      setEditingClient(null)
    } catch (err) {
      toast.error('Erro ao salvar cliente', { description: (err as Error).message })
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteClient.mutateAsync(deleteConfirm.id)
      toast.success('Cliente excluído!')
      setDeleteConfirm(null)
    } catch (err) {
      toast.error('Erro ao excluir', { description: (err as Error).message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes contábeis</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={ativoFilter} onValueChange={setAtivoFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regimeFilter} onValueChange={setRegimeFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Regime" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os regimes</SelectItem>
                {REGIME_TRIBUTARIO.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum cliente encontrado</p>
              <Button variant="link" onClick={() => setDialogOpen(true)}>Criar primeiro cliente</Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Regime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.razao_social}</p>
                            {client.nome_fantasia && (
                              <p className="text-xs text-muted-foreground">{client.nome_fantasia}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{client.cnpj || '-'}</TableCell>
                        <TableCell>{client.regime_tributario || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={client.ativo ? 'success' : 'secondary'}>
                            {client.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setDialogOpen(true) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(client)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {clients.map((client) => (
                  <Card key={client.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{client.razao_social}</p>
                          <p className="text-sm text-muted-foreground">{client.cnpj}</p>
                          <Badge variant={client.ativo ? 'success' : 'secondary'} className="mt-2">
                            {client.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setDialogOpen(true) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(client)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <ClientFormComponent
            client={editingClient || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            loading={createClient.isPending || updateClient.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cliente</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong>{deleteConfirm?.razao_social}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteClient.isPending}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
