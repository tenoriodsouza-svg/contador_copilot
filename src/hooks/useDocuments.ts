import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { DocumentWithClient, DocumentSummary } from '@/types/database'
import type { DOCUMENT_CATEGORIES } from '@/lib/validators/schemas'

export function useDocuments(filters?: { clientId?: string; category?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['documents', user?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, clients(razao_social, nome_fantasia), document_summaries(*)')
        .order('uploaded_at', { ascending: false })

      if (filters?.clientId) query = query.eq('client_id', filters.clientId)
      if (filters?.category) query = query.eq('category', filters.category)

      const { data, error } = await query
      if (error) throw error
      return data as DocumentWithClient[]
    },
    enabled: !!user,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      file,
      clientId,
      category,
    }: {
      file: File
      clientId: string
      category: (typeof DOCUMENT_CATEGORIES)[number]
    }) => {
      const fileId = crypto.randomUUID()
      const filePath = `${user!.id}/${clientId}/${fileId}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data, error } = await supabase
        .from('documents')
        .insert({
          client_id: clientId,
          user_id: user!.id,
          file_name: file.name,
          file_path: filePath,
          mime_type: file.type,
          category,
        })
        .select()
        .single()

      if (error) throw error

      if (file.type === 'application/pdf') {
        await supabase.functions.invoke('summarize-document', {
          body: { document_id: data.id },
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDocumentSummary(documentId: string | null) {
  return useQuery({
    queryKey: ['document-summary', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_summaries')
        .select('*')
        .eq('document_id', documentId!)
        .maybeSingle()
      if (error) throw error
      return data as DocumentSummary | null
    },
    enabled: !!documentId,
    refetchInterval: (query) => (query.state.data ? false : 3000),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      await supabase.storage.from('documents').remove([filePath])
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}
