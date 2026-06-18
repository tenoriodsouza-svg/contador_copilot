import { AlertTriangle, Info } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentSummary } from '@/hooks/useDocuments'
import type { DocumentWithClient } from '@/types/database'

interface SummaryPanelProps {
  document: DocumentWithClient | null
  open: boolean
  onClose: () => void
}

export function SummaryPanel({ document, open, onClose }: SummaryPanelProps) {
  const { data: summary, isLoading } = useDocumentSummary(
    document?.mime_type === 'application/pdf' ? document?.id ?? null : null
  )

  const keyInfo = summary?.key_info as Record<string, string> | undefined
  const alerts = (summary?.alerts as string[]) || []

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent open={open} onClose={onClose}>
        <SheetHeader>
          <SheetTitle>Resumo do Documento</SheetTitle>
        </SheetHeader>
        {document && (
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-medium">{document.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {document.clients?.razao_social} — {document.category}
              </p>
            </div>

            {document.mime_type !== 'application/pdf' ? (
              <p className="text-sm text-muted-foreground">
                Resumo automático disponível apenas para arquivos PDF.
              </p>
            ) : isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : summary ? (
              <>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm leading-relaxed">{summary.summary}</p>
                </div>

                {keyInfo && Object.keys(keyInfo).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4" /> Informações Principais
                    </h4>
                    <dl className="space-y-1">
                      {Object.entries(keyInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <dt className="text-muted-foreground capitalize">{key}:</dt>
                          <dd className="font-medium">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {alerts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" /> Alertas
                    </h4>
                    <ul className="space-y-1">
                      {alerts.map((alert, i) => (
                        <li key={i} className="text-sm text-amber-700 bg-amber-50 rounded p-2">
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Gerando resumo... Aguarde alguns segundos.
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
