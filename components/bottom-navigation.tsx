"use client"

import { Home, Calendar, Crown, Coins, Film } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Calendar, path: "/planner", label: "Planner" },
    { icon: Crown, path: "/premium", label: "Premium" },
    { icon: Coins, path: "/store", label: "Store" },
    { icon: Film, path: "/fitz", label: "Fitz" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/50 lg:hidden">
      <div className="flex justify-around items-center h-16 px-2 pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link href={item.path} key={item.path} className="flex-1 flex justify-center">
              <div className="flex items-center justify-center">
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive
                      ? "text-foreground scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                      : "text-muted-foreground",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
