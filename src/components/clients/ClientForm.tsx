import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, REGIME_TRIBUTARIO, type ClientForm } from '@/lib/validators/schemas'
import { formatCNPJ, formatPhone } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Client } from '@/types/database'

interface ClientFormDialogProps {
  client?: Client
  onSubmit: (data: ClientForm) => void
  onCancel: () => void
  loading?: boolean
}

export function ClientFormComponent({ client, onSubmit, onCancel, loading }: ClientFormDialogProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      razao_social: client.razao_social,
      nome_fantasia: client.nome_fantasia || '',
      cnpj: client.cnpj || '',
      inscricao_estadual: client.inscricao_estadual || '',
      regime_tributario: (client.regime_tributario as ClientForm['regime_tributario']) || undefined,
      email: client.email || '',
      telefone: client.telefone || '',
      whatsapp: client.whatsapp || '',
      endereco: client.endereco || '',
      data_inicio_contrato: client.data_inicio_contrato || '',
      observacoes: client.observacoes || '',
      ativo: client.ativo ?? true,
    } : { ativo: true },
  })

  const regime = watch('regime_tributario')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Razão Social *</Label>
          <Input {...register('razao_social')} />
          {errors.razao_social && <p className="text-sm text-destructive">{errors.razao_social.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Nome Fantasia</Label>
          <Input {...register('nome_fantasia')} />
        </div>
        <div className="space-y-2">
          <Label>CNPJ</Label>
          <Input
            {...register('cnpj')}
            onChange={(e) => setValue('cnpj', formatCNPJ(e.target.value))}
          />
          {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Inscrição Estadual</Label>
          <Input {...register('inscricao_estadual')} />
        </div>
        <div className="space-y-2">
          <Label>Regime Tributário</Label>
          <Select value={regime} onValueChange={(v) => setValue('regime_tributario', v as ClientForm['regime_tributario'])}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {REGIME_TRIBUTARIO.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            {...register('telefone')}
            onChange={(e) => setValue('telefone', formatPhone(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input
            {...register('whatsapp')}
            onChange={(e) => setValue('whatsapp', formatPhone(e.target.value))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Endereço</Label>
          <Input {...register('endereco')} />
        </div>
        <div className="space-y-2">
          <Label>Data Início do Contrato</Label>
          <Input type="date" {...register('data_inicio_contrato')} />
        </div>
        <div className="space-y-2 flex items-center gap-2 pt-6">
          <input type="checkbox" id="ativo" {...register('ativo')} className="h-4 w-4" />
          <Label htmlFor="ativo">Cliente ativo</Label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Observações</Label>
          <Textarea {...register('observacoes')} rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : client ? 'Atualizar' : 'Criar cliente'}
        </Button>
      </div>
    </form>
  )
}
