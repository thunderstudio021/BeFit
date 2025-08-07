"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ImageIcon, Smile, BarChart2, Type, FileVideo, Plus, X, ChevronDown, Clock, Trophy } from "lucide-react"
import { useFitcoin } from "@/hooks/use-fitcoin"
import { supabase } from "@/lib/supabase"
import { useUser } from "@supabase/auth-helpers-react"

interface CreatePostProps {
  onClose?: () => void
  className?: string
  onPostCreated?: () => void
  location:string
  profile:any
}

export default function CreatePost({ location, onClose, className, onPostCreated, profile }: CreatePostProps) {
  const [activeTab, setActiveTab] = useState("text")
  const [postText, setPostText] = useState("")
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [challengeTitle, setChallengeTitle] = useState("")
  const [challengeDays, setChallengeDays] = useState(7)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addFitcoin } = useFitcoin()
  const user = useUser();

  // Cores vibrantes para status
  const backgroundColors = [
    "from-purple-600 to-blue-600",
    "from-pink-500 to-purple-600",
    "from-orange-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-blue-500 to-cyan-500",
    "from-yellow-500 to-orange-500",
  ]

  // Função para limpar posts antigos se necessário
  const cleanupOldPosts = (posts: any[]) => {
    const MAX_POSTS = 50 // Máximo de 50 posts salvos
    const MAX_SIZE_MB = 3 // Máximo de 3MB para posts

    // Se há muitos posts, manter apenas os mais recentes
    if (posts.length > MAX_POSTS) {
      posts = posts.slice(0, MAX_POSTS)
    }

    // Calcular tamanho aproximado e remover posts com mídia se necessário
    const postsString = JSON.stringify(posts)
    const sizeInMB = new Blob([postsString]).size / (1024 * 1024)

    if (sizeInMB > MAX_SIZE_MB) {
      // Remover posts com imagens/vídeos primeiro (que ocupam mais espaço)
      const postsWithoutMedia = posts.filter((post) => !post.image && !post.videoThumbnail)
      const postsWithMedia = posts.filter((post) => post.image || post.videoThumbnail)

      // Manter apenas alguns posts com mídia
      const limitedMediaPosts = postsWithMedia.slice(0, 10)

      return [...postsWithoutMedia, ...limitedMediaPosts].slice(0, MAX_POSTS)
    }

    return posts
  }

  // Função para tentar salvar no localStorage com fallback
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.warn("Erro ao salvar no localStorage:", error)

      // Tentar limpar dados antigos e salvar novamente
      try {
        // Limpar posts muito antigos
        const cleanedData = cleanupOldPosts(data)
        localStorage.setItem(key, JSON.stringify(cleanedData))
        return true
      } catch (secondError) {
        console.error("Erro mesmo após limpeza:", secondError)

        // Como último recurso, limpar completamente e salvar apenas o novo post
        try {
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(key, JSON.stringify([data[0]]))
            return true
          }
        } catch (finalError) {
          console.error("Erro final ao salvar:", finalError)
          return false
        }
      }
    }
    return false
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "image/heif",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ]

  if (!allowedTypes.includes(file.type)) {
    window.dispatchEvent(
      new CustomEvent("showNotification", {
        detail: {
          type: "error",
          title: "Formato Inválido! ⚠️",
          message: "Use .jpg, .png, .heic, .mp4 ou .mov",
        },
      })
    )
    return
  }

  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    window.dispatchEvent(
      new CustomEvent("showNotification", {
        detail: {
          type: "error",
          title: "Arquivo Muito Grande! ⚠️",
          message: "Tamanho máximo: 50MB",
        },
      })
    )
    return
  }

  setSelectedMedia(file)
  setActiveTab("media")

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string

    if (file.type.startsWith("image/")) {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7)
          setMediaPreview(compressedDataUrl)
        } else {
          setMediaPreview(result)
        }
      }
      img.src = result
    } else {
      setMediaPreview(result)
    }
  }
  reader.readAsDataURL(file)
}


  const handleMediaButtonClick = () => {
    setActiveTab("media")
    fileInputRef.current?.click()
  }

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""])
    }
  }

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions]
      newOptions.splice(index, 1)
      setPollOptions(newOptions)
    }
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const handlePublish = async () => {
  try {
    const currentUser = localStorage.getItem("currentUser") || "João Silva"

    if (isPublishDisabled()) return

    let uploadedMediaUrl: string | null = null

    // Upload da mídia para o Supabase Storage
    // Upload da mídia para o endpoint de compressão
    if (activeTab === "media" && selectedMedia) {
      const formData = new FormData()
      formData.append("file", selectedMedia)

      const xhr = new XMLHttpRequest()

      // Cria uma promise para aguardar o término do upload
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              uploadedMediaUrl = response.url
              resolve()
            } catch (e) {
              reject(new Error("Resposta inválida do servidor."))
            }
          } else {
            reject(new Error("Erro no upload: " + xhr.responseText))
          }
        }

        xhr.onerror = () => {
          reject(new Error("Erro de rede durante upload."))
        }

        xhr.send(formData)
      })

      xhr.open("POST", "/api/upload", true)
      xhr.send(formData)

      await uploadPromise
    }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user?.id,
      type: activeTab === "media" ? (selectedMedia?.type.startsWith("video") ? "video" : "photo") : activeTab,
      content: postText,
      image_url: activeTab === "media" && selectedMedia?.type.startsWith("image") ? uploadedMediaUrl : undefined,
      video_url: activeTab === "media" && selectedMedia?.type.startsWith("video") ? uploadedMediaUrl : undefined,
      background_color: activeTab === "status" ? selectedColor : undefined,
      poll_options: activeTab === "poll" ? pollOptions.filter((opt) => opt.trim() !== "") : (activeTab === "challenge" ? {title: challengeTitle, days: challengeDays} : undefined),
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      is_premium_content: false,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      location,
    })

    if (insertError) {
      throw insertError
    }

    const newPost = {
      id: `post-${Date.now()}`,
      type: activeTab === "media" ? (selectedMedia?.type.startsWith("video") ? "video" : "photo") : activeTab,
      user: currentUser,
      avatar: "/placeholder.svg?height=40&width=40",
      content: postText,
      image_url: activeTab === "media" && selectedMedia?.type.startsWith("image") ? uploadedMediaUrl : undefined,
      video_url: activeTab === "media" && selectedMedia?.type.startsWith("video") ? uploadedMediaUrl : undefined,
      background_color: activeTab === "status" ? selectedColor : undefined,
      poll_options: activeTab === "poll" ? pollOptions.filter((opt) => opt.trim() !== "") : undefined,
      challengeTitle: activeTab === "challenge" ? challengeTitle : undefined,
      challengeDays: activeTab === "challenge" ? challengeDays : undefined,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      is_premium_content: false,
      updated_at: new Date().toISOString(),
      createdAt: Date.now(),
    }

    const savedPosts = JSON.parse(localStorage.getItem("userPosts") || "[]")
    const updatedPosts = [newPost, ...savedPosts]
    const cleanedPosts = cleanupOldPosts(updatedPosts)
    const saved = saveToLocalStorage("userPosts", cleanedPosts)

    if (!saved) throw new Error("Não foi possível salvar o post. Espaço de armazenamento insuficiente.")

    addFitcoin(user, 1)

    window.dispatchEvent(
      new CustomEvent("showFitcoinNotification", {
        detail: { amount: 1, reason: "Publicar post" },
      })
    )

    window.dispatchEvent(
      new CustomEvent("showNotification", {
        detail: { type: "success", title: "Post Publicado! 📝", message: "Seu post foi publicado com sucesso!" },
      })
    )

    setPostText("")
    setSelectedColor(null)
    setSelectedMedia(null)
    setMediaPreview(null)
    setPollOptions(["", ""])
    setChallengeTitle("")
    setChallengeDays(7)
    setActiveTab("text")

    onPostCreated?.()
    onClose?.()
  } catch (error) {
    console.error("Erro ao publicar post:", error)
    window.dispatchEvent(
      new CustomEvent("showNotification", {
        detail: {
          type: "error",
          title: "Erro ao Publicar! ❌",
          message: error instanceof Error ? error.message : "Erro ao publicar. Tente novamente.",
        },
      })
    )
  }
}


  const isPublishDisabled = () => {
    switch (activeTab) {
      case "text":
        return postText.trim() === ""
      case "media":
        return selectedMedia === null
      case "status":
        return postText.trim() === "" || selectedColor === null
      case "poll":
        return postText.trim() === "" || pollOptions.filter((opt) => opt.trim() !== "").length < 2
      case "challenge":
        return postText.trim() === "" || challengeTitle.trim() === ""
      default:
        return true
    }
  }

  return (
    <div className={cn("bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl", className)}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 border-2 border-purple-500">
            <Image
              src={profile.avatar_url || "/placeholder.svg?height=40&width=40"}
              alt="Avatar"
              width={40}
              height={40}
              className="object-cover"
            />
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{profile?.full_name}</p>
            <p className="text-xs text-muted-foreground">@{profile?.username}</p>
          </div>
        </div>

        {/* Textarea principal */}
        <div className="mb-4">
          <Textarea
            placeholder="O que você está pensando?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-muted/50 rounded-xl p-3 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[100px]"
          />
        </div>

        {/* Input de arquivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,video/mp4,video/quicktime,video/x-msvideo"
          onChange={handleMediaChange}
        />

        {/* Conteúdo específico baseado no tipo selecionado */}
        {activeTab === "media" && (
          <div className="mb-4">
            {mediaPreview ? (
              <div className="relative border border-border/50 rounded-lg overflow-hidden">
                {selectedMedia?.type.startsWith("image") ? (
                  <div className="relative w-full h-48">
                    <Image src={mediaPreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-black flex items-center justify-center">
                    <video src={mediaPreview} className="max-h-full max-w-full" controls preload="metadata" />
                  </div>
                )}
                <button
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
                  onClick={() => {
                    setSelectedMedia(null)
                    setMediaPreview(null)
                    setActiveTab("text")
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Info do arquivo */}
                <div className="absolute bottom-2 left-2 bg-black/60 rounded px-2 py-1 text-white text-xs">
                  {selectedMedia?.name} ({((selectedMedia?.size || 0) / 1024 / 1024).toFixed(1)}MB)
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">Clique para adicionar foto ou vídeo</p>
                <p className="text-xs text-muted-foreground">Formatos suportados: JPG, PNG, HEIC, MP4, MOV</p>
                <p className="text-xs text-muted-foreground mt-1">Tamanho máximo: 10MB</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "status" && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 text-foreground">Escolha uma cor de fundo:</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {backgroundColors.map((color, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-10 h-10 rounded-full bg-gradient-to-r transition-transform",
                    color,
                    selectedColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-105",
                  )}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>

            {selectedColor && (
              <div className={cn("p-4 rounded-xl bg-gradient-to-r mb-3 shadow-glow-subtle", selectedColor)}>
                <p className="text-white text-lg font-medium text-center">{postText || "Digite seu status..."}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "poll" && (
          <div className="space-y-3 mb-4">
            <p className="text-sm font-medium mb-2 text-foreground">Opções da enquete:</p>

            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handlePollOptionChange(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                  className="flex-1 bg-muted/50 focus:ring-purple-500"
                />
                {index > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => handleRemovePollOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {pollOptions.length < 5 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                onClick={handleAddPollOption}
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar opção
              </Button>
            )}
          </div>
        )}

        {activeTab === "challenge" && (
          <div className="space-y-4 mb-4">
            <div>
              <p className="text-sm font-medium mb-2 text-foreground">Título do desafio:</p>
              <Input
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="Ex: 30 dias de cardio"
                className="bg-muted/50 focus:ring-purple-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground">Duração do desafio:</p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <select
                    value={challengeDays}
                    onChange={(e) => setChallengeDays(Number(e.target.value))}
                    className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="3">3 dias</option>
                    <option value="5">5 dias</option>
                    <option value="7">7 dias</option>
                    <option value="14">14 dias</option>
                    <option value="21">21 dias</option>
                    <option value="30">30 dias</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="flex items-center gap-1 bg-muted/50 px-3 py-2 rounded-md">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Diário</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg shadow-glow-orange">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white">{challengeTitle || "Título do desafio"}</h3>
              </div>
              <p className="text-sm text-white/90 mb-3">{postText || "Descrição do desafio..."}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">{challengeDays} dias</span>
                <Button size="sm" variant="secondary" className="text-xs h-7">
                  Participar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra inferior com ícones e botão publicar */}
      <div className="border-t border-border/50 p-3 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-all duration-300",
              activeTab === "text"
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "hover:bg-purple-500/10 hover:text-purple-500",
            )}
            onClick={() => setActiveTab("text")}
          >
            <Type className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-all duration-300 relative",
              activeTab === "media"
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "hover:bg-purple-500/10 hover:text-purple-500",
            )}
            onClick={handleMediaButtonClick}
          >
            <FileVideo className="w-5 h-5" />
            {selectedMedia && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-background"></div>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-all duration-300",
              activeTab === "status"
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "hover:bg-purple-500/10 hover:text-purple-500",
            )}
            onClick={() => setActiveTab("status")}
          >
            <Smile className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-all duration-300",
              activeTab === "poll"
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "hover:bg-purple-500/10 hover:text-purple-500",
            )}
            onClick={() => setActiveTab("poll")}
          >
            <BarChart2 className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-all duration-300",
              activeTab === "challenge"
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "hover:bg-purple-500/10 hover:text-purple-500",
            )}
            onClick={() => setActiveTab("challenge")}
          >
            <Trophy className="w-5 h-5" />
          </Button>
        </div>

        <Button className="btn-neon-purple" disabled={isPublishDisabled()} onClick={handlePublish}>
          Publicar
        </Button>
      </div>
    </div>
  )
}
