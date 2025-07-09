import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BBfitness - App Fitness Social',
  description: 'App fitness social com foco em saúde, motivação, treinos, receitas e conexão entre usuários',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BBfitness',
  },
  generator: 'v0.dev',
}
