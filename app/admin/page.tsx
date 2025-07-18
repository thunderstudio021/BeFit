"use client"
import Image from "next/image"
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
import { supabase } from "@/lib/supabase"
import { useUser } from "@/hooks/useUser"





export default function AdminDashboard() {
  const [progress, setProgress] = useState(13)
  const [activeTab, setActiveTab] = useState("stats")
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useUser();
  const [mockFitzContent, setMockFitzContent] = useState([
  {
    id: 1,
    type: "video",
    file: "treino1.mp4",
    caption: "Treino de peito intenso",
    author: "João Silva",
    link: "/treino/peito",
    isVisible: true,
  },
])

  const [mockUsers, setMockUsers] = useState([
    { id: 1, full_name: "", email: "", is_premium: true, is_blocked: false, posts_count: 0,user_type:"" }
  ]);

  const [mockProducts, setMockProducts] = useState([
    {
      id: 1,
      name: "Whey Protein",
      description: "Proteína premium",
      fitcoin_price: 500,
      real_price: 89.9,
      image_url: "/placeholder.svg",
      file_url: "whey-guide.pdf",
      external_link: "https://loja.com/whey",
      sales_count: 45,
    }
  ]);

  // Estados para uploads de arquivos
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({})

  // Estados para notificações push
  const [pushNotifications, setPushNotifications] = useState([
    {
      id: 1,
      title: "🎉 Novos treinos premium disponíveis!",
      message: "Confira os exercícios exclusivos para membros premium.",
      action_text: "Ver treinos",
      action_link: "/premium",
      type: "premium",
      status: "sent",
      sentAt: "2024-01-15T10:30:00Z",
      recipients: 3200,
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

  type AdminSummary = {
  totalUsers: number
  totalSubscriptions: number
  subscriptionsToday: number
  fitcoinSalesToday: number
}

const [adminSummary, setAdminSummary] = useState<AdminSummary>({
  totalUsers: 0,
  totalSubscriptions: 0,
  subscriptionsToday: 0,
  fitcoinSalesToday: 0,
})

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
  });

  const getUsers = async () => {
    const { data, error } = await supabase
            .from("profiles")
            .select(`
              *`)
      
          if (error) {
            console.error("Erro ao buscar posts com perfil:", error)
          } else {
            console.log("Posts com perfil completo:", data)
          }
          const statsData = await fetchDashboardStats()
          setAdminSummary({...statsData, totalUsers: data.length})
          setMockUsers(data || [])
  }

  const getProducts = async () => {
    const { data, error } = await supabase
            .from("products")
            .select(`
              *`)
      
          if (error) {
            console.error("Erro ao buscar posts com perfil:", error)
          } else {
            console.log("Posts com perfil completo:", data)
          }
          setMockProducts(data || [])
  }

  const getModules = async () => {
    const { data, error } = await supabase
            .from("premium_modules")
            .select(`*`)
      
          if (error) {
            console.error("Erro ao buscar posts com perfil:", error)
          } else {
            console.log("Posts com perfil completo:", data)
          }
          setModules(data || [])
  }

  const getVideos = async () => {
    const { data, error } = await supabase
            .from("premium_videos")
            .select(`*`)
      
          if (error) {
            console.error("Erro ao buscar posts com perfil:", error)
          } else {
            console.log("Posts com perfil completo:", data)
          }
          setVideos(data || [])
  }

  const getFitz = async () => {
    const { data, error } = await supabase
      .from("fitz")
      .select(`
        *
      `)
      setMockFitzContent(data)
  }

  const getAds = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select(`
        *
      `)
      setMockAds(data)
  }

  const getNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *
      `)
      setPushNotifications(data)
  }

  const getData = async () => {
      getUsers();
      getProducts();
      getModules();
      getVideos();
      getFitz();
      getAds();
      getNotifications();
  }

  useEffect(() => {
    getData();
  }, []);

  const handleFileUpload = async (
  file: File,
  setData: (param: any) => void
) => {
  try {
    const fileExt = file.name.split(".").pop()
    const filePath = `uploads/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("befit") // Bucket definido
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Erro ao fazer upload para Supabase:", uploadError)
      return
    }

    const { data: urlData } = supabase.storage
      .from("befit")
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl
    if (publicUrl) {
      setData(publicUrl)
      console.log("Arquivo enviado para Supabase:", publicUrl)
    }
  } catch (err) {
    console.error("Erro ao enviar arquivo:", err)
  }
}



  // Componente de upload reutilizável - MODIFICADO
  const FileUploadArea = ({
  setData,
  uploadKey,
  accept,
  title,
  description,
  color = "purple",
  multiple = false,
}) => {
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

    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }))

      await handleFileUpload(file, setData)

      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }))
      setUploadedFiles((prev) => ({ ...prev, [uploadKey]: true }))
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
        <p className="text-xs sm:text-sm font-medium">
          {isUploading ? "Enviando..." : title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {uploadedFile && (
          <p className="text-xs text-green-500 mt-2 font-medium">
            ✅ Arquivo enviado!
          </p>
        )}
      </div>
    </div>
  )
}


  // Estados para modais e edição
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingFitz, setEditingFitz] = useState<any>({ id: null, type: "video", file: "", caption: "", author: "", link: "", isVisible: true })
  const [showUserModal, setShowUserModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showFitzModal, setShowFitzModal] = useState(false)

  // Estado do banner premium
  const [bannerData, setBannerData] = useState({
  id: null, // <-- importante!
  slug: "premium",
  title: "",
  description: "",
  btn_text: "",
  link: "",
  image_url: "",
  is_active: true
})

  // Estado do banner da loja
  const [storeBannerData, setStoreBannerData] = useState({
  id: null,
  slug: "store",
  title: "",
  description: "",
  btn_text: "",
  link: "",
  image_url: "",
  is_active: true
})

