"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Trophy,
  Crown,
  Bell,
  ArrowLeft,
  CheckCircle2,
  Target,
  Megaphone,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import BottomNavigation from "@/components/bottom-navigation"

interface Notification {
  id: string
  type: "like" | "comment" | "share" | "follow" | "challenge" | "admin" | "achievement" | "premium"
  user?: string
  avatar?: string
  content: string
  timestamp: string
  isRead: boolean
  actionText?: string
  image?: string
  isVerified?: boolean
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
   const [notifications, setNotifications] = useState<Notification[]>([]);
  const user = useUser();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar notificações:", error);
      } else {
        setNotifications(data);
      }
    };

    fetchNotifications();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-orange-500" fill="currentColor" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "share":
        return <Share2 className="w-4 h-4 text-green-500" />
      case "follow":
        return <UserPlus className="w-4 h-4 text-purple-500" />
      case "challenge":
        return <Target className="w-4 h-4 text-orange-500" />
      case "achievement":
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case "premium":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Megaphone className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "like":
        return "bg-orange-500/10 border-orange-500/20"
      case "comment":
        return "bg-blue-500/10 border-blue-500/20"
      case "share":
        return "bg-green-500/10 border-green-500/20"
      case "follow":
        return "bg-purple-500/10 border-purple-500/20"
      case "challenge":
        return "bg-orange-500/10 border-orange-500/20"
      case "achievement":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "premium":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "admin":
        return "bg-purple-500/10 border-purple-500/20"
      default:
        return "bg-muted/50 border-border/50"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const filterNotifications = (type: string) => {
    switch (type) {
      case "activity":
        return notifications.filter((n) => ["like", "comment", "share", "follow"].includes(n.type))
      case "challenges":
        return notifications.filter((n) => ["challenge", "achievement"].includes(n.type))
      case "important":
        return notifications.filter((n) => ["admin", "premium"].includes(n.type))
      default:
        return notifications
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 md:pb-0 relative pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

      {/* Header fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-1">
                Notificações
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-orange-500"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-4 py-3 sm:py-6 relative z-10">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-card/50 backdrop-blur-sm rounded-xl h-auto mb-4 sm:mb-6 border border-border/50 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Atividade
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="important"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Importante
            </TabsTrigger>
          </TabsList>

          {["all", "activity", "challenges", "important"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-2 sm:space-y-3">
              {filterNotifications(tabValue).length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma notificação</h3>
                  <p className="text-sm text-muted-foreground">Você está em dia com suas notificações!</p>
                </div>
              ) : (
                filterNotifications(tabValue).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer group hover:shadow-glow-subtle",
                      notification.isRead
                        ? "bg-card/30 border-border/30"
                        : "bg-card/70 border-border/70 shadow-glow-subtle",
                      getNotificationBg(notification.type),
                    )}
                  >
                    {!notification.isRead && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar ou ícone */}
                      <div className="relative flex-shrink-0">
                        {notification.avatar ? (
                          <div className="relative">
                            <Image
                              src={notification.avatar || "/placeholder.svg"}
                              alt={notification.user || "User"}
                              width={40}
                              height={40}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-border/50"
                            />
                            {notification.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border",
                              getNotificationBg(notification.type),
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-border/50 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed">
                              {notification.user && <span className="font-semibold">{notification.user} </span>}
                              {notification.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                              {!notification.isRead && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 px-1.5 text-xs bg-purple-500/20 text-purple-500 border-0"
                                >
                                  Nova
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botão de ação */}
                        {notification.actionText && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 px-3 text-xs border-purple-500/30 text-purple-500 hover:bg-purple-500/10 hover:shadow-glow-purple"
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      {/* Menu de navegação inferior (apenas mobile) */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
