export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          razao_social: string
          nome_fantasia: string | null
          cnpj: string | null
          inscricao_estadual: string | null
          regime_tributario: string | null
          email: string | null
          telefone: string | null
          whatsapp: string | null
          endereco: string | null
          data_inicio_contrato: string | null
          observacoes: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          razao_social: string
          nome_fantasia?: string | null
          cnpj?: string | null
          inscricao_estadual?: string | null
          regime_tributario?: string | null
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          endereco?: string | null
          data_inicio_contrato?: string | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          razao_social?: string
          nome_fantasia?: string | null
          cnpj?: string | null
          inscricao_estadual?: string | null
          regime_tributario?: string | null
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          endereco?: string | null
          data_inicio_contrato?: string | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          client_id: string
          user_id: string
          file_name: string
          file_path: string
          mime_type: string | null
          category: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          file_name: string
          file_path: string
          mime_type?: string | null
          category: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          mime_type?: string | null
          category?: string
          uploaded_at?: string
        }
      }
      document_summaries: {
        Row: {
          id: string
          document_id: string
          summary: string | null
          key_info: Json
          alerts: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          summary?: string | null
          key_info?: Json
          alerts?: Json
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          summary?: string | null
          key_info?: Json
          alerts?: Json
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          client_id: string
          user_id: string
          description: string
          due_date: string
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          description: string
          due_date: string
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          description?: string
          due_date?: string
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      obligations: {
        Row: {
          id: string
          client_id: string
          user_id: string
          type: string
          description: string | null
          due_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          type: string
          description?: string | null
          due_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          type?: string
          description?: string | null
          due_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          reference_id: string | null
          reference_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
        }
      }
      financial_records: {
        Row: {
          id: string
          client_id: string
          user_id: string
          monthly_fee: number
          billing_date: string
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          monthly_fee: number
          billing_date: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          monthly_fee?: number
          billing_date?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_chats: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_chat_messages: {
        Row: {
          id: string
          chat_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentSummary = Database['public']['Tables']['document_summaries']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Obligation = Database['public']['Tables']['obligations']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type FinancialRecord = Database['public']['Tables']['financial_records']['Row']
export type AiChat = Database['public']['Tables']['ai_chats']['Row']
export type AiChatMessage = Database['public']['Tables']['ai_chat_messages']['Row']

export type ClientWithRelations = Client & {
  tasks?: Task[]
  obligations?: Obligation[]
}

export type DocumentWithClient = Document & {
  clients?: { razao_social: string; nome_fantasia: string | null }
  document_summaries?: DocumentSummary[]
}

export type TaskWithClient = Task & {
  clients?: { razao_social: string; nome_fantasia: string | null }
}

export type ObligationWithClient = Obligation & {
  clients?: { razao_social: string; nome_fantasia: string | null }
}

export type FinancialRecordWithClient = FinancialRecord & {
  clients?: { razao_social: string; nome_fantasia: string | null }
}
