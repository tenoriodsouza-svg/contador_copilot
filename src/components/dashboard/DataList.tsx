import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DataListProps {
  title: string
  items: { id: string; primary: string; secondary?: string; badge?: string; urgent?: boolean }[]
  emptyMessage?: string
}

export function DataList({ title, items, emptyMessage = 'Nenhum item encontrado' }: DataListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{emptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex items-start justify-between gap-2 rounded-lg border p-3 ${
                  item.urgent ? 'border-destructive/50 bg-destructive/5' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${item.urgent ? 'text-destructive' : ''}`}>
                    {item.primary}
                  </p>
                  {item.secondary && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.secondary}</p>
                  )}
                </div>
                {item.badge && (
                  <span className="text-xs text-muted-foreground shrink-0">{item.badge}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
