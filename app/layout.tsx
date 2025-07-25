import type React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { FitcoinProvider } from '@/hooks/use-fitcoin'
import { ThemeProvider } from '@/contexts/theme-context'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { ClientProviders } from './client-providers'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <FitcoinProvider>
            
              <div className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
                <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
                <ClientProviders>{children}</ClientProviders>
                
              </div>
          </FitcoinProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
