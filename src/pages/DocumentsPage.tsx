import { useState } from 'react'
import { FileText, Eye, Trash2 } from 'lucide-react'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/useDocuments'
import { useClients } from '@/hooks/useClients'
import { DOCUMENT_CATEGORIES } from '@/lib/validators/schemas'
import type { DocumentWithClient } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { UploadZone } from '@/components/documents/UploadZone'
import { SummaryPanel } from '@/components/documents/SummaryPanel'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function DocumentsPage() {
  const [clientFilter, setClientFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(DOCUMENT_CATEGORIES[0])
  const [summaryDoc, setSummaryDoc] = useState<DocumentWithClient | null>(null)

  const filters = {
    clientId: clientFilter === 'all' ? undefined : clientFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  }

  const { data: documents = [], isLoading } = useDocuments(filters)
  const { data: clients = [] } = useClients()
  const uploadDocument = useUploadDocument()
  const deleteDocument = useDeleteDocument()

  const handleUpload = async (files: File[]) => {
    if (!selectedClient) {
      toast.error('Selecione um cliente antes de enviar')
      return
    }
    for (const file of files) {
      try {
        await uploadDocument.mutateAsync({
          file,
          clientId: selectedClient,
          category: selectedCategory as typeof DOCUMENT_CATEGORIES[number],
        })
        toast.success(`${file.name} enviado com sucesso!`)
      } catch (err) {
        toast.error(`Erro ao enviar ${file.name}`, { description: (err as Error).message })
      }
    }
    setUploadOpen(false)
  }

  const handleDelete = async (doc: DocumentWithClient) => {
    try {
      await deleteDocument.mutateAsync({ id: doc.id, filePath: doc.file_path })
      toast.success('Documento excluído!')
    } catch (err) {
      toast.error('Erro ao excluir', { description: (err as Error).message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">Gerencie documentos dos seus clientes</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>Enviar Documento</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
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
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.file_name}</TableCell>
                    <TableCell>{doc.clients?.nome_fantasia || doc.clients?.razao_social}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>
  {doc.uploaded_at
    ? formatDate(doc.uploaded_at)
    : '-'}
</TableCell>
                    <TableCell className="text-right">
                      {doc.mime_type === 'application/pdf' && (
                        <Button variant="ghost" size="icon" onClick={() => setSummaryDoc(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.razao_social}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <UploadZone onUpload={handleUpload} disabled={uploadDocument.isPending} />
          </div>
        </DialogContent>
      </Dialog>

      <SummaryPanel
        document={summaryDoc}
        open={!!summaryDoc}
        onClose={() => setSummaryDoc(null)}
      />
    </div>
  )
}
