"use client"

import { useEffect, useRef } from "react"
import { Coins } from "lucide-react"
import { useFitcoin } from "@/hooks/use-fitcoin"

export default function FitcoinCounter() {
  const { fitcoin, notification, clearNotification } = useFitcoin()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (notification) {
      // Play sound effect
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((e) => console.error("Audio play failed:", e))
      }

      // Clear notification after animation
      const timer = setTimeout(() => {
        clearNotification()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification, clearNotification])

  return (
    <div className="relative">
      <div className="flex items-center gap-1 bg-muted/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50 hover:shadow-glow-yellow transition-all duration-300 group">
        <Coins className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium text-foreground">{fitcoin}</span>
      </div>

      <audio
        ref={audioRef}
        src="https://github.com/thunderstudio021/cashmoney/raw/refs/heads/main/register-cash.mp3"
        preload="auto"
      />
    </div>
  )
}
