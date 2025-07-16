"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera, Save } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    displayName: "Maria Silva",
    username: "maria.fitness",
    bio: "🏋️‍♀️ Apaixonada por fitness • 💪 Transformação é meu lema • 🥗 Vida saudável sempre",
    avatar: "/placeholder.svg?height=120&width=120",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  

  useEffect(() => {
  const fetchProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) return

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!error && data) {
      setFormData({
        displayName: data.full_name || "",
        username: data.username || "",
        bio: data.bio || "",
        avatar: data.avatar_url || "/placeholder.svg",
      })
    }
  }

  fetchProfile()
}, [])

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
  setIsLoading(true)

  let avatarUrl = formData.avatar

if (selectedFile) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fileExt = selectedFile.name.split(".").pop()
  const fileName = `${user!.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from("befit")
    .upload(filePath, selectedFile, {
      cacheControl: "3600",
      upsert: true,
    })

  if (uploadError) {
    toast({
      title: "Erro ao enviar imagem", 
      description: uploadError.message,
      variant: "destructive",
    })
    setIsLoading(false)
    return
  }

  // Recuperar a URL pública
  const { data } = supabase.storage.from("befit").getPublicUrl(filePath)
  avatarUrl = data.publicUrl
}

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    toast({
      title: "Erro ao salvar",
      description: "Não foi possível identificar o usuário.",
      variant: "destructive",
    })
    setIsLoading(false)
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.displayName,
      username: formData.username,
      bio: formData.bio,
      avatar_url: avatarUrl
    })
    .eq("id", user.id)

  setIsLoading(false)

  if (error) {
    toast({
      title: "Erro ao salvar",
      description: error.message,
      variant: "destructive",
    })
    return
  }

  toast({
    title: "Perfil Atualizado! ✅",
    description: "Suas informações foram salvas com sucesso",
  })
  router.back()
}

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setSelectedFile(file)

    // Preview
    const previewUrl = URL.createObjectURL(file)
    setFormData((prev) => ({ ...prev, avatar: previewUrl }))

    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "Upload de imagem será implementado em breve",
    })
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Editar Perfil</h1>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-purple-500/20">
                <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback className="text-2xl">
                  {formData.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatarInput"
                onChange={handleAvatarChange}
              />
              <Button variant="outline" onClick={() => document.getElementById("avatarInput")?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
            </div>

            {/* Nome de exibição */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            {/* Nome de usuário */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="@seunome"
              />
              <p className="text-xs text-muted-foreground">
                Seu nome de usuário deve ser único e pode conter apenas letras, números e pontos.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={4}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/160 caracteres</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
