"use client"

import { supabase } from "@/lib/supabase"
import { createContext, useContext, useState, type ReactNode } from "react"
import { useUser } from '@supabase/auth-helpers-react'

interface FitcoinContextType {
  fitcoin: number
  notification: number | null
  addFitcoin: (user:any, amount: number, showNotification?: boolean) => void
  clearNotification: () => void
  showFitcoinNotification: () => void,
  setFitcoin: (amount: number) => void,
}

const FitcoinContext = createContext<FitcoinContextType | undefined>(undefined)

export function FitcoinProvider({ children }: { children: ReactNode }) {
  const [fitcoin, setFitcoin] = useState(100)
  const [notification, setNotification] = useState<number | null>(null)

  const addFitcoin = async (user:any, amount: number, showNotification = true) => {
    // Primeiro, busca o valor atual
    
    const { data: profile_att, error: fetchError } = await supabase
      .from("profiles")
      .select("fitcoins")
      .eq("id", user?.id)
      .single()

    if (fetchError) {
      console.error("Erro ao buscar perfil:", fetchError)
    }
    // Agora, incrementa e atualiza
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        fitcoins: profile_att?.fitcoins + 1
      })
      .eq("id", user?.id)

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError)
    }
    setFitcoin((prev) => prev + amount)
    if (showNotification) {
      setNotification(amount)
    }
  }

  const showFitcoinNotification = () => {
    setNotification(1)
  }

  const clearNotification = () => {
    setNotification(null)
  }

  return (
    <FitcoinContext.Provider value={{ fitcoin, notification, addFitcoin, clearNotification, showFitcoinNotification, setFitcoin }}>
      {children}
    </FitcoinContext.Provider>
  )
}

export function useFitcoin() {
  const context = useContext(FitcoinContext)
  if (context === undefined) {
    throw new Error("useFitcoin must be used within a FitcoinProvider")
  }
  return context
}
