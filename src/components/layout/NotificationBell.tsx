import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
} from '@/hooks/useNotifications'
import { formatDate } from '@/lib/utils'

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications()
  const unreadCount = useUnreadNotificationCount()
  const markRead = useMarkNotificationRead()
  // const generateNotifications = useGenerateNotifications()

// useEffect(() => {
//   generateNotifications.mutate()
// }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Nenhuma notificação
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => !notification.read && markRead.mutate(notification.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </span>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{notification.message}</span>
              <span className="text-xs text-muted-foreground">{notification.created_at
  ? formatDate(notification.created_at)
  : '-'}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
