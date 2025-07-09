"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Video, Music, ImageIcon, File, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import StandardHeader from "@/components/standard-header"
import { useUser } from "@supabase/auth-helpers-react"
import { supabase } from "@/lib/supabase"

export default function MyPurchasesPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const user = useUser()

  const handleDownload = (id: string) => {
    setDownloadingId(id)

    // Simulando download
    setTimeout(() => {
      setDownloadingId(null)
      alert("Download concluído!")
    }, 2000)
  }

   useEffect(() => {
    if (!user.id) return

    const fetchPurchasedProducts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          created_at,
          price_paid,
          currency,
          status,
          products (
            id,
            title,
            image_url,
            file_type,
            file_size,
            download_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar compras:", error)
        setLoading(false)
        return
      }

      // Normaliza o formato igual ao que você usava
      const formatted = data.map((purchase: any) => ({
        id: purchase.products.id,
        title: purchase.products.title,
        image: purchase.products.image_url,
        purchaseDate: new Date(purchase.created_at).toLocaleDateString("pt-BR"),
        fileType: purchase.products.file_type,
        fileSize: purchase.products.file_size,
        downloadUrl: purchase.products.download_url,
      }))

      setPurchasedProducts(formatted)
      setLoading(false)
    }

    fetchPurchasedProducts()
  }, [user])

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />
      case "mp4":
        return <Video className="w-4 h-4 text-blue-500" />
      case "mp3":
        return <Music className="w-4 h-4 text-green-500" />
      case "jpg":
      case "png":
        return <ImageIcon className="w-4 h-4 text-purple-500" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 md:pb-0 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

      <StandardHeader />

      <main className="flex-1 p-4 pb-16 md:pb-4 relative z-10">
        <div className="flex items-center mb-6">
          <Link href="/store">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-purple-500/10 hover:text-purple-500 transition-all duration-300 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gradient animate-glow">Minhas Compras</h1>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl mb-4 shadow-glow-purple">
            <h2 className="text-xl font-bold mb-2 text-white">Seus Produtos Digitais</h2>
            <p className="text-sm mb-4 text-white/90">
              Todos os seus produtos adquiridos estão disponíveis para download
            </p>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Badge className="bg-white/20 border-0">{purchasedProducts.length} produtos</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {purchasedProducts.map((product) => (
            <Card
              key={product.id}
              className="card-neon overflow-hidden hover:shadow-glow-purple transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-32 h-32">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{product.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20"
                        >
                          {getFileIcon(product.fileType)} {product.fileType.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{product.fileSize}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Adquirido em: {product.purchaseDate}</p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        className="flex-1 gap-1 btn-neon-purple"
                        onClick={() => handleDownload(product.id)}
                        disabled={downloadingId === product.id}
                      >
                        {downloadingId === product.id ? (
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                            Baixando...
                          </span>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Download
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="icon" className="hover:bg-purple-500/10 hover:text-purple-500">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {purchasedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <File className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma compra encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Você ainda não adquiriu nenhum produto digital</p>
            <Link href="/store">
              <Button className="btn-neon-purple">Explorar Loja</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
