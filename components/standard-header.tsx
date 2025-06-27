"use client"

import { Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import FitcoinCounter from "@/components/fitcoin-counter"
import ProfileMenu from "@/components/profile-menu"
import { useTheme } from "@/contexts/theme-context"
import Link from "next/link"

export default function StandardHeader() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">
          <span className="text-gradient">BB</span>
          <span className="text-foreground">fitness</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0">
          <FitcoinCounter />
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="w-5 h-5 animate-glow text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Link href="/notifications">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300 relative"
            >
              <Bell className="w-5 h-5" />
              {/* Badge de notificação */}
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </div>
            </Button>
          </Link>
        </div>
        <ProfileMenu />
      </div>
    </header>
  )
}
