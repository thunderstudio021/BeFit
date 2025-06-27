"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PurchaseSuccessNotificationProps {
  productTitle: string
  onClose: () => void
}

export function PurchaseSuccessNotification({ productTitle, onClose }: PurchaseSuccessNotificationProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-green-400/30 backdrop-blur-sm max-w-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-sm">Compra realizada!</p>
              <p className="text-xs opacity-90">{productTitle} adquirido</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 w-6 p-0" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
