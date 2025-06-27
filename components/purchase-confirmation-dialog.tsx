"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

interface PurchaseConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
}

export function PurchaseConfirmationDialog({ isOpen, onClose, productTitle }: PurchaseConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Compra realizada com sucesso!</span>
          </DialogTitle>
          <DialogDescription>
            Você adquiriu <span className="font-medium">{productTitle}</span> com sucesso.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button asChild className="btn-neon-purple">
            <Link href="/my-purchases">Ir para Minhas Compras</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
