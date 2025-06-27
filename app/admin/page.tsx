"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Crown,
  DollarSign,
  TrendingUp,
  Video,
  Megaphone,
  MessageSquare,
  ShoppingBag,
  ArrowLeft,
  Upload,
  BarChart2,
  Activity,
  Zap,
  Sparkles,
  ExternalLink,
  ImageIcon,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Ban,
  UserCheck,
  Save,
  X,
  Play,
  Bell,
  Send,
  Clock,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import { Progress } from "@/components/ui/progress"

// Mock data para demonstração
const mockUsers = [
  { id: 1, name: "João Silva", email: "joao@email.com", isPremium: true, isBlocked: false, posts: 15 },
  { id: 2, name: "Maria Santos", email: "maria@email.com", isPremium: false, isBlocked: false, posts: 8 },
  { id: 3, name: "Pedro Costa", email: "pedro@email.com", isPremium: true, isBlocked: true, posts: 22 },
]

const mockProducts = [
  {
    id: 1,
    name: "Whey Protein",
    description: "Proteína premium",
    fitcoinPrice: 500,
    realPrice: 89.9,
    image: "/placeholder.svg",
    file: "whey-guide.pdf",
    externalLink: "https://loja.com/whey",
    sales: 45,
  },
  {
    id: 2,
    name: "Creatina",
    description: "Creatina monohidratada",
    fitcoinPrice: 300,
    realPrice: 59.9,
    image: "/placeholder.svg",
    file: "creatina-guide.pdf",
    externalLink: "https://loja.com/creatina",
    sales: 32,
  },
]

const mockFitzContent = [
  {
    id: 1,
    type: "video",
    file: "treino1.mp4",
    caption: "Treino de peito intenso",
    author: "João Silva",
    link: "/treino/peito",
    isVisible: true,
  },
  {
    id: 2,
    type: "image",
    file: "pose1.jpg",
    caption: "Pose de competição",
    author: "Maria Santos",
    link: "/poses/comp",
    isVisible: true,
  },
]

