"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Video,
  Music,
  ImageIcon,
  ExternalLink,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BottomNavigation from "@/components/bottom-navigation"
import FitcoinCounter from "@/components/fitcoin-counter"

interface Purchase {
  id: string
  title: string
  type: "ebook" | "video" | "audio" | "image" | "course"
  image: string
  purchaseDate: string
  price: number
  currency: "fitcoin" | "real"
  status: "completed" | "processing" | "failed"
  downloadUrl?: string
  fileSize?: string
  format?: string
  description: string
}

// Função para obter compras do localStorage
const getStoredPurchases = (): Purchase[] => {
  if (typeof window === "undefined") return []

  const storedPurchases = localStorage.getItem("bbfitness_purchases")
  return storedPurchases ? JSON.parse(storedPurchases) : []
}

// Função para salvar compras no localStorage
const storePurchases = (purchases: Purchase[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("bbfitness_purchases", JSON.stringify(purchases))
  }
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: "1",
      title: "E-book: Transformação 30 Dias",
      type: "ebook",
      image: "/placeholder.svg?height=200&width=150",
      purchaseDate: "2024-01-15",
      price: 750,
      currency: "fitcoin",
      status: "completed",
      downloadUrl: "/downloads/ebook-transformacao.pdf",
      fileSize: "2.5 MB",
      format: "PDF",
      description: "Guia completo para transformação corporal em 30 dias",
    },
    {
      id: "2",
      title: "Plano de Treino Personalizado",
      type: "ebook",
      image: "/placeholder.svg?height=200&width=150",
      purchaseDate: "2024-01-10",
      price: 1000,
      currency: "fitcoin",
      status: "completed",
      downloadUrl: "/downloads/plano-treino.pdf",
      fileSize: "1.8 MB",
      format: "PDF",
      description: "Treinos personalizados para seus objetivos",
    },
    {
      id: "3",
      title: "Curso: Nutrição Esportiva",
      type: "video",
      image: "/placeholder.svg?height=200&width=150",
      purchaseDate: "2024-01-08",
      price: 29.9,
      currency: "real",
      status: "completed",
      downloadUrl: "/downloads/curso-nutricao.zip",
      fileSize: "850 MB",
      format: "MP4",
      description: "Curso completo sobre nutrição para atletas",
    },
    {
      id: "4",
      title: "Pack Receitas Fitness",
      type: "ebook",
      image: "/placeholder.svg?height=200&width=150",
      purchaseDate: "2024-01-05",
      price: 400,
      currency: "fitcoin",
      status: "processing",
      fileSize: "3.2 MB",
      format: "PDF",
      description: "50 receitas saudáveis para sua dieta",
    },
    {
      id: "5",
      title: "Meditações Guiadas",
      type: "audio",
      image: "/placeholder.svg?height=200&width=150",
      purchaseDate: "2024-01-03",
      price: 300,
      currency: "fitcoin",
      status: "completed",
      downloadUrl: "/downloads/meditacoes.zip",
      fileSize: "120 MB",
      format: "MP3",
      description: "Sessões de meditação para relaxamento",
    },
  ])

  // Carregar compras do localStorage ao iniciar
  useEffect(() => {
    const storedPurchases = getStoredPurchases()
    if (storedPurchases.length > 0) {
      setPurchases((prev) => {
        // Combinar compras existentes com as armazenadas, evitando duplicatas
        const existingIds = new Set(prev.map((p) => p.id))
        const newPurchases = storedPurchases.filter((p) => !existingIds.has(p.id))
        return [...prev, ...newPurchases]
      })
    } else {
      // Se não houver compras armazenadas, salvar as iniciais
      storePurchases(purchases)
    }
  }, [])

  // Salvar compras no localStorage quando mudar
  useEffect(() => {
    storePurchases(purchases)
  }, [purchases])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ebook":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "audio":
        return <Music className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "course":
        return <Video className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Processando
          </Badge>
        )
      case "failed":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Falhou</Badge>
      default:
        return null
    }
  }

  const handleDownload = (purchase: Purchase) => {
    if (purchase.downloadUrl) {
      // Simular download
      const link = document.createElement("a")
      link.href = purchase.downloadUrl
      link.download = purchase.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const completedPurchases = purchases.filter((p) => p.status === "completed")
  const processingPurchases = purchases.filter((p) => p.status === "processing")

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/store">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Minhas Compras</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {completedPurchases.length} produtos disponíveis para download
              </p>
            </div>
          </div>
          <FitcoinCounter />
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-4 py-3 sm:py-6 relative z-10">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-foreground">{purchases.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-500">{completedPurchases.length}</div>
              <div className="text-xs text-muted-foreground">Concluídos</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-yellow-500">{processingPurchases.length}</div>
              <div className="text-xs text-muted-foreground">Processando</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-500">
                {purchases.filter((p) => p.currency === "fitcoin").reduce((acc, p) => acc + p.price, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Fitcoins gastos</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-card/50 backdrop-blur-sm rounded-xl h-auto mb-4 sm:mb-6 border border-border/50 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Disponíveis
            </TabsTrigger>
            <TabsTrigger
              value="processing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-2 sm:py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple text-xs sm:text-sm"
            >
              Processando
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 space-y-3 sm:space-y-4">
            {purchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-0 space-y-3 sm:space-y-4">
            {completedPurchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
            ))}
          </TabsContent>

          <TabsContent value="processing" className="mt-0 space-y-3 sm:space-y-4">
            {processingPurchases.map((purchase) => (
              <PurchaseCard key={purchase.id} purchase={purchase} onDownload={handleDownload} />
            ))}
          </TabsContent>
        </Tabs>

        {purchases.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma compra encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Você ainda não fez nenhuma compra. Explore nossa loja!</p>
            <Link href="/store">
              <Button className="btn-neon-purple">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir para a Loja
              </Button>
            </Link>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}

interface PurchaseCardProps {
  purchase: Purchase
  onDownload: (purchase: Purchase) => void
}

function PurchaseCard({ purchase, onDownload }: PurchaseCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ebook":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "audio":
        return <Music className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "course":
        return <Video className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Processando
          </Badge>
        )
      case "failed":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Falhou</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow-subtle transition-all duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Imagem do produto */}
          <div className="relative flex-shrink-0">
            <Image
              src={purchase.image || "/placeholder.svg"}
              alt={purchase.title}
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-border/50"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-background border border-border/50 rounded-full flex items-center justify-center">
              {getTypeIcon(purchase.type)}
            </div>
          </div>

          {/* Informações do produto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">{purchase.title}</h3>
              {getStatusBadge(purchase.status)}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{purchase.description}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(purchase.purchaseDate).toLocaleDateString("pt-BR")}
              </div>
              {purchase.fileSize && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {purchase.fileSize}
                </div>
              )}
              {purchase.format && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {purchase.format}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {purchase.currency === "fitcoin" ? `${purchase.price} Fitcoins` : `R$ ${purchase.price}`}
                </span>
              </div>

              {purchase.status === "completed" && purchase.downloadUrl ? (
                <Button
                  size="sm"
                  onClick={() => onDownload(purchase)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-glow-green text-xs px-3 h-7"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              ) : purchase.status === "processing" ? (
                <Button size="sm" disabled className="text-xs px-3 h-7">
                  <Clock className="w-3 h-3 mr-1" />
                  Processando
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="text-xs px-3 h-7" disabled>
                  Indisponível
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
