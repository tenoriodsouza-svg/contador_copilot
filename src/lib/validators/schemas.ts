import { z } from 'zod'
import { isValidCNPJFormat } from '@/lib/utils'

export const REGIME_TRIBUTARIO = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
  'Outro',
] as const

export const DOCUMENT_CATEGORIES = [
  'Notas Fiscais',
  'Extratos Bancários',
  'Contratos',
  'Certificados Digitais',
  'Obrigações Fiscais',
  'Outros',
] as const

export const TASK_PRIORITIES = ['baixa', 'media', 'alta', 'urgente'] as const
export const TASK_STATUSES = ['pendente', 'em_andamento', 'concluido'] as const

export const OBLIGATION_TYPES = [
  'DAS',
  'Certificados Digitais',
  'Obrigações acessórias',
  'Parcelamentos',
  'Outras',
] as const

export const PAYMENT_STATUSES = ['pago', 'pendente', 'atrasado'] as const

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const clientSchema = z.object({
  razao_social: z.string().min(2, 'Razão social é obrigatória'),
  nome_fantasia: z.string().optional(),
  cnpj: z.string().optional().refine(
    (val) => !val || isValidCNPJFormat(val),
    'CNPJ deve ter 14 dígitos'
  ),
  inscricao_estadual: z.string().optional(),
  regime_tributario: z.enum(REGIME_TRIBUTARIO).optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  endereco: z.string().optional(),
  data_inicio_contrato: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const taskSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  description: z.string().min(3, 'Descrição é obrigatória'),
  due_date: z.string().min(1, 'Data limite é obrigatória'),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
})

export const obligationSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  type: z.enum(OBLIGATION_TYPES),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  status: z.string().default('pendente'),
})

export const financialSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  monthly_fee: z.coerce.number().positive('Valor deve ser positivo'),
  billing_date: z.string().min(1, 'Data de cobrança é obrigatória'),
  payment_status: z.enum(PAYMENT_STATUSES),
})

export type LoginForm = z.infer<typeof loginSchema>
export type SignupForm = z.infer<typeof signupSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
export type ClientForm = z.infer<typeof clientSchema>
export type TaskForm = z.infer<typeof taskSchema>
export type ObligationForm = z.infer<typeof obligationSchema>
export type FinancialForm = z.infer<typeof financialSchema>
