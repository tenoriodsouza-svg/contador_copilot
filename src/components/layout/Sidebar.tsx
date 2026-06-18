import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  DollarSign,
  Bot,
  FileBarChart,
  Calculator,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/documentos', icon: FileText, label: 'Documentos' },
  { to: '/pendencias', icon: CheckSquare, label: 'Pendências' },
  { to: '/obrigacoes', icon: Calendar, label: 'Obrigações' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/assistente-ia', icon: Bot, label: 'Assistente IA' },
  { to: '/relatorios', icon: FileBarChart, label: 'Relatórios' },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Calculator className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-semibold text-sm">Contador Copilot</h1>
          <p className="text-xs text-muted-foreground">Assistente Inteligente</p>
        </div>
      </div>
      <NavLinks />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" open={open} onClose={() => setOpen(false)} className="p-0 w-64">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-sm">Contador Copilot</h1>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
