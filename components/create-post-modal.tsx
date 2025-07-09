"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreatePost from "@/components/create-post"

export default function CreatePostModal({profile}:any) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="btn-neon-purple gap-2">
        <Plus className="w-4 h-4" />
        Criar Publicação
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 bg-background">
          <CreatePost profile={profile} location="foryou" onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
