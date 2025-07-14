"use client"

import { useEffect, useState } from "react"
import { Home, Calendar, Crown, Coins, Film, ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useUser } from "@supabase/auth-helpers-react"
import { getUserProfile } from "@/lib/services/profileService"

export default function DesktopSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = useUser()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    getUserProfile(user.id)
      .then((data) => {setProfile(data);console.log('ai ze da manga', data);})
      .catch((err) => console.error(err))
  }, [user])

  const navItems = [
    { icon: Home, path: "/", label: "Home", premium: false },
    { icon: Calendar, path: "/planner", label: "Planner", premium: true },
    { icon: Crown, path: "/premium", label: "Premium", premium: true },
    { icon: Coins, path: "/store", label: "Store", premium: true },
    { icon: Film, path: "/fitz", label: "Fitz", premium: true },
  ]

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-background/80 backdrop-blur-md pt-20 flex flex-col transition-all duration-300 z-40 border-r border-border/20",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Navigation Items */}
        <div className={cn("flex flex-col space-y-1 px-3 flex-1", isCollapsed ? "overflow-hidden" : "overflow-y-auto")}>
          {navItems.map((item) => {
            const isActive = pathname === item.path
            if(item.premium){
              if(profile?.user_type == "free"){
                return (<></>)
              }
            }
            return (
              <Link href={item.path} key={item.path} className="w-full">
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 relative group",
                    isActive
                      ? "bg-purple-500/10 text-purple-500 font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    isCollapsed && "justify-center",
                  )}
                >
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && <span>{item.label}</span>}

                  {/* Tooltip para modo collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-background border border-border/50 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* User Profile */}
        <div className={cn("p-4 mt-auto", isCollapsed && "p-2 flex flex-col items-center")}>
          {isCollapsed ? (
            // Avatar pequeno quando colapsado
            <div className="relative group mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500 cursor-pointer hover:scale-110 transition-transform">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              {/* Tooltip para o perfil */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-background border border-border/50 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg bottom-0">
                João Silva
              </div>
            </div>
          ) : (
            // Perfil completo quando expandido
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500">
                <Image
                  src={profile?.avatar_url || "/placeholder.svg?height=32&width=32"}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
              </div>
            </div>
          )}

          {/* Toggle Button - Agora posicionado abaixo do perfil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "h-6 w-6 rounded-md hover:bg-muted/50 transition-all duration-200 opacity-60 hover:opacity-100",
              isCollapsed ? "mx-auto" : "ml-auto mr-2",
            )}
            aria-label={isCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Spacer para o conteúdo principal */}
      <div className={cn("transition-all duration-300", isCollapsed ? "w-16" : "w-64")} />
    </>
  )
}
