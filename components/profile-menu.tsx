"use client"

import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, BarChart3, ShoppingBag, Shield, User, Calendar, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from '@supabase/auth-helpers-react'
import { getUserProfile } from '@/lib/services/profileService'
import { supabase } from "@/lib/supabase"
// Mock user data - replace with actual user context/API call
const mockUser = {
  type: "free", // 'free', 'premium', 'admin'
  premiumStartDate: "2024-07-05", // Date when user first paid for premium
  premiumPrice: 29.9,
}

export default function ProfileMenu(props:any) {
  const {profile} = props;
  const [isOpen, setIsOpen] = useState(false)
  
  console.log(profile);
  if (!profile) return <p>Carregando...</p>
  console.log(profile);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Avatar className="w-8 h-8 border-2 border-purple-500 cursor-pointer shadow-glow-purple">
          <Image
            src="/placeholder.svg?height=32&width=32"
            alt="Avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </Avatar>
      </SheetTrigger>
      <SheetContent className="w-80 bg-background/80 backdrop-blur-md border-border/50">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16 border-2 border-purple-500 shadow-glow-purple">
              <Image
                src="/placeholder.svg?height=64&width=64"
                alt="Avatar"
                width={64}
                height={64}
                className="object-cover"
              />
            </Avatar>
            <div>
              <SheetTitle className="text-lg text-gradient">{profile?.full_name}</SheetTitle>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
              <div className="flex items-center gap-1 mt-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-yellow-500">Premium</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-2">
          <Link href="/profile/joao.fitness">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5" />
              Meu Perfil
            </Button>
          </Link>

          <Link href="/statistics">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="w-5 h-5" />
              Minhas Estatísticas
            </Button>
          </Link>

          <Link href="/my-purchases">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              Minhas Compras
            </Button>
          </Link>

          <div className="py-2">
            {mockUser.type === "premium" ? (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20 shadow-glow-subtle">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Próxima Fatura</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vence em {(() => {
                    const startDate = new Date(mockUser.premiumStartDate)
                    const nextMonth = new Date(startDate)
                    nextMonth.setMonth(nextMonth.getMonth() + 1)
                    const today = new Date()
                    const diffTime = nextMonth.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays > 0 ? `${diffDays} dias` : "Vencida"
                  })()} dias
                </p>
                <p className="text-sm font-semibold">R$ {mockUser.premiumPrice.toFixed(2)}</p>
              </div>
            ) : mockUser.type === "free" ? (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20 shadow-glow-subtle">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Torne-se Premium</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Assine agora para ter acesso ilimitado</p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Assine Agora
                </Button>
              </div>
            ) : null}
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Button>

          {profile.user_type === "admin" && (
            <div className="pt-4 border-t border-border/50">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  Dashboard Admin
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
            onClick={() => {supabase.auth.signOut();window.location.href=`/auth`}}
          >
            <Settings className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