export default function AdminDashboard() {
  const [progress, setProgress] = useState(13)
  const [activeTab, setActiveTab] = useState("stats")
  const [chartData, setChartData] = useState<number[]>([35, 55, 42, 58, 63, 70, 78])
  const [isLoaded, setIsLoaded] = useState(false)

  // Estados para uploads de arquivos
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({})

  // Estados para notificações push
  const [pushNotifications, setPushNotifications] = useState([
    {
      id: 1,
      title: "🎉 Novos treinos premium disponíveis!",
      message: "Confira os exercícios exclusivos para membros premium.",
      actionText: "Ver treinos",
      actionLink: "/premium",
      type: "premium",
      status: "sent",
      sentAt: "2024-01-15T10:30:00Z",
      recipients: 3200,
    },
    {
      id: 2,
      title: "📱 Nova atualização disponível!",
      message: "Melhorias na interface e novos recursos.",
      actionText: "Atualizar",
      actionLink: "/update",
      type: "update",
      status: "sent",
      sentAt: "2024-01-14T15:45:00Z",
      recipients: 12500,
    },
    {
      id: 3,
      title: "🎯 Evento especial: Semana do Fitness!",
      message: "Participe dos desafios exclusivos e ganhe prêmios incríveis.",
      actionText: "Participar",
      actionLink: "/events",
      type: "event",
      status: "scheduled",
      scheduledFor: "2024-01-16T09:00:00Z",
      recipients: 12500,
    },
  ])
  const [showPushModal, setShowPushModal] = useState(false)
  const [editingPush, setEditingPush] = useState(null)
  const [pushForm, setPushForm] = useState({
    title: "",
    message: "",
    actionText: "",
    actionLink: "",
    type: "general",
    scheduleType: "now",
    scheduledFor: "",
  })

  // Add new state for ads management after the existing states
  const [mockAds, setMockAds] = useState([
    {
      id: 1,
      name: "Promoção Whey Protein",
      caption: "Desconto especial em suplementos premium",
      buttonText: "Comprar Agora",
      buttonLink: "/store/whey-protein",
      category: "produtos",
      image: "/placeholder.svg?height=300&width=400",
      type: "banner",
      status: "active",
      impressions: 2500,
      clicks: 180,
      placement: "feed",
    },
    {
      id: 2,
      name: "Upgrade Premium",
      caption: "Acesse conteúdos exclusivos e treinos avançados",
      buttonText: "Assinar Premium",
      buttonLink: "/premium/subscribe",
      category: "treino",
      image: "/placeholder.svg?height=300&width=400",
      type: "popup",
      status: "paused",
      impressions: 1200,
      clicks: 85,
      placement: "modal",
    },
    {
      id: 3,
      name: "Receitas Fitness",
      caption: "Descubra receitas saudáveis e saborosas",
      buttonText: "Ver Receitas",
      buttonLink: "/recipes",
      category: "receita",
      image: "/placeholder.svg?height=300&width=400",
      type: "banner",
      status: "active",
      impressions: 1800,
      clicks: 120,
      placement: "feed",
    },
  ])

  const [showAdModal, setShowAdModal] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [adForm, setAdForm] = useState({
    name: "",
    caption: "",
    buttonText: "",
    buttonLink: "",
    category: "treino",
    type: "banner",
    status: "active",
    placement: "feed",
  })

  // Função genérica para upload de arquivos
  const handleFileUpload = async (file: File, uploadKey: string) => {
    if (!file) return

    setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }))

    try {
      // Simular upload - aqui você integraria com seu serviço de upload (Supabase Storage, etc.)
      const formData = new FormData()
      formData.append("file", file)

      // Simular delay de upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simular URL do arquivo uploadado
      const fileUrl = URL.createObjectURL(file)
      setUploadedFiles((prev) => ({ ...prev, [uploadKey]: fileUrl }))

      alert(`✅ Arquivo "${file.name}" enviado com sucesso!`)
    } catch (error) {
      alert(`❌ Erro ao enviar arquivo: ${error.message}`)
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  // Componente de upload reutilizável - MODIFICADO
  const FileUploadArea = ({ uploadKey, accept, title, description, color = "purple", multiple = false }) => {
    const isUploading = uploadingFiles[uploadKey]
    const uploadedFile = uploadedFiles[uploadKey]

    const colorClasses = {
      purple: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-500",
      green: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10 text-green-500",
      blue: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500",
      orange: "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 text-orange-500",
    }

    const handleClick = () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = accept
      input.multiple = multiple
      input.onchange = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFileUpload(file, uploadKey)
      }
      input.click()
    }

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer group/upload ${colorClasses[color]}`}
        onClick={handleClick}
      >
        <div className="relative pointer-events-none">
          {isUploading ? (
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-current/20 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-current/20 flex items-center justify-center group-hover/upload:scale-110 transition-transform">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          )}
          <p className="text-xs sm:text-sm font-medium">{isUploading ? "Enviando..." : title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {uploadedFile && <p className="text-xs text-green-500 mt-2 font-medium">✅ Arquivo enviado!</p>}
        </div>
      </div>
    )
  }

  // Estados para modais e edição
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingFitz, setEditingFitz] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showFitzModal, setShowFitzModal] = useState(false)

  // Estado do banner premium
  const [bannerData, setBannerData] = useState({
    title: "Acesso Premium",
    subtitle: "Desbloqueie todos os treinos, receitas e conteúdos exclusivos!",
    buttonText: "Assinar Agora",
    buttonLink: "/subscribe",
    isActive: true,
    image: "/placeholder.svg?height=400&width=800",
  })

  // Estado do banner da loja
  const [storeBannerData, setStoreBannerData] = useState({
    buttonText: "Comprar Agora",
    buttonLink: "/store/special",
    isActive: true,
    image: "/placeholder.svg?height=400&width=800",
  })

  // Estados para Área Premium
  const [modules, setModules] = useState([])
  const [videos, setVideos] = useState([])
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingVideo, setEditingVideo] = useState(null)
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [moduleForm, setModuleForm] = useState({ modulo_nome: "" })
  const [videoForm, setVideoForm] = useState({
    video_nome: "",
    video_descricao: "",
    video_url: "",
    thumb_url: "",
    material_url: "",
  })

  // Add ad management functions after existing functions
  const handleAdCreate = () => {
    setEditingAd(null)
    setAdForm({
      name: "",
      caption: "",
      buttonText: "",
      buttonLink: "",
      category: "treino",
      type: "banner",
      status: "active",
      placement: "feed",
    })
    setShowAdModal(true)
  }

  const handleAdEdit = (ad) => {
    setEditingAd(ad.id)
    setAdForm({
      name: ad.name,
      caption: ad.caption,
      buttonText: ad.buttonText,
      buttonLink: ad.buttonLink,
      category: ad.category,
      type: ad.type,
      status: ad.status,
      placement: ad.placement,
    })
    setShowAdModal(true)
  }

  const handleAdSave = () => {
    if (!adForm.name.trim() || !adForm.caption.trim()) {
      alert("❌ Nome e legenda são obrigatórios!")
      return
    }

    const newAd = {
      id: editingAd || Date.now(),
      name: adForm.name,
      caption: adForm.caption,
      buttonText: adForm.buttonText,
      buttonLink: adForm.buttonLink,
      category: adForm.category,
      type: adForm.type,
      status: adForm.status,
      placement: adForm.placement,
      image: "/placeholder.svg?height=300&width=400",
      impressions: 0,
      clicks: 0,
    }

    if (editingAd) {
      setMockAds((prev) => prev.map((ad) => (ad.id === editingAd ? { ...ad, ...newAd } : ad)))
      alert("✅ Anúncio atualizado com sucesso!")
    } else {
      setMockAds((prev) => [newAd, ...prev])
      alert("✅ Anúncio criado com sucesso!")
    }

    setShowAdModal(false)
    setEditingAd(null)
  }

  const handleAdDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este anúncio?")) {
      setMockAds((prev) => prev.filter((ad) => ad.id !== id))
      alert("🗑️ Anúncio excluído com sucesso!")
    }
  }

  const handleAdToggleStatus = (id) => {
    setMockAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, status: ad.status === "active" ? "paused" : "active" } : ad)),
    )
    alert("✅ Status do anúncio alterado!")
  }

  const getAdIcon = (category) => {
    switch (category) {
      case "receita":
        return "🍽️"
      case "treino":
        return "💪"
      case "dança":
        return "💃"
      case "yoga":
        return "🧘"
      case "saúde":
        return "❤️"
      case "produtos":
        return "🛍️"
      default:
        return "📢"
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "receita":
        return "from-green-500 to-emerald-500"
      case "treino":
        return "from-red-500 to-pink-500"
      case "dança":
        return "from-purple-500 to-pink-500"
      case "yoga":
        return "from-blue-500 to-cyan-500"
      case "saúde":
        return "from-orange-500 to-red-500"
      case "produtos":
        return "from-yellow-500 to-orange-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  useEffect(() => {
    if (
      showUserModal ||
      showProductModal ||
      showFitzModal ||
      showModuleModal ||
      showVideoModal ||
      showPushModal ||
      showAdModal
    ) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Simulate loading
    const timer = setTimeout(() => setIsLoaded(true), 500)

    // Simulate progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 50)

    // Simulate chart data animation
    const chartInterval = setInterval(() => {
      setChartData((prev) => prev.map((v) => Math.max(20, Math.min(90, v + Math.random() * 6 - 3))))
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      clearInterval(chartInterval)
      document.body.style.overflow = "unset"
    }
  }, [showUserModal, showProductModal, showFitzModal, showModuleModal, showVideoModal, showPushModal, showAdModal])

  const handleBannerSave = () => {
    alert("Banner atualizado com sucesso! 🎉")
  }

  const handleStoreBannerSave = () => {
    alert("Banner da loja atualizado com sucesso! 🎉")
  }

  // Funções para gerenciar usuários
  const handleUserEdit = (user: any) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleUserCreate = () => {
    setEditingUser({
      id: null,
      name: "",
      username: "",
      email: "",
      whatsapp: "",
      password: "",
      userType: "free",
      isBlocked: false,
      posts: 0,
    })
    setShowUserModal(true)
  }

  const handleUserSave = () => {
    alert(`Usuário ${editingUser.id ? "atualizado" : "criado"} com sucesso!`)
    setShowUserModal(false)
    setEditingUser(null)
  }

  const handleUserDelete = (userId: number) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      alert("Usuário excluído com sucesso!")
    }
  }

  const handleUserBlock = (userId: number, isBlocked: boolean) => {
    alert(`Usuário ${isBlocked ? "desbloqueado" : "bloqueado"} com sucesso!`)
  }

  // Funções para gerenciar produtos
  const handleProductEdit = (product: any) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleProductCreate = () => {
    setEditingProduct({
      id: null,
      name: "",
      description: "",
      fitcoinPrice: 0,
      realPrice: 0,
      image: "",
      file: "",
      externalLink: "",
      sales: 0,
    })
    setShowProductModal(true)
  }

  const handleProductSave = () => {
    alert(`Produto ${editingProduct.id ? "atualizado" : "criado"} com sucesso!`)
    setShowProductModal(false)
    setEditingProduct(null)
  }

  const handleProductDelete = (productId: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      alert("Produto excluído com sucesso!")
    }
  }

  // Funções para gerenciar Fitz
  const handleFitzEdit = (fitz: any) => {
    setEditingFitz(fitz)
    setShowFitzModal(true)
  }

  const handleFitzCreate = () => {
    setEditingFitz({ id: null, type: "video", file: "", caption: "", author: "", link: "", isVisible: true })
    setShowFitzModal(true)
  }

  const handleFitzSave = () => {
    alert(`Conteúdo Fitz ${editingFitz.id ? "atualizado" : "criado"} com sucesso!`)
    setShowFitzModal(false)
    setEditingFitz(null)
  }

  const handleFitzDelete = (fitzId: number) => {
    if (confirm("Tem certeza que deseja excluir este conteúdo?")) {
      alert("Conteúdo Fitz excluído com sucesso!")
    }
  }

  const handleFitzToggleVisibility = (fitzId: number, isVisible: boolean) => {
    alert(`Conteúdo ${isVisible ? "ocultado" : "exibido"} com sucesso!`)
  }

  // Funções para Área Premium
  const handleAddModule = () => {
    if (!moduleForm.modulo_nome.trim()) return
    const newModule = {
      id: Date.now(),
      modulo_nome: moduleForm.modulo_nome,
      created_at: new Date().toISOString(),
      is_active: true,
    }
    setModules([...modules, newModule])
    setModuleForm({ modulo_nome: "" })
    setShowModuleModal(false)
    alert("Módulo criado com sucesso! 🎉")
  }

  const handleDeleteModule = () => {
    if (editingModule === null) return
    if (confirm("Tem certeza que deseja excluir este módulo?")) {
      setModules(modules.filter((m) => m.id !== editingModule))
      setVideos(videos.filter((v) => v.modulo_id !== editingModule))
      setEditingModule(null)
      setShowModuleModal(false)
      alert("Módulo excluído com sucesso! 🗑️")
    }
  }

  const handleAddVideo = () => {
    if (!videoForm.video_nome.trim() || selectedModuleId === null) return
    const newVideo = {
      id: Date.now(),
      modulo_id: selectedModuleId,
      video_nome: videoForm.video_nome,
      video_descricao: videoForm.video_descricao,
      video_url: videoForm.video_url,
      thumb_url: videoForm.thumb_url,
      material_url: videoForm.material_url,
      created_at: new Date().toISOString(),
      is_active: true,
    }
    setVideos([...videos, newVideo])
    setVideoForm({
      video_nome: "",
      video_descricao: "",
      video_url: "",
      thumb_url: "",
      material_url: "",
    })
    setSelectedModuleId(null)
    setShowVideoModal(false)
    alert("Vídeo adicionado com sucesso! 🎬")
  }

  const handleDeleteVideo = () => {
    if (editingVideo === null) return
    if (confirm("Tem certeza que deseja excluir este vídeo?")) {
      setVideos(videos.filter((v) => v.id !== editingVideo))
      setEditingVideo(null)
      setShowVideoModal(false)
      alert("Vídeo excluído com sucesso! 🗑️")
    }
  }

  const getModuleVideos = (moduleId) => {
    return videos.filter((video) => video.modulo_id === moduleId)
  }

  // Funções para notificações push
  const handlePushCreate = () => {
    setEditingPush(null)
    setPushForm({
      title: "",
      message: "",
      actionText: "",
      actionLink: "",
      type: "general",
      scheduleType: "now",
      scheduledFor: "",
    })
    setShowPushModal(true)
  }

  const handlePushEdit = (notification: any) => {
    setEditingPush(notification.id)
    setPushForm({
      title: notification.title,
      message: notification.message,
      actionText: notification.actionText || "",
      actionLink: notification.actionLink || "",
      type: notification.type,
      scheduleType: notification.status === "scheduled" ? "schedule" : "now",
      scheduledFor: notification.scheduledFor || "",
    })
    setShowPushModal(true)
  }

  const handlePushSave = () => {
    if (!pushForm.title.trim() || !pushForm.message.trim()) {
      alert("❌ Título e mensagem são obrigatórios!")
      return
    }

    const newNotification = {
      id: editingPush || Date.now(),
      title: pushForm.title,
      message: pushForm.message,
      actionText: pushForm.actionText,
      actionLink: pushForm.actionLink,
      type: pushForm.type,
      status: pushForm.scheduleType === "now" ? "sent" : "scheduled",
      sentAt: pushForm.scheduleType === "now" ? new Date().toISOString() : null,
      scheduledFor: pushForm.scheduleType === "schedule" ? pushForm.scheduledFor : null,
      recipients: 12500, // Total de usuários
    }

    if (editingPush) {
      setPushNotifications((prev) => prev.map((n) => (n.id === editingPush ? newNotification : n)))
      alert("✅ Notificação atualizada com sucesso!")
    } else {
      setPushNotifications((prev) => [newNotification, ...prev])
      if (pushForm.scheduleType === "now") {
        alert("🚀 Notificação enviada para todos os usuários!")
      } else {
        alert("⏰ Notificação agendada com sucesso!")
      }
    }

    setShowPushModal(false)
    setEditingPush(null)
  }

  const handlePushDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta notificação?")) {
      setPushNotifications((prev) => prev.filter((n) => n.id !== id))
      alert("🗑️ Notificação excluída com sucesso!")
    }
  }

  const handlePushSendNow = (id: number) => {
    if (confirm("Enviar esta notificação agora para todos os usuários?")) {
      setPushNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: "sent",
                sentAt: new Date().toISOString(),
                scheduledFor: null,
              }
            : n,
        ),
      )
      alert("🚀 Notificação enviada com sucesso!")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "premium":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "update":
        return <Zap className="w-4 h-4 text-blue-500" />
      case "event":
        return <Sparkles className="w-4 h-4 text-purple-500" />
      case "store":
        return <ShoppingBag className="w-4 h-4 text-green-500" />
      default:
        return <Bell className="w-4 h-4 text-orange-500" />
    }
  }

  const getStatusBadge = (notification: any) => {
    if (notification.status === "sent") {
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Enviada
        </Badge>
      )
    } else if (notification.status === "scheduled") {
      return (
        <Badge variant="outline" className="border-blue-500/30 text-blue-500">
          <Clock className="w-3 h-3 mr-1" />
          Agendada
        </Badge>
      )
    }
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 relative overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-1 sm:gap-2">
                Dashboard Admin
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Gerenciamento completo da plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge
              variant="outline"
              className="border-purple-500/50 text-purple-500 px-2 py-0.5 gap-1 flex items-center text-xs"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Online
            </Badge>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-glow-purple text-xs px-2 sm:px-3 h-7 sm:h-8"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Ações Rápidas</span>
              <span className="sm:hidden">Ações</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-4 py-3 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Bem-vindo, Admin</h2>
              <p className="text-sm text-muted-foreground">Gerencie sua plataforma com facilidade</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Status do sistema</p>
                <div className="flex items-center gap-1 text-green-500">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium text-sm">Operacional</span>
                </div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-purple">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-glow-subtle transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 sm:p-4 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-glow-blue">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Usuários</p>
                    <div className="flex items-end gap-1">
                      <p className="text-lg sm:text-xl font-bold text-foreground">12,500</p>
                      <span className="text-xs text-green-500 flex items-center">
                        +2.4% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="text-foreground font-medium">15,000</span>
                  </div>
                  <Progress
                    value={83}
                    className="h-1 sm:h-1.5 bg-blue-500/20"
                    indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-glow-subtle transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 sm:p-4 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-glow-yellow">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Assinantes</p>
                    <div className="flex items-end gap-1">
                      <p className="text-lg sm:text-xl font-bold text-foreground">3,200</p>
                      <span className="text-xs text-green-500 flex items-center">
                        +5.7% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="text-foreground font-medium">4,000</span>
                  </div>
                  <Progress
                    value={80}
                    className="h-1 sm:h-1.5 bg-yellow-500/20"
                    indicatorClassName="bg-gradient-to-r from-yellow-500 to-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-glow-subtle transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 sm:p-4 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-glow-green">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Assinantes Hoje</p>
                    <div className="flex items-end gap-1">
                      <p className="text-lg sm:text-xl font-bold text-foreground">R$ 1,410</p>
                      <span className="text-xs text-green-500 flex items-center">
                        +12% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="text-foreground font-medium">50</span>
                  </div>
                  <Progress
                    value={94}
                    className="h-1 sm:h-1.5 bg-green-500/20"
                    indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-glow-subtle transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-3 sm:p-4 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-glow-purple">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Vendas Fitcoin Hoje</p>
                    <div className="flex items-end gap-1">
                      <p className="text-lg sm:text-xl font-bold text-foreground">2,800</p>
                      <span className="text-xs text-green-500 flex items-center">
                        +3.2% <TrendingUp className="w-2.5 h-2.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Meta</span>
                    <span className="text-foreground font-medium">3,000</span>
                  </div>
                  <Progress
                    value={93}
                    className="h-1 sm:h-1.5 bg-purple-500/20"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="stats" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            <TabsList className="flex w-full overflow-x-auto overflow-y-hidden mb-4 sm:mb-6 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-xl gap-1 scrollbar-hide">
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <BarChart2 className="w-3 h-3 mr-1" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <Users className="w-3 h-3 mr-1" />
                Usuários
              </TabsTrigger>
              <TabsTrigger
                value="store"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <ShoppingBag className="w-3 h-3 mr-1" />
                Loja
              </TabsTrigger>
              <TabsTrigger
                value="area-premium"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <Crown className="w-3 h-3 mr-1" />
                Área Premium
              </TabsTrigger>
              <TabsTrigger
                value="fitz"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <Video className="w-3 h-3 mr-1" />
                Fitz
              </TabsTrigger>
              <TabsTrigger
                value="push-notifications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <Bell className="w-3 h-3 mr-1" />
                Notificações
              </TabsTrigger>
              <TabsTrigger
                value="ads"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <Megaphone className="w-3 h-3 mr-1" />
                Anúncios
              </TabsTrigger>
            </TabsList>

            {/* Estatísticas */}
            <TabsContent value="stats" className="space-y-4 sm:space-y-6 mt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Gráfico de Usuários */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Users className="w-5 h-5 text-blue-500" />
                      Crescimento de Usuários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Últimos 7 dias</span>
                        <span className="text-sm font-medium text-green-500">+12.5%</span>
                      </div>
                      <div className="h-32 flex items-end justify-between gap-2">
                        {chartData.map((value, index) => (
                          <div
                            key={index}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${value}%` }}
                          ></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-foreground">12,500</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-500">+342</p>
                          <p className="text-xs text-muted-foreground">Esta semana</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-500">89%</p>
                          <p className="text-xs text-muted-foreground">Ativos</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Receita */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Receita Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">R$ 95.420</p>
                        <p className="text-sm text-green-500">+15.2% vs mês anterior</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Assinaturas Premium</span>
                          <span className="text-sm font-medium">R$ 67.200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loja Fitcoin</span>
                          <span className="text-sm font-medium">R$ 28.220</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{ width: "70%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Atividade Recente */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Novo usuário premium</p>
                          <p className="text-xs text-muted-foreground">João Silva se tornou premium - há 5 min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Nova venda na loja</p>
                          <p className="text-xs text-muted-foreground">
                            Whey Protein vendido por 500 Fitcoins - há 12 min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Novo conteúdo Fitz</p>
                          <p className="text-xs text-muted-foreground">Vídeo de treino publicado - há 1h</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Controle Geral de Usuários */}
            <TabsContent value="users" className="space-y-4 sm:space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Controle Geral de Usuários</h3>
                <Button onClick={handleUserCreate} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Usuário
                </Button>
              </div>

              <div className="grid gap-4">
                {mockUsers.map((user) => (
                  <Card key={user.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{user.name}</h4>
                            <Badge variant={user.isPremium ? "default" : "secondary"}>
                              {user.isPremium ? "Premium" : "Free"}
                            </Badge>
                            {user.isBlocked && <Badge variant="destructive">Bloqueado</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.posts} posts</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleUserEdit(user)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserBlock(user.id, user.isBlocked)}
                            className={user.isBlocked ? "text-green-500" : "text-orange-500"}
                          >
                            {user.isBlocked ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                            {user.isBlocked ? "Desbloquear" : "Bloquear"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleUserDelete(user.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Loja Fitcoin */}
            <TabsContent value="store" className="space-y-4 sm:space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Loja Fitcoin</h3>
                <Button
                  onClick={handleProductCreate}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>

              {/* Banner da Loja */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-glow-subtle transition-all duration-300 mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm sm:text-base">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 flex items-center justify-center shadow-glow-orange">
                      <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    Configurar Banner da Loja
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="store-banner-active-main" className="text-sm">
                      Ativo
                    </Label>
                    <Switch
                      id="store-banner-active-main"
                      checked={storeBannerData.isActive}
                      onCheckedChange={(checked) => setStoreBannerData((prev) => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview do Banner da Loja */}
                  <div className="mb-6">
                    <Label className="text-foreground text-sm font-medium mb-2 block">Preview do Banner</Label>
                    <div className="relative w-full h-24 sm:h-32 rounded-lg overflow-hidden border border-border/50">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${storeBannerData.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/60 via-orange-500/40 to-purple-500/60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs">
                          {storeBannerData.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" /> Texto do Botão
                    </Label>
                    <Input
                      value={storeBannerData.buttonText}
                      onChange={(e) => setStoreBannerData((prev) => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="Comprar Agora"
                      className="bg-card border-border/50 focus-visible:ring-orange-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" /> Link do Botão
                    </Label>
                    <Input
                      value={storeBannerData.buttonLink}
                      onChange={(e) => setStoreBannerData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                      placeholder="/store/special"
                      className="bg-card border-border/50 focus-visible:ring-orange-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <FileUploadArea
                    uploadKey="store-banner-main"
                    accept="image/*"
                    title="Arraste uma imagem ou clique para fazer upload"
                    description="Recomendado: 1200x400px, formato JPG ou PNG"
                    color="orange"
                  />

                  <Button
                    onClick={handleStoreBannerSave}
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white border-0 shadow-glow-orange h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    Salvar Banner da Loja
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {mockProducts.map((product) => (
                  <Card key={product.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{product.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-purple-500">{product.fitcoinPrice} Fitcoins</span>
                            <span className="text-green-500">R$ {product.realPrice}</span>
                            <span className="text-blue-500">{product.sales} vendas</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleProductEdit(product)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleProductDelete(product.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Área Premium */}
            <TabsContent value="area-premium" className="space-y-4 sm:space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Área Premium</h3>
                <Button
                  onClick={() => {
                    setEditingModule(null)
                    setModuleForm({ modulo_nome: "" })
                    setShowModuleModal(true)
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Módulo
                </Button>
              </div>

              {/* Banner Premium */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:shadow-glow-subtle transition-all duration-300 mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm sm:text-base">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-purple">
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    Configurar Banner Premium
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="banner-active-main" className="text-sm">
                      Ativo
                    </Label>
                    <Switch
                      id="banner-active-main"
                      checked={bannerData.isActive}
                      onCheckedChange={(checked) => setBannerData((prev) => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview do Banner */}
                  <div className="mb-6">
                    <Label className="text-foreground text-sm font-medium mb-2 block">Preview do Banner</Label>
                    <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden border border-border/50">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${bannerData.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 drop-shadow-lg">
                          {bannerData.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 mb-3 drop-shadow-md">{bannerData.subtitle}</p>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                          {bannerData.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                        <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" /> Título
                      </Label>
                      <Input
                        value={bannerData.title}
                        onChange={(e) => setBannerData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Título do banner"
                        className="bg-card border-border/50 focus-visible:ring-purple-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                        <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" /> Link do Botão
                      </Label>
                      <Input
                        value={bannerData.buttonLink}
                        onChange={(e) => setBannerData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                        placeholder="/subscribe"
                        className="bg-card border-border/50 focus-visible:ring-purple-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" /> Legenda
                    </Label>
                    <Textarea
                      value={bannerData.subtitle}
                      onChange={(e) => setBannerData((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Descrição do banner..."
                      className="bg-card border-border/50 focus-visible:ring-purple-500 mt-1.5 min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" /> Texto do Botão
                    </Label>
                    <Input
                      value={bannerData.buttonText}
                      onChange={(e) => setBannerData((prev) => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="Assinar Agora"
                      className="bg-card border-border/50 focus-visible:ring-purple-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <FileUploadArea
                    uploadKey="premium-banner-main"
                    accept="image/*"
                    title="Arraste uma imagem ou clique para fazer upload"
                    description="Recomendado: 1200x400px, formato JPG ou PNG"
                    color="purple"
                  />

                  <Button
                    onClick={handleBannerSave}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-glow-purple h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    Salvar Banner Premium
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {modules.map((module) => {
                  const moduleVideos = getModuleVideos(module.id)
                  return (
                    <Card key={module.id} className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Video className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                {module.modulo_nome}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {moduleVideos.length} vídeo{moduleVideos.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 sm:h-8 text-xs border-border/50 text-blue-500 hover:text-blue-600"
                              onClick={() => {
                                setEditingVideo(null)
                                setSelectedModuleId(module.id)
                                setVideoForm({
                                  video_nome: "",
                                  video_descricao: "",
                                  video_url: "",
                                  thumb_url: "",
                                  material_url: "",
                                })
                                setShowVideoModal(true)
                              }}
                            >
                              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                              Adicionar Vídeo
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 sm:h-8 text-xs border-border/50"
                              onClick={() => {
                                setEditingModule(module.id)
                                setModuleForm({ modulo_nome: module.modulo_nome })
                                setShowModuleModal(true)
                              }}
                            >
                              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {moduleVideos.length > 0 && (
                          <div className="space-y-2">
                            {moduleVideos.map((video) => (
                              <div
                                key={video.id}
                                className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30"
                              >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
                                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground text-xs sm:text-sm truncate">
                                    {video.video_nome}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate">{video.video_descricao}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditingVideo(video.id)
                                      setVideoForm({
                                        video_nome: video.video_nome,
                                        video_descricao: video.video_descricao,
                                        video_url: video.video_url,
                                        thumb_url: video.thumb_url,
                                        material_url: video.material_url,
                                      })
                                      setShowVideoModal(true)
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                    onClick={() => {
                                      setEditingVideo(video.id)
                                      handleDeleteVideo()
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Fitz */}
            <TabsContent value="fitz" className="space-y-4 sm:space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-foreground">Gerenciar Fitz</h3>
                <Button onClick={handleFitzCreate} className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Fitz
                </Button>
              </div>

              <div className="grid gap-4">
                {mockFitzContent.map((fitz) => (
                  <Card key={fitz.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          {fitz.type === "video" ? (
                            <Video className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{fitz.caption}</h4>
                            <Badge variant={fitz.type === "video" ? "default" : "secondary"}>{fitz.type}</Badge>
                            {!fitz.isVisible && <Badge variant="outline">Oculto</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Por: {fitz.author}</p>
                          <p className="text-xs text-muted-foreground">{fitz.file}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleFitzEdit(fitz)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFitzToggleVisibility(fitz.id, fitz.isVisible)}
                            className={fitz.isVisible ? "text-orange-500" : "text-green-500"}
                          >
                            {fitz.isVisible ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                            {fitz.isVisible ? "Ocultar" : "Exibir"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleFitzDelete(fitz.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notificações Push */}
            <TabsContent value="push-notifications" className="space-y-4 sm:space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Notificações Push</h3>
                  <p className="text-sm text-muted-foreground">
                    Envie notificações para todos os usuários da plataforma
                  </p>
                </div>
                <Button onClick={handlePushCreate} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Notificação
                </Button>
              </div>

              {/* Estatísticas de Notificações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enviadas</p>
                        <p className="text-xl font-bold text-foreground">
                          {pushNotifications.filter((n) => n.status === "sent").length}
                        </p>
                        <p className="text-xs text-green-500">Este mês</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Agendadas</p>
                        <p className="text-xl font-bold text-foreground">
                          {pushNotifications.filter((n) => n.status === "scheduled").length}
                        </p>
                        <p className="text-xs text-blue-500">Próximas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Alcance Total</p>
                        <p className="text-xl font-bold text-foreground">12,500</p>
                        <p className="text-xs text-green-500">Usuários ativos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Notificações */}
              <div className="space-y-4">
                {pushNotifications.map((notification) => (
                  <Card key={notification.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                                {notification.title}
                              </h4>
                              {getStatusBadge(notification)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {notification.recipients.toLocaleString()} usuários
                              </span>
                              {notification.status === "sent" && notification.sentAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Enviada em {formatDate(notification.sentAt)}
                                </span>
                              )}
                              {notification.status === "scheduled" && notification.scheduledFor && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Agendada para {formatDate(notification.scheduledFor)}
                                </span>
                              )}
                            </div>
                            {notification.actionText && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Botão: {notification.actionText}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:flex-col sm:w-auto">
                          <Button size="sm" variant="outline" onClick={() => handlePushEdit(notification)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          {notification.status === "scheduled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                              onClick={() => handlePushSendNow(notification.id)}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Enviar Agora
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handlePushDelete(notification.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Anúncios */}
            <TabsContent value="ads" className="space-y-4 sm:space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sistema de Anúncios</h3>
                  <p className="text-sm text-muted-foreground">Gerencie anúncios e promoções da plataforma</p>
                </div>
                <Button
                  onClick={handleAdCreate}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Anúncio
                </Button>
              </div>

              {/* Estatísticas de Anúncios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Impressões</p>
                        <p className="text-xl font-bold text-foreground">
                          {mockAds.reduce((total, ad) => total + ad.impressions, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-500">+12% hoje</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cliques</p>
                        <p className="text-xl font-bold text-foreground">
                          {mockAds.reduce((total, ad) => total + ad.clicks, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-500">+8% hoje</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Anúncios Ativos</p>
                        <p className="text-xl font-bold text-foreground">
                          {mockAds.filter((ad) => ad.status === "active").length}
                        </p>
                        <p className="text-xs text-blue-500">de {mockAds.length} total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Anúncios Ativos */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Megaphone className="w-5 h-5 text-orange-500" />
                    Anúncios Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAds.map((ad) => (
                    <div key={ad.id} className="p-4 bg-background/50 rounded-lg border border-border/30">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(ad.category)} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
                          >
                            <span className="text-lg">{getAdIcon(ad.category)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-medium text-foreground text-sm sm:text-base">{ad.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={ad.status === "active" ? "default" : "secondary"} className="text-xs">
                                  {ad.status === "active" ? "Ativo" : "Pausado"}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {ad.placement}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {ad.category}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{ad.caption}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {ad.impressions.toLocaleString()} impressões
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {ad.clicks} cliques
                              </span>
                              {ad.buttonText && (
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  {ad.buttonText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdEdit(ad)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdToggleStatus(ad.id)}
                            className={`flex-1 sm:flex-none ${ad.status === "active" ? "text-orange-500 border-orange-500/30 hover:bg-orange-500/10" : "text-green-500 border-green-500/30 hover:bg-green-500/10"}`}
                          >
                            {ad.status === "active" ? (
                              <EyeOff className="w-3 h-3 mr-1" />
                            ) : (
                              <Eye className="w-3 h-3 mr-1" />
                            )}
                            {ad.status === "active" ? "Pausar" : "Ativar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAdDelete(ad.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {mockAds.length === 0 && (
                    <div className="text-center py-8">
                      <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum anúncio criado ainda</p>
                      <Button
                        onClick={handleAdCreate}
                        className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Anúncio
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tipos de Anúncios */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    Tipos de Anúncios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border border-border/50 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-medium text-foreground mb-1 text-sm">Banner Feed</h4>
                      <p className="text-xs text-muted-foreground">Aparece no feed principal</p>
                    </div>

                    <div className="p-4 border border-border/50 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-medium text-foreground mb-1 text-sm">Pop-up</h4>
                      <p className="text-xs text-muted-foreground">Modal promocional</p>
                    </div>

                    <div className="p-4 border border-border/50 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-medium text-foreground mb-1 text-sm">Premium</h4>
                      <p className="text-xs text-muted-foreground">Área premium</p>
                    </div>

                    <div className="p-4 border border-border/50 rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-medium text-foreground mb-1 text-sm">Loja</h4>
                      <p className="text-xs text-muted-foreground">Produtos em destaque</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Modais */}
        {showUserModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50 overflow-hidden">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingUser.id ? "Editar Usuário" : "Criar Usuário"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowUserModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <Label className="text-foreground text-sm">Nome</Label>
                  <Input
                    value={editingUser.name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="Nome completo do usuário"
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm">Usuário</Label>
                  <Input
                    value={editingUser.username || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    placeholder="@usuario"
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm">Email</Label>
                  <Input
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    type="email"
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm">WhatsApp</Label>
                  <Input
                    value={editingUser.whatsapp || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, whatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm">Alterar Senha</Label>
                  <Input
                    value={editingUser.password || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Nova senha (deixe vazio para manter atual)"
                    type="password"
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-foreground mb-2 block text-sm">Tipo de Usuário</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="free"
                        name="userType"
                        value="free"
                        checked={editingUser.userType === "free"}
                        onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="free" className="text-sm">
                        Free
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="premium"
                        name="userType"
                        value="premium"
                        checked={editingUser.userType === "premium"}
                        onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="premium" className="text-sm">
                        Premium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="produtor"
                        name="userType"
                        value="produtor"
                        checked={editingUser.userType === "produtor"}
                        onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="produtor" className="text-sm">
                        Produtor
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="admin"
                        name="userType"
                        value="admin"
                        checked={editingUser.userType === "admin"}
                        onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="admin" className="text-sm">
                        Admin
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-foreground font-medium text-sm">Bloquear Usuário</Label>
                    <p className="text-xs text-muted-foreground">Impede o acesso do usuário à plataforma</p>
                  </div>
                  <Switch
                    checked={editingUser.isBlocked || false}
                    onCheckedChange={(checked) => setEditingUser({ ...editingUser, isBlocked: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-2 p-4 border-t border-border/50 flex-shrink-0">
                <Button
                  onClick={handleUserSave}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white h-10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowUserModal(false)} className="flex-1 h-10">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {showProductModal && editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingProduct.id ? "Editar Produto" : "Criar Produto"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowProductModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <Label className="text-foreground text-sm">Nome do Produto</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Nome do produto"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Descrição</Label>
                  <Textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Descrição do produto"
                    className="mt-1 h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground text-sm">Preço Fitcoin</Label>
                    <Input
                      type="number"
                      value={editingProduct.fitcoinPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, fitcoinPrice: Number(e.target.value) })}
                      placeholder="500"
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">Preço R$</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.realPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, realPrice: Number(e.target.value) })}
                      placeholder="89.90"
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground text-sm">Link Externo</Label>
                  <Input
                    value={editingProduct.externalLink}
                    onChange={(e) => setEditingProduct({ ...editingProduct, externalLink: e.target.value })}
                    placeholder="https://loja.com/produto"
                    className="mt-1 h-9"
                  />
                </div>
                {/* Upload de Imagem */}
                <div>
                  <Label className="text-foreground text-sm">Upload de Imagem</Label>
                  <div className="mt-1">
                    <FileUploadArea
                      uploadKey={`product-image-${editingProduct.id || "new"}`}
                      accept="image/*"
                      title="Clique para fazer upload da imagem"
                      description="JPG, PNG até 5MB"
                      color="blue"
                    />
                  </div>
                </div>

                {/* Upload de Arquivo */}
                <div>
                  <Label className="text-foreground text-sm">Upload de Arquivo</Label>
                  <div className="mt-1">
                    <FileUploadArea
                      uploadKey={`product-file-${editingProduct.id || "new"}`}
                      accept=".pdf,.doc,.docx,.zip"
                      title="Clique para fazer upload do arquivo"
                      description="PDF, DOC, ZIP até 10MB"
                      color="green"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-border/50 flex-shrink-0">
                <Button
                  onClick={handleProductSave}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white h-10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowProductModal(false)} className="flex-1 h-10">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {showFitzModal && editingFitz && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingFitz.id ? "Editar Fitz" : "Criar Fitz"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowFitzModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <Label className="text-foreground text-sm">Tipo de Conteúdo</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-card"
                    value={editingFitz.type}
                    onChange={(e) => setEditingFitz({ ...editingFitz, type: e.target.value })}
                  >
                    <option value="video">Vídeo</option>
                    <option value="image">Imagem</option>
                  </select>
                </div>
                <div>
                  <Label className="text-foreground text-sm">Legenda</Label>
                  <Textarea
                    value={editingFitz.caption}
                    onChange={(e) => setEditingFitz({ ...editingFitz, caption: e.target.value })}
                    placeholder="Legenda do conteúdo"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Autor (Usuário)</Label>
                  <Input
                    value={editingFitz.author}
                    onChange={(e) => setEditingFitz({ ...editingFitz, author: e.target.value })}
                    placeholder="Nome do autor"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Link do Botão</Label>
                  <Input
                    value={editingFitz.link}
                    onChange={(e) => setEditingFitz({ ...editingFitz, link: e.target.value })}
                    placeholder="/link/do/botao"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Upload de Arquivo</Label>
                  <div className="mt-1">
                    <FileUploadArea
                      uploadKey={`fitz-${editingFitz.id || "new"}`}
                      accept="image/*,video/*,.heic,.mov,.mp4"
                      title="Formatos aceitos: .heic, .jpg, .png, .mov, .mp4"
                      description="Imagens e vídeos até 50MB"
                      color="purple"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingFitz.isVisible}
                    onCheckedChange={(checked) => setEditingFitz({ ...editingFitz, isVisible: checked })}
                  />
                  <Label className="text-foreground text-sm">Visível no Feed</Label>
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-border/50 flex-shrink-0">
                <Button
                  onClick={handleFitzSave}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white h-10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setShowFitzModal(false)} className="flex-1 h-10">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Módulo */}
        {showModuleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50 overflow-hidden">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingModule !== null ? "Editar Módulo" : "Criar Novo Módulo"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowModuleModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nome do Módulo</Label>
                  <Input
                    value={moduleForm.modulo_nome}
                    onChange={(e) => setModuleForm({ modulo_nome: e.target.value })}
                    placeholder="Ex: Treino Avançado"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-border/50 flex-shrink-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-500 border-red-500/50 hover:bg-red-500/10"
                    onClick={editingModule !== null ? handleDeleteModule : () => setShowModuleModal(false)}
                  >
                    {editingModule !== null ? "Excluir" : "Cancelar"}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    onClick={handleAddModule}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Vídeo */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50 overflow-hidden">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingVideo !== null ? "Editar Vídeo" : "Adicionar Novo Vídeo"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowVideoModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <Input
                    value={videoForm.video_nome}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, video_nome: e.target.value }))}
                    placeholder="Ex: Treino de Peito Intenso"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    value={videoForm.video_descricao}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, video_descricao: e.target.value }))}
                    placeholder="Descrição detalhada do vídeo..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Upload Material de Apoio</Label>
                  <div className="mt-1.5">
                    <FileUploadArea
                      uploadKey={`video-material-${selectedModuleId}-${editingVideo || "new"}`}
                      accept=".pdf,.doc,.docx,.zip,.txt"
                      title="Clique para fazer upload do material"
                      description="PDF, DOC, ZIP, etc."
                      color="green"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Upload Foto de Capa/Thumb</Label>
                  <div className="mt-1.5">
                    <FileUploadArea
                      uploadKey={`video-thumb-${selectedModuleId}-${editingVideo || "new"}`}
                      accept="image/*"
                      title="Clique para fazer upload da capa"
                      description="Recomendado: 400x250px"
                      color="blue"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Upload do Vídeo Principal</Label>
                  <div className="mt-1.5">
                    <FileUploadArea
                      uploadKey={`video-main-${selectedModuleId}-${editingVideo || "new"}`}
                      accept="video/*"
                      title="Clique para fazer upload do vídeo"
                      description="MP4, MOV, etc."
                      color="purple"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border/50 flex-shrink-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-500 border-red-500/50 hover:bg-red-500/10"
                    onClick={editingVideo !== null ? handleDeleteVideo : () => setShowVideoModal(false)}
                  >
                    {editingVideo !== null ? "Excluir" : "Cancelar"}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    onClick={handleAddVideo}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Notificação Push */}
        {showPushModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50 overflow-hidden">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingPush !== null ? "Editar Notificação" : "Criar Nova Notificação"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowPushModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Título da Notificação *</Label>
                  <Input
                    value={pushForm.title}
                    onChange={(e) => setPushForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: 🎉 Novos treinos premium disponíveis!"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Mensagem *</Label>
                  <Textarea
                    value={pushForm.message}
                    onChange={(e) => setPushForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Descrição detalhada da notificação..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Texto do Botão (Opcional)</Label>
                    <Input
                      value={pushForm.actionText}
                      onChange={(e) => setPushForm((prev) => ({ ...prev, actionText: e.target.value }))}
                      placeholder="Ex: Ver treinos"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Link do Botão (Opcional)</Label>
                    <Input
                      value={pushForm.actionLink}
                      onChange={(e) => setPushForm((prev) => ({ ...prev, actionLink: e.target.value }))}
                      placeholder="Ex: /premium"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo de Notificação</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-card mt-1.5"
                    value={pushForm.type}
                    onChange={(e) => setPushForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="general">Geral</option>
                    <option value="premium">Premium</option>
                    <option value="update">Atualização</option>
                    <option value="event">Evento</option>
                    <option value="store">Loja</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quando Enviar</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="now"
                        name="scheduleType"
                        value="now"
                        checked={pushForm.scheduleType === "now"}
                        onChange={(e) => setPushForm((prev) => ({ ...prev, scheduleType: e.target.value }))}
                        className="w-4 h-4 text-orange-600"
                      />
                      <Label htmlFor="now" className="text-sm">
                        Enviar Agora
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule"
                        name="scheduleType"
                        value="schedule"
                        checked={pushForm.scheduleType === "schedule"}
                        onChange={(e) => setPushForm((prev) => ({ ...prev, scheduleType: e.target.value }))}
                        className="w-4 h-4 text-orange-600"
                      />
                      <Label htmlFor="schedule" className="text-sm">
                        Agendar para depois
                      </Label>
                    </div>
                    {pushForm.scheduleType === "schedule" && (
                      <div className="ml-6">
                        <Input
                          type="datetime-local"
                          value={pushForm.scheduledFor}
                          onChange={(e) => setPushForm((prev) => ({ ...prev, scheduledFor: e.target.value }))}
                          className="mt-1.5"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Alcance da Notificação</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Esta notificação será enviada para <strong>todos os 12,500 usuários</strong> da plataforma.
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-border/50 flex-shrink-0">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPushModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    onClick={handlePushSave}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {pushForm.scheduleType === "now" ? "Enviar Agora" : "Agendar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Anúncio */}
        {showAdModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50 overflow-hidden">
            <div className="w-[85vw] bg-card rounded-lg shadow-xl h-[70vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h2 className="text-base font-semibold text-foreground">
                  {editingAd !== null ? "Editar Anúncio" : "Criar Novo Anúncio"}
                </h2>
                <Button size="icon" variant="ghost" onClick={() => setShowAdModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nome do Anúncio *</Label>
                  <Input
                    value={adForm.name}
                    onChange={(e) => setAdForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Promoção Whey Protein"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Legenda/Descrição *</Label>
                  <Textarea
                    value={adForm.caption}
                    onChange={(e) => setAdForm((prev) => ({ ...prev, caption: e.target.value }))}
                    placeholder="Descrição do anúncio..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Texto do Botão</Label>
                    <Input
                      value={adForm.buttonText}
                      onChange={(e) => setAdForm((prev) => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="Ex: Comprar Agora"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Link do Botão</Label>
                    <Input
                      value={adForm.buttonLink}
                      onChange={(e) => setAdForm((prev) => ({ ...prev, buttonLink: e.target.value }))}
                      placeholder="Ex: /store/whey-protein"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-card mt-1.5"
                      value={adForm.category}
                      onChange={(e) => setAdForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="receita">🍽️ Receita</option>
                      <option value="treino">💪 Treino</option>
                      <option value="dança">💃 Dança</option>
                      <option value="yoga">🧘 Yoga</option>
                      <option value="saúde">❤️ Saúde</option>
                      <option value="produtos">🛍️ Produtos</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo de Anúncio</Label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-card mt-1.5"
                      value={adForm.type}
                      onChange={(e) => setAdForm((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="banner">Banner</option>
                      <option value="popup">Pop-up</option>
                      <option value="story">Story</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-card mt-1.5"
                      value={adForm.status}
                      onChange={(e) => setAdForm((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Ativo</option>
                      <option value="paused">Pausado</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Posicionamento</Label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-card mt-1.5"
                      value={adForm.placement}
                      onChange={(e) => setAdForm((prev) => ({ ...prev, placement: e.target.value }))}
                    >
                      <option value="feed">Feed (Para você e Comunidade)</option>
                      <option value="modal">Modal</option>
                      <option value="header">Header</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Upload da Imagem</Label>
                  <div className="mt-1.5">
                    <FileUploadArea
                      uploadKey={`ad-image-${editingAd || "new"}`}
                      accept=".heic,.jpg,.jpeg,.png"
                      title="Clique para fazer upload da imagem"
                      description="Formatos: .heic, .jpg, .png até 5MB"
                      color="orange"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg`}>{getAdIcon(adForm.category)}</span>
                    <span className="text-sm font-medium">Preview da Categoria</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Categoria: <strong className="capitalize">{adForm.category}</strong> • Tipo:{" "}
                    <strong className="capitalize">{adForm.type}</strong> • Status:{" "}
                    <strong className="capitalize">{adForm.status === "active" ? "Ativo" : "Pausado"}</strong>
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-border/50 flex-shrink-0">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAdModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    onClick={handleAdSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Anúncio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
