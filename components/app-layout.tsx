"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import DesktopSidebar from "@/components/desktop-sidebar"
import StandardHeader from "@/components/standard-header"
import BottomNavigation from "@/components/bottom-navigation"

interface AppLayoutProps {
  children: React.ReactNode
  hideHeader?: boolean
}

export default function AppLayout({ children, hideHeader = false }: AppLayoutProps) {
  const pathname = usePathname()

  // Páginas que não devem usar o layout padrão (apenas admin)
  const excludedPages = ["/admin"]
  const shouldUseLayout = !excludedPages.includes(pathname)

  if (!shouldUseLayout) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo no topo */}
      {!hideHeader && <StandardHeader />}

      {/* Desktop Sidebar - apenas desktop */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Conteúdo principal com padding-top para compensar o header fixo */}
      <div className={`md:ml-0 pb-16 md:pb-0 ${hideHeader ? "pt-0" : "pt-20"}`}>
        {/* Conteúdo da página */}
        <main className="relative">{children}</main>
      </div>

      {/* Menu de navegação inferior (apenas mobile) */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
