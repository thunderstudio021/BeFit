"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface FitcoinContextType {
  fitcoin: number
  notification: number | null
  addFitcoin: (amount: number, showNotification?: boolean) => void
  clearNotification: () => void
  showFitcoinNotification: () => void
}

const FitcoinContext = createContext<FitcoinContextType | undefined>(undefined)

export function FitcoinProvider({ children }: { children: ReactNode }) {
  const [fitcoin, setFitcoin] = useState(100)
  const [notification, setNotification] = useState<number | null>(null)

  const addFitcoin = (amount: number, showNotification = true) => {
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
    <FitcoinContext.Provider value={{ fitcoin, notification, addFitcoin, clearNotification, showFitcoinNotification }}>
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
