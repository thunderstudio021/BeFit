"use client"

import { Home, Calendar, Crown, Coins, Film } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function SideNavigation() {
  const pathname = usePathname()

  // Restaurar os itens de navegação originais com os mesmos ícones
  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Calendar, path: "/planner", label: "Planner" },
    { icon: Crown, path: "/premium", label: "Premium" },
    { icon: Coins, path: "/store", label: "Store" },
    { icon: Film, path: "/fitz", label: "Fitz" },
  ]

  return (
    <div className="h-full bg-background/80 backdrop-blur-md border-r border-border/50 pt-4 flex flex-col">
      <div className="px-6 mb-6">
        <Link href="/" className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-glow-purple">
            <span className="text-white font-bold text-lg">BB</span>
          </div>
          <span className="ml-2 text-xl font-bold">
            <span className="text-gradient">BB</span>
            <span className="text-foreground">fitness</span>
          </span>
        </Link>
      </div>

      <div className="flex flex-col space-y-1 px-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link href={item.path} key={item.path} className="w-full">
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-purple-500/10 text-purple-500 font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer">
          <Avatar className="w-8 h-8 border-2 border-purple-500">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Avatar"
              width={32}
              height={32}
              className="object-cover"
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">João Silva</p>
            <p className="text-xs text-muted-foreground truncate">@joao.fitness</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Avatar({ className, children }) {
  return <div className={cn("rounded-full overflow-hidden", className)}>{children}</div>
}
