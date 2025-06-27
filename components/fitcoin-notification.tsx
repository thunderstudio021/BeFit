"use client"

import { useEffect, useRef } from "react"
import { Coins } from "lucide-react"
import { useFitcoin } from "@/hooks/use-fitcoin"

export default function FitcoinNotification() {
  const { notification, clearNotification } = useFitcoin()
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

  if (!notification) return null

  return (
    <>
      {/* Audio element */}
      <audio
        ref={audioRef}
        src="https://github.com/thunderstudio021/cashmoney/raw/refs/heads/main/register-cash.mp3"
        preload="auto"
      />

      {/* Notification balloon */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none">
        <div className="animate-in slide-in-from-top-4 duration-500 animate-out slide-out-to-top-4 delay-2500">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-full shadow-2xl border border-purple-400/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Coins className="w-6 h-6 text-yellow-400 animate-pulse" />
                <div className="absolute inset-0 w-6 h-6 text-yellow-400 animate-ping opacity-75">
                  <Coins className="w-6 h-6" />
                </div>
              </div>
              <span className="font-bold text-lg">+{notification} FITCOIN</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
