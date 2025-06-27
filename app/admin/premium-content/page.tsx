"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PremiumContentAdmin() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 relative overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/admin">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-1 sm:gap-2">
                Dashboard Admin
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 text-xs">Online</Badge>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-4 py-3 sm:py-6">{/* Página vazia - seção Premium removida */}</main>
    </div>
  )
}