useEffect(() => {
  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .in("slug", ["premium", "store"])

    if (error) {
      console.error("Erro ao buscar banners:", error)
      return
    }

    const premium = data.find(b => b.slug === "premium")
    const store = data.find(b => b.slug === "store")

    if (premium) {
      setBannerData({
        id: premium.id,
        slug: premium.slug,
        title: premium.title || "",
        description: premium.description || "",
        btn_text: premium.btn_text || "",
        link: premium.link || "",
        image_url: premium.image_url || "",
        is_active: premium.is_active
      })
    }

    if (store) {
      setStoreBannerData({
        id: store.id,
        slug: store.slug,
        title: store.title || "",
        description: store.description || "",
        btn_text: store.btn_text || "",
        link: store.link || "",
        image_url: store.image_url || "",
        is_active: store.is_active
      })
    }
  }

  fetchBanners()
}, [])

  const handleBannerSave = async () => {
    const { error } = await supabase.from("banners").upsert({
      slug: "premium",
      title: bannerData.title,
      description: bannerData.description,
      btn_text: bannerData.btn_text,
      link: bannerData.link,
      image_url: bannerData.image_url,
      is_active: bannerData.is_active,
      
    }, { onConflict: ["slug"] })

    if (error) {
      alert("Erro ao salvar banner!")
      console.error(error)
    } else {
      alert("Banner atualizado com sucesso! 🎉")
    }
  }

  const handleStoreBannerSave = async () => {
    const { error } = await supabase.from("banners").upsert({
      slug: "store",
      title: storeBannerData.title,
      description: storeBannerData.description,
      btn_text: storeBannerData.btn_text,
      link: storeBannerData.link,
      image_url: storeBannerData.image_url,
      is_active: storeBannerData.is_active,
    }, { onConflict: ["slug"] })

    if (error) {
      alert("Erro ao salvar banner da loja!")
      console.error(error)
    } else {
      alert("Banner da loja atualizado com sucesso! 🎉")
    }
  }

  // Estados para Área Premium
  const [modules, setModules] = useState([])
  const [videos, setVideos] = useState([])
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingVideo, setEditingVideo] = useState(null)
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [moduleForm, setModuleForm] = useState({ name: "", description: "" })
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    material_url: "",
    material_title: ""
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

  const handleAdSave = async () => {
    if (!adForm.name.trim() || !adForm.caption.trim()) {
      alert("❌ Nome e legenda são obrigatórios!")
      return
    }

    if(editingAd){
      const { error: updateError } = await supabase
        .from("ads")
        .update(adForm)
        .eq("id", editingAd)

        console.log(updateError);
    }else{

      const { error: updateError } = await supabase
      .from("ads")
      .insert(adForm)
    }

    getAds();

    if (editingAd) {
      alert("✅ Anúncio atualizado com sucesso!")
    } else {
      alert("✅ Anúncio criado com sucesso!")
    }

    setShowAdModal(false)
    setEditingAd(null)
  }

  const handleAdDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este anúncio?")) {
      const { error: updateError } = await supabase
        .from("ads")
        .delete()
        .eq("id", id)
      getAds();
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



    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      document.body.style.overflow = "unset"
    }
  }, [showUserModal, showProductModal, showFitzModal, showModuleModal, showVideoModal, showPushModal, showAdModal])

  

  // Funções para gerenciar usuários
  const handleUserEdit = (user: any) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleUserCreate = () => {
    setEditingUser({
      id: null,
      full_name: "",
      username: "",
      email: "",
      whatsapp: "",
      password: "",
      user_type: "free",
      is_blocked: false,
      posts_count: 0,
      is_verified: false
    })
    setShowUserModal(true)
  }

  const handleUserSave = async () => {
    alert(`Usuário ${editingUser.id ? "atualizado" : "criado"} com sucesso!`)
    if(editingUser.id){
      console.log(editingUser);
      const { id, password, ...userWithoutPassword } = editingUser;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(userWithoutPassword)
        .eq("id", editingUser.id);

        console.log(updateError);
    }else{
      const { data, error: signUpError } = await supabase.auth.admin.createUser({
        email: editingUser.email,
        password: editingUser.password,
        email_confirm: true,
        phone_confirm: true
      })
      if (signUpError) return 0;

      const { id, password, ...userWithoutPassword } = editingUser;

      const { error: updateError } = await supabase
      .from("profiles")
      .update(userWithoutPassword)
      .eq("id", data.user?.id)

    }

    setShowUserModal(false)
    setEditingUser(null)
    getUsers();
  }

  const handleUserDelete = async (userId: string) => {
    const confirmDelete = confirm("Tem certeza que deseja excluir este usuário?");
    if (!confirmDelete) return;

    // Exclui da auth.users, o que também remove da tabela profiles via CASCADE
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      alert("Erro ao excluir usuário: " + error.message);
    } else {
      alert("Usuário excluído com sucesso!");
    }
  };

  const handleUserBlock = async (userId: string, isBlocked: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !isBlocked })
      .eq("id", userId);

    if (error) {
      alert("Erro ao atualizar status de bloqueio: " + error.message);
    } else {
      alert(`Usuário ${isBlocked ? "desbloqueado" : "bloqueado"} com sucesso!`);
    }
  };


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
      fitcoin_price: 0,
      real_price: 0,
      image_url: "",
      file_url: "",
      external_link: "",
      sales_count: 0,
      is_featured: false
    })
    setShowProductModal(true)
  }

  const handleProductSave = async () => {
    alert(`Produto ${editingProduct.id ? "atualizado" : "criado"} com sucesso!`);

    if(editingProduct.id){
      const { error: updateError } = await supabase
        .from("products")
        .update(editingProduct)
        .eq("id", editingProduct.id)

        console.log(updateError);
    }else{
      const { id, ...productWithoutId } = editingProduct;

      const { error: updateError } = await supabase
        .from("products")
        .insert(productWithoutId)
        console.log(updateError);
    }
    setShowProductModal(false)
    setEditingProduct(null)
    getProducts();
  }

  const handleProductDelete = async (productId: string) => {
    const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert("Erro ao excluir produto: " + error.message);
    } else {
      alert("Produto excluído com sucesso!");
    }
  };

  // Funções para gerenciar Fitz
  const handleFitzEdit = (fitz: any) => {
    setEditingFitz(fitz)
    setShowFitzModal(true)
  }

  const handleFitzCreate = () => {
    setEditingFitz({ id: null, type: "video", file: "", caption: "", author: "", link: "", isVisible: true })
    setShowFitzModal(true)
  }

  const [chartData, setChartData] = useState<number[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [newUsers, setNewUsers] = useState(0)
  const [activeUsersPct, setActiveUsersPct] = useState(0)

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [premiumRevenue, setPremiumRevenue] = useState(0)
  const [storeRevenue, setStoreRevenue] = useState(0)

  const [activities, setActivities] = useState<
    { icon: string; title: string; message: string; color: string }[]
  >([])

  useEffect(() => {
    const fetchStats = async () => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Perfis criados nos últimos 7 dias
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at, is_premium")
        .gte("created_at", sevenDaysAgo.toISOString())

      const total = profiles?.length || 0
      const active = profiles?.filter(p => p.is_premium).length || 0
      const grouped = Array(7).fill(0)

      profiles?.forEach(p => {
        const diff = Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
        if (diff < 7) grouped[6 - diff] += 1
      })

      setChartData(grouped.map(v => v * 10))
      setTotalUsers(total)
      setNewUsers(grouped.reduce((a, b) => a + b, 0))
      setActiveUsersPct(Math.round((active / total) * 100) || 0)

      // Receita
      const { data: purchases } = await supabase
        .from("purchases")
        .select("price_paid, currency")
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString())

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("amount")
        .eq("status", "active")
        .gte("created_at", startOfMonth.toISOString())

      const store = purchases?.filter(p => p.currency === "real")
        .reduce((acc, cur) => acc + Number(cur.price_paid), 0) || 0
      const sub = subscriptions?.reduce((acc, cur) => acc + Number(cur.amount), 0) || 0
      setStoreRevenue(store)
      setPremiumRevenue(sub)
      setTotalRevenue(store + sub)

      // Atividades recentes
      const { data: notifications } = await supabase
        .from("notifications")
        .select("type, title, message, created_at")
        .order("created_at", { ascending: false })
        .limit(3)

      const mapped = notifications?.map(n => ({
        title: n.title,
        message: n.message,
        icon: n.type,
        color:
          n.type === "user" ? "green" :
          n.type === "purchase" ? "blue" :
          n.type === "content" ? "purple" : "gray",
      })) || []

      setActivities(mapped)
    }

    fetchStats()
  }, [])

  const handleFitzSave = async () => {
    alert(`Conteúdo Fitz ${editingFitz.id ? "atualizado" : "criado"} com sucesso!`)
    if(editingFitz.id){
const { error: updateError } = await supabase
        .from("fitz")
        .update(editingFitz)
        .eq("id", editingFitz.id)

        console.log(updateError);
    }else{
      const {id, ...fitzWithoutId} = editingFitz;
      const { error: updateError } = await supabase
        .from("fitz")
        .insert(fitzWithoutId)
        console.log(updateError);
    }
    getFitz();
    setShowFitzModal(false)
    setEditingFitz({ id: null, type: "video", file: "", caption: "", author: "", link: "", isVisible: true })
  }

  const handleFitzDelete = async (fitzId: string) => {
    if (confirm("Tem certeza que deseja excluir este conteúdo?")) {
      const { error: deleteError } = await supabase
        .from("fitz")
        .delete()
        .eq("id", fitzId);
      alert("Conteúdo Fitz excluído com sucesso!")
    }
  }

  const handleFitzToggleVisibility = async (fitzId: string, isVisible: boolean) => {
    const { error: updateError } = await supabase
        .from("fitz")
        .update({isVisible})
        .eq("id", fitzId)
    alert(`Conteúdo ${isVisible ? "ocultado" : "exibido"} com sucesso!`)
  }

  // Funções para Área Premium
  const handleAddModule = async () => {
    if (!moduleForm.name.trim()) return
    const newModule:any = moduleForm;
    if(newModule.id){
      const { error: updateError } = await supabase
        .from("premium_modules")
        .update(newModule)
        .eq("id", newModule.id)

        console.log(updateError);

    }else{
      const {id, ...moduleWithoutId} = newModule;
      const { error: updateError } = await supabase
        .from("premium_modules")
        .insert(moduleWithoutId)
        console.log(updateError);
      
    }
    alert(`Módulo ${newModule.id ? "criado" : "editado"} com sucesso! 🎉`);
    getModules();
  }

  const handleDeleteModule = async () => {
    if (editingModule === null) return
    if (confirm("Tem certeza que deseja excluir este módulo?")) {
      const { error: deleteError } = await supabase
      .from("premium_modules")
      .delete()
      .eq("id", editingModule);
      setModules(modules.filter((m) => m.id !== editingModule))
      setVideos(videos.filter((v) => v.modulo_id !== editingModule))
      setEditingModule(null)
      setShowModuleModal(false);
      

      alert("Módulo excluído com sucesso! 🗑️")
      getModules();
    }
  }

  const handleAddVideo = async () => {
    if (!videoForm.title.trim() || selectedModuleId === null) return
    if(videoForm.id){
      const { error: updateError } = await supabase
        .from("premium_videos")
        .update(videoForm)
        .eq("id", videoForm.id)

        console.log(updateError);

    }else{
      const {id, ...videoWithoutId} = videoForm;
      const { error: updateError } = await supabase
        .from("premium_videos")
        .insert({...videoWithoutId, module_id: selectedModuleId})
        console.log(updateError);
      
    }
    

    getVideos();
    setVideoForm({
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      material_url: "",
      material_title: ""
    })
    setSelectedModuleId(null)
    setShowVideoModal(false)
    alert(`Vídeo ${videoForm.id ? "editado" : "criado"} com sucesso! 🎬`)
  }

  const handleDeleteVideo = async () => {
    if (editingVideo === null) return
    if (confirm("Tem certeza que deseja excluir este vídeo?")) {
      const { error: deleteError } = await supabase
      .from("premium_videos")
      .delete()
      .eq("id", editingVideo);

      getVideos();
      setEditingVideo(null)
      setShowVideoModal(false)
      alert("Vídeo excluído com sucesso! 🗑️")
    }
  }

  const getModuleVideos = (moduleId) => {
    return videos.filter((video) => video.module_id === moduleId)
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

  const handlePushSave = async () => {
    if (!pushForm.title.trim() || !pushForm.message.trim()) {
      alert("❌ Título e mensagem são obrigatórios!")
      return
    }

    const newNotification = {
      id: editingPush || Date.now(),
      title: pushForm.title,
      message: pushForm.message,
      action_text: pushForm.actionText,
      action_link: pushForm.actionLink,
      type: pushForm.type,
      status: pushForm.scheduleType === "now" ? "sent" : "scheduled",
      sentAt: pushForm.scheduleType === "now" ? new Date().toISOString() : null,
      scheduledFor: pushForm.scheduleType === "schedule" ? pushForm.scheduledFor : null,
      recipients: 12500, // Total de usuários
    }

    if (editingPush) {
      
      
    const { error: updateError } = await supabase
        .from("notifications")
        .update(newNotification)
        .eq("id", newNotification.id)

        console.log(updateError);
        getNotifications();
        alert("✅ Notificação atualizada com sucesso!")

    }else{
      const {id, ...notificationsWId} = newNotification;
      const { error: updateError } = await supabase
        .from("notifications")
        .insert({...notificationsWId})
        console.log(updateError);
      getNotifications();
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

  const fetchDashboardStats = async () => {
  const today = new Date().toISOString().split("T")[0]

  // Total de usuários (já disponível, não precisa consultar)

  // Total de assinaturas
  const { count: totalSubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })

  // Assinaturas criadas hoje
  const { count: todaySubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)

  // Compras em Fitcoin hoje
  const { count: fitcoinSalesToday } = await supabase
    .from("purchases")
    .select("*", { count: "exact", head: true })
    .eq("currency", "fitcoin")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`)
  return {
    totalSubscriptions,
    subscriptionsToday:todaySubscriptions,
    fitcoinSalesToday,
  }
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
                      <p className="text-lg sm:text-xl font-bold text-foreground">{adminSummary.totalUsers}</p>
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
                    value={(adminSummary.totalUsers / 15000) * 100}
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
                      <p className="text-lg sm:text-xl font-bold text-foreground">{adminSummary.totalSubscriptions}</p>
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
                    value={(adminSummary.totalSubscriptions / 4000) * 100}
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
                      <p className="text-lg sm:text-xl font-bold text-foreground">{adminSummary.fitcoinSalesToday}</p>
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
                    value={(adminSummary.fitcoinSalesToday / 50) * 100}
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
                      <p className="text-lg sm:text-xl font-bold text-foreground">{adminSummary.fitcoinSalesToday}</p>
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
                    value={(adminSummary.fitcoinSalesToday / 3000) * 100}
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
            { user?.profile?.user_type == "admin" && (
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
            )}

            { user?.profile?.user_type == "producer" && (
            <TabsList className="flex w-full overflow-x-auto overflow-y-hidden mb-4 sm:mb-6 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-xl gap-1 scrollbar-hide">
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 px-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs whitespace-nowrap flex-shrink-0"
              >
                <BarChart2 className="w-3 h-3 mr-1" />
                Estatísticas
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
            </TabsList>
            )}

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
                        <span className="text-sm font-medium text-green-500">+{newUsers}</span>
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
                          <p className="text-lg font-bold text-foreground">{totalUsers}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-500">+{newUsers}</p>
                          <p className="text-xs text-muted-foreground">Esta semana</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-500">{activeUsersPct}%</p>
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
                        <p className="text-2xl font-bold text-foreground">R$ {totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-green-500">+15.2% vs mês anterior</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Assinaturas Premium</span>
                          <span className="text-sm font-medium">R$ {premiumRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loja Fitcoin</span>
                          <span className="text-sm font-medium">R$ {storeRevenue.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${(premiumRevenue / totalRevenue) * 100 || 0}%` }}
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
                      {activities.map((act, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className={`w-8 h-8 bg-${act.color}-500 rounded-full flex items-center justify-center`}>
                            {act.icon === "user" && <Users className="w-4 h-4 text-white" />}
                            {act.icon === "purchase" && <ShoppingBag className="w-4 h-4 text-white" />}
                            {act.icon === "content" && <Video className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{act.title}</p>
                            <p className="text-xs text-muted-foreground">{act.message}</p>
                          </div>
                        </div>
                      ))}
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
                            <h4 className="font-medium text-foreground">{user.full_name}</h4>
                            <Badge variant={user.is_premium ? "default" : "secondary"}>
                              {user.user_type}
                            </Badge>
                            {user.is_blocked && <Badge variant="destructive">Bloqueado</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.posts_count} posts</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleUserEdit(user)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserBlock(user.id, user.is_blocked)}
                            className={user.is_blocked ? "text-green-500" : "text-orange-500"}
                          >
                            {user.is_blocked ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                            {user.is_blocked ? "Desbloquear" : "Bloquear"}
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
                      checked={storeBannerData.is_active}
                      onCheckedChange={(checked) => setStoreBannerData((prev) => ({ ...prev, is_active: checked }))}
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
                        style={{ backgroundImage: `url(${storeBannerData.image_url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/60 via-orange-500/40 to-purple-500/60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs">
                          {storeBannerData.btn_text}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" /> Texto do Botão
                    </Label>
                    <Input
                      value={storeBannerData.btn_text}
                      onChange={(e) => setStoreBannerData((prev) => ({ ...prev, btn_text: e.target.value }))}
                      placeholder="Comprar Agora"
                      className="bg-card border-border/50 focus-visible:ring-orange-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" /> Link do Botão
                    </Label>
                    <Input
                      value={storeBannerData.link}
                      onChange={(e) => setStoreBannerData((prev) => ({ ...prev, link: e.target.value }))}
                      placeholder="/store/special"
                      className="bg-card border-border/50 focus-visible:ring-orange-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <FileUploadArea
                    uploadKey="premium-banner-store"
                    setData={(banner:string) => setStoreBannerData({...storeBannerData, image_url: banner})}
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
                            <span className="text-purple-500">{product.fitcoin_price} Fitcoins</span>
                            <span className="text-green-500">R$ {product.real_price}</span>
                            <span className="text-blue-500">{product.sales_count} vendas</span>
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
                    setModuleForm({ name: "", description: "" })
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
                      checked={bannerData.is_active}
                      onCheckedChange={(checked) => setBannerData((prev) => ({ ...prev, is_active: checked }))}
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
                        style={{ backgroundImage: `url(${bannerData.image_url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 drop-shadow-lg">
                          {bannerData.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 mb-3 drop-shadow-md">{bannerData.description}</p>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                          {bannerData.btn_text}
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
                        value={bannerData.link}
                        onChange={(e) => setBannerData((prev) => ({ ...prev, link: e.target.value }))}
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
                      value={bannerData.description}
                      onChange={(e) => setBannerData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do banner..."
                      className="bg-card border-border/50 focus-visible:ring-purple-500 mt-1.5 min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500" /> Texto do Botão
                    </Label>
                    <Input
                      value={bannerData.btn_text}
                      onChange={(e) => setBannerData((prev) => ({ ...prev, btn_text: e.target.value }))}
                      placeholder="Assinar Agora"
                      className="bg-card border-border/50 focus-visible:ring-purple-500 mt-1.5 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <FileUploadArea
                    uploadKey="premium-banner-main"
                    setData={(base64:any) => setBannerData((prev) => ({ ...prev, image_url: base64 }))}
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
                {modules.map((module:any) => {
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
                                {module.title}
                              </h3>
                              <p> {module.description}</p>
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
                                  title: "",
                                  description: "",
                                  video_url: "",
                                  thumbnail_url: "",
                                  material_url: "",
                                  material_title:""
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
                                setModuleForm({ ...module })
                                setShowModuleModal(true)
                              }}
                            >
                              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {moduleVideos.length > 0 && (
                          <div className="space-y-2">
                            {moduleVideos.map((video:any) => (
                              <div
                                key={video.id}
                                className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30"
                              >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
                                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground text-xs sm:text-sm truncate">
                                    {video.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate">{video.description}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditingVideo(video.id)
                                      setVideoForm(video)
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
                                {notification.recipients || 1} usuários
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
                            {notification.action_text && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Botão: {notification.action_text}
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
                          {mockAds.reduce((total, ad) => total + ad.impressions, 0)}
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
                          {mockAds.reduce((total, ad) => total + ad.clicks, 0)}
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
                                {ad.impressions} impressões
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
                    value={editingUser.full_name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
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
                        checked={editingUser.user_type === "free"}
                        onChange={(e) => setEditingUser({ ...editingUser, user_type: e.target.value })}
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
                        checked={editingUser.user_type === "premium"}
                        onChange={(e) => setEditingUser({ ...editingUser, user_type: e.target.value })}
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
                        value="producer"
                        checked={editingUser.user_type === "producer"}
                        onChange={(e) => setEditingUser({ ...editingUser, user_type: e.target.value })}
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
                        checked={editingUser.user_type === "admin"}
                        onChange={(e) => setEditingUser({ ...editingUser, user_type: e.target.value })}
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
                    <Label className="text-foreground font-medium text-sm">Verificado</Label>
                    <p className="text-xs text-muted-foreground">Usuario é verificado na plataforma</p>
                  </div>
                  <Switch
                    checked={editingUser.is_verified || false}
                    onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_verified: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-foreground font-medium text-sm">Bloquear Usuário</Label>
                    <p className="text-xs text-muted-foreground">Impede o acesso do usuário à plataforma</p>
                  </div>
                  <Switch
                    checked={editingUser.is_blocked || false}
                    onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_blocked: checked })}
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
                      value={editingProduct.fitcoin_price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, fitcoin_price: Number(e.target.value) })}
                      placeholder="500"
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">Preço R$</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.real_price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, real_price: Number(e.target.value) })}
                      placeholder="89.90"
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground text-sm">Link Externo</Label>
                  <Input
                    value={editingProduct.external_link}
                    onChange={(e) => setEditingProduct({ ...editingProduct, external_link: e.target.value })}
                    placeholder="https://loja.com/produto"
                    className="mt-1 h-9"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-foreground font-medium text-sm">Produto de destaque</Label>
                    <p className="text-xs text-muted-foreground">É um produto de destaque?</p>
                  </div>
                  <Switch
                    checked={editingProduct.is_featured || false}
                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_featured: checked })}
                  />
                </div>
                {/* Upload de Imagem */}
                <div>
                  <Label className="text-foreground text-sm">Upload de Imagem</Label>
                  <div className="mt-1">
                    <FileUploadArea
                      setData={(base64:any) => setEditingProduct({...editingProduct, image_url: base64})}
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
                      setData={(base64:any) => setEditingProduct({...editingProduct, file_url: base64})}
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
                    setData={(base64:any) => setEditingFitz((prev:any) => ({ ...prev, file: base64 }))}
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
                    value={moduleForm.name}
                    onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
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
                    value={videoForm.title}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Treino de Peito Intenso"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada do vídeo..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <Input
                    value={videoForm.material_title}
                    onChange={(e) => setVideoForm((prev) => ({ ...prev, material_title: e.target.value }))}
                    placeholder="Ex: Treino de Peito Intenso"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Upload Material de Apoio</Label>
                  <div className="mt-1.5">
                    <FileUploadArea
                      setData={(base64:any) => setVideoForm((prev) => ({ ...prev, material_url: base64 }))}
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
                    setData={(base64:any) => setVideoForm((prev) => ({ ...prev, thumbnail_url: base64 }))}
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
                    setData={(base64:any) => setVideoForm((prev) => ({ ...prev, video_url: base64 }))}
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
                      setData={(base64:any) => setAdForm((prev) => ({ ...prev, image: base64 }))}
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
