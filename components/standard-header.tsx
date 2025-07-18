"use client"

import { Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import FitcoinCounter from "@/components/fitcoin-counter"
import ProfileMenu from "@/components/profile-menu"
import { useTheme } from "@/contexts/theme-context"
import Link from "next/link"
import { useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/services/profileService"
import { useFitcoin } from "@/hooks/use-fitcoin"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabase"

export default function StandardHeader() {
  const { isDark, toggleTheme } = useTheme()
  const user = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const { setFitcoin } = useFitcoin()

  useEffect(() => {
    if (!user) return

    // Carrega o perfil e fitcoins
    getUserProfile(user.id)
      .then((data) => {
        setProfile(data)
        setFitcoin(data.fitcoins)
      })
      .catch(console.error)

    // Carrega total de notificações não lidas
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .then(({ count, error }) => {
        if (error) throw error
        setUnreadCount(count || 0)
      })

  }, [user])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold" style={{maxWidth: 80}}>
          <img src={!isDark ? "https://efjnuswulzfgztlwpxvu.supabase.co/storage/v1/object/public/befit//BEFIT---LOGO-PRETA.png":"https://efjnuswulzfgztlwpxvu.supabase.co/storage/v1/object/public/befit//BEFIT---LOGO-BRANCA.png"} />
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
              {unreadCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </Button>
          </Link>
        </div>
        <ProfileMenu profile={profile} />
      </div>
    </header>
  )
}
