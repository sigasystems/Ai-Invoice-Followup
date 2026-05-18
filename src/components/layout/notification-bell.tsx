"use client"

import * as React from "react"
import { Bell, Check, Trash2, Mail, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotificationStore, NotificationItem } from "@/store/use-notification-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export function NotificationBell() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore()
  const addNotification = useNotificationStore(state => state.addNotification)
  const mountTimeRef = React.useRef<Date>(new Date())

  React.useEffect(() => {
    setMounted(true)
    mountTimeRef.current = new Date()
  }, [])

  // Poll database activity logs to sync them into global notifications in real-time
  React.useEffect(() => {
    if (!mounted) return

    const pollActivities = async () => {
      try {
        const res = await fetch("/api/activity")
        if (!res.ok) return
        const activities = await res.json()

        activities.forEach((act: any) => {
          const actTime = new Date(act.timestamp)
          const isRecent = actTime >= mountTimeRef.current

          const exists = notifications.some(n => n.id === act.id)
          if (!exists) {
            let title = "System Alert"
            if (act.eventType === "DRAFT_CREATED") {
              title = "Gmail Draft Created"
            } else if (act.eventType === "FOLLOWUP_SENT") {
              title = "AI Followup Sent"
            } else if (act.eventType === "STATUS_CHANGED") {
              title = "Invoice Status Changed"
            } else if (act.eventType === "INVOICE_CREATED") {
              title = "New Invoice Created"
            }

            addNotification({
              id: act.id,
              title,
              description: act.description,
              invoiceId: act.invoiceId || undefined,
              timestamp: act.timestamp,
            })

            if (isRecent) {
              if (act.eventType === "DRAFT_CREATED") {
                toast.success("n8n Webhook: Gmail Draft Created!", {
                  description: act.description,
                  action: {
                    label: "View Invoice",
                    onClick: () => router.push(`/invoices/${act.invoiceId}`)
                  }
                })
              } else {
                toast.info(title, {
                  description: act.description,
                })
              }
            }
          }
        })
      } catch (error) {
        console.error("Failed to poll activities:", error)
      }
    }

    pollActivities()
    const interval = setInterval(pollActivities, 4000)
    return () => clearInterval(interval)
  }, [mounted, notifications, addNotification, router])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
        <Bell className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const unreadCount = unreadNotifications.length

  const handleNotificationClick = (n: NotificationItem) => {
    markAsRead(n.id)
    if (n.invoiceId) {
      router.push(`/invoices/${n.invoiceId}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger nativeButton={true} render={
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative hover:bg-muted/50 transition-colors">
          <Bell className={`h-4 w-4 transition-transform ${unreadCount > 0 ? "animate-[swing_1s_ease-in-out_infinite] text-primary" : "text-muted-foreground"}`} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-3.5 min-w-3.5 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center  border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      } />
      <DropdownMenuContent className="w-80 sm:w-96" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20">
          <span className="font-bold text-sm text-foreground">Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-muted-foreground font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4 gap-2">
              <div className="p-3 bg-muted/40 rounded-full text-muted-foreground/60">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">You are all caught up!</p>
              <p className="text-[11px] text-muted-foreground/60">No new follow-ups or alerts recorded.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-3 p-3 cursor-pointer border-b last:border-0 hover:bg-muted/40 transition-colors focus:bg-muted/50 ${!n.read ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${n.title.toLowerCase().includes("draft") ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                  }`}>
                  {n.title.toLowerCase().includes("draft") ? <Mail className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className={`text-xs truncate ${!n.read ? "font-bold" : "font-medium"}`}>{n.title}</p>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.description}</p>
                  <p className="text-[9px] text-muted-foreground/60">
                    {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
