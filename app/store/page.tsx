"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, Clock, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import AppLayout from "@/components/app-layout"
import { useFitcoin } from "@/hooks/use-fitcoin"
import { InsufficientFitcoinsAlert } from "@/components/insufficient-fitcoins-alert"
import { addToPurchases } from "@/lib/purchase-utils"
import { PurchaseSuccessNotification } from "@/components/purchase-success-notification"
import { supabase } from "@/lib/supabase"
import { useUser } from "@supabase/auth-helpers-react"



export default function StorePage() {
  const user = useUser();

  const [storeBannerData, setStoreBannerData] = useState({
    image: "/placeholder.svg?height=400&width=800",
    buttonText: "",
    buttonLink: "",
    isActive: false,
  })
  const [flashProducts, setFlashProducts] = useState<any[]>([])

  useEffect(() => {
  const fetchStoreBanner = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("slug", "store")
      .single()

    if (error) {
      console.error("Erro ao carregar banner da loja:", error)
      return
    }

    setStoreBannerData({
      image: data?.image_url || "/placeholder.svg?height=400&width=800",
      buttonText: data?.btn_text || "Comprar Agora",
      buttonLink: data?.link || "/store/special",
      isActive: true, // Se quiser controlar, pode usar um campo is_active
    })
  }

  fetchStoreBanner()
}, [])


  const [currentFlashIndex, setCurrentFlashIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: { hours: number; minutes: number; seconds: number } }>({})
  const [insufficientFitcoins, setInsufficientFitcoins] = useState<{ show: boolean; missing: number }>({
    show: false,
    missing: 0,
  })
  const [purchaseSuccess, setPurchaseSuccess] = useState<{
    show: boolean
    productTitle: string
  }>({
    show: false,
    productTitle: "",
  })

  // Produtos digitais regulares
const [digitalProducts, setDigitalProducts] = useState([
  {
    id: "digital3",
    title: "Meditações Guiadas",
    image_url: "/placeholder.svg?height=200&width=150",
    fitcoin_price: 300,
    available: true,
    realPrice: 29.9,
  }
]);

  const { fitcoin, addFitcoin } = useFitcoin()

  const getData = async () => {
  const { data, error } = await supabase.from("products").select("*")
  if (error) {
    console.error("Erro ao buscar produtos:", error)
    return
  }
  if (data) {
    const { flashProducts, regularProducts } = formatProducts(data)
    setFlashProducts(flashProducts)
    setDigitalProducts(regularProducts)
  }
}

  // Calcular tempo restante para cada produto
  useEffect(() => {
    getData();
    const timer = setInterval(() => {
      const now = new Date()
      const newTimeLeft: { [key: string]: { hours: number; minutes: number; seconds: number } } = {}

      flashProducts.forEach((product) => {
        const difference = product.endTime.getTime() - now.getTime()

        if (difference > 0) {
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
          const minutes = Math.floor((difference / (1000 * 60)) % 60)
          const seconds = Math.floor((difference / 1000) % 60)

          newTimeLeft[product.id] = { hours, minutes, seconds }
        } else {
          newTimeLeft[product.id] = { hours: 0, minutes: 0, seconds: 0 }
        }
      })

      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function formatProducts(products: any[]) {
  const flashProducts = products
    .filter(p => p.is_featured)
    .map(p => ({
      id: p.id,
      name: p.name,
      image: p.image_url || "/placeholder.svg",
      price: p.fitcoin_price || 0,
      fitcoin_price: p.fitcoin_price || 0,
      originalPrice: p.real_price || 0,
      external_link: p.external_link,
      real_price: p.real_price,
      discount: p.discount || "0%",
      endTime: p.end_time ? new Date(p.end_time) : new Date(Date.now() + 24 * 60 * 60 * 1000), // se tiver campo, converte, se não, 24h padrão
      realPrice: p.real_price || 0,
    }))

  const regularProducts = products.filter(p => !p.is_featured)

  return { flashProducts, regularProducts }
}

  // Esconder alerta de fitcoins insuficientes após 5 segundos
  useEffect(() => {
    if (insufficientFitcoins.show) {
      const timer = setTimeout(() => {
        setInsufficientFitcoins({ show: false, missing: 0 })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [insufficientFitcoins])

  useEffect(() => {
    if (purchaseSuccess.show) {
      const timer = setTimeout(() => {
        setPurchaseSuccess({ show: false, productTitle: "" })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [purchaseSuccess])

  // Navegação do carrossel
  const nextFlashProduct = () => {
    setCurrentFlashIndex((prev) => (prev === flashProducts.length - 1 ? 0 : prev + 1))
  }

  const prevFlashProduct = () => {
    setCurrentFlashIndex((prev) => (prev === 0 ? flashProducts.length - 1 : prev - 1))
  }

  // Formatar tempo para exibição
  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0")
  }

  // Função para processar a compra com Fitcoins
  const handlePurchase = async (product: any) => {
    console.log('fittt', fitcoin);
    if (fitcoin >= product.fitcoin_price) {
      // 1️⃣ Desconta Fitcoins do profile no Supabase
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("fitcoins")
        .eq("id", user.id)
        .single()

      if (userError) {
        console.error("Erro ao buscar perfil:", userError)
        return
      }

      const newFitcoinBalance = (userProfile.fitcoins || 0) - product.fitcoin_price

      if (newFitcoinBalance < 0) {
        // Verifica de novo no backend por segurança
        setInsufficientFitcoins({
          show: true,
          missing: product.fitcoin_price - userProfile.fitcoins,
        })
        return
      }

      // 2️⃣ Atualiza saldo de Fitcoins
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ fitcoins: newFitcoinBalance })
        .eq("id", user.id)

      if (updateError) {
        console.error("Erro ao atualizar fitcoins:", updateError)
        return
      }

      // 3️⃣ Registra a compra na tabela purchases
      const { error: insertError } = await supabase.from("purchases").insert([
        {
          user_id: user.id,
          product_id: product.id,
          price_paid: product.fitcoin_price,
          currency: "fitcoin",
          status: "completed",
        },
      ])

      if (insertError) {
        console.error("Erro ao registrar compra:", insertError)
        return
      }

      // 4️⃣ Atualiza o estado local de Fitcoins e compras
      addFitcoin(user, -product.fitcoin_price) // Atualiza client-side
      addToPurchases({
        id: product.id,
        title: product.title,
        type: "ebook",
        image: product.image,
        price: product.fitcoin_price,
        currency: "fitcoin",
        description: `${product.title} adquirido com ${product.fitcoin_price} Fitcoins`,
        fileSize: "2.5 MB",
        format: "PDF",
        downloadUrl: "/downloads/produto.pdf",
      })

      setPurchaseSuccess({
        show: true,
        productTitle: product.title,
      })

    } else {
      // Fitcoins insuficientes (client-side)
      setInsufficientFitcoins({
        show: true,
        missing: product.fitcoin_price - fitcoin,
      })
    }
  }

  return (
    <AppLayout>
      <main className="flex-1 pb-16 md:pb-0 md:pl-72 relative z-10">
        {/* Notificação de fitcoins insuficientes */}
        {insufficientFitcoins.show && (
          <InsufficientFitcoinsAlert
            missingAmount={insufficientFitcoins.missing}
            onClose={() => setInsufficientFitcoins({ show: false, missing: 0 })}
          />
        )}

        {/* Notificação de compra realizada */}
        {purchaseSuccess.show && (
          <PurchaseSuccessNotification
            productTitle={purchaseSuccess.productTitle}
            onClose={() => setPurchaseSuccess({ show: false, productTitle: "" })}
          />
        )}

        {/* Banner Responsivo Customizável */}
        {storeBannerData.isActive && (
          <div className="w-full mb-6">
            <div onClick={() => window.open(storeBannerData.buttonLink)} className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
              {/* Imagem de fundo */}
              <Image
                src={storeBannerData.image || "/placeholder.svg"}
                alt="Oferta Especial"
                fill
                className="object-cover"
                priority
              />

              {/* Overlay para melhor legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/60 via-orange-500/40 to-purple-500/60" />

              {/* Conteúdo do banner */}
              {/* <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 sm:p-6 md:p-8">
                <Button
                  
                  className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white border-0 shadow-glow-orange px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 hover:scale-105"
                >
                  {storeBannerData.buttonText}
                </Button>
              </div> */}
            </div>
          </div>
        )}

        {/* Seção de Produtos Relâmpago */}
        <div className="px-4 md:px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                Ofertas Relâmpago
              </span>
              <span className="animate-pulse text-orange-500">⚡</span>
            </h2>
            <Link href="/my-purchases">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10 text-xs"
              >
                <ShoppingBag className="w-3 h-3 mr-1" />
                Minhas Compras
              </Button>
            </Link>
          </div>

          {/* Carrossel de Produtos Relâmpago */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentFlashIndex * 100}%)` }}
              >
                {flashProducts.map((product, index) => (
                  <div key={product.id} className="w-full flex-shrink-0 px-1">
                    <Card className="card-neon overflow-hidden border-orange-500/30 hover:shadow-glow-orange">
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 rounded text-xs font-bold text-white shadow-glow-orange">
                          -{product.discount}
                        </div>
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-foreground">{product.name}</h3>

                        {/* Contador regressivo */}
                        {timeLeft[product.id] && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-500" /> Termina em:
                            </p>
                            <div className="flex items-center justify-center gap-1 text-center">
                              <div className="bg-orange-500/10 rounded px-2 py-1 min-w-[40px]">
                                <span className="text-lg font-bold text-orange-500">
                                  {formatTime(timeLeft[product.id].hours)}
                                </span>
                                <p className="text-[10px] text-muted-foreground">horas</p>
                              </div>
                              <span className="text-orange-500 font-bold">:</span>
                              <div className="bg-orange-500/10 rounded px-2 py-1 min-w-[40px]">
                                <span className="text-lg font-bold text-orange-500">
                                  {formatTime(timeLeft[product.id].minutes)}
                                </span>
                                <p className="text-[10px] text-muted-foreground">min</p>
                              </div>
                              <span className="text-orange-500 font-bold">:</span>
                              <div className="bg-orange-500/10 rounded px-2 py-1 min-w-[40px]">
                                <span className="text-lg font-bold text-orange-500">
                                  {formatTime(timeLeft[product.id].seconds)}
                                </span>
                                <p className="text-[10px] text-muted-foreground">seg</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold text-xl text-foreground">{product.price}</span>
                          </div>
                          <span className="text-sm text-muted-foreground line-through">{product.real_price}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 btn-neon-orange" onClick={() => handlePurchase(product)}>
                            Trocar
                          </Button>
                          <Button onClick={() => handlePurchaseExternal(product)} variant="outline" className="flex-1 gap-1 hover:shadow-glow-blue">
                            R$ {product.real_price}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Botões de navegação */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm border-orange-500/30 text-orange-500 hover:bg-orange-500/10 z-10"
              onClick={prevFlashProduct}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm border-orange-500/30 text-orange-500 hover:bg-orange-500/10 z-10"
              onClick={nextFlashProduct}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicadores */}
            <div className="flex justify-center gap-1 mt-4">
              {flashProducts.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentFlashIndex === index ? "bg-orange-500 w-4" : "bg-orange-500/30",
                  )}
                  onClick={() => setCurrentFlashIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6">
          <Tabs defaultValue="digital" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-card/50 backdrop-blur-sm rounded-xl h-auto mb-4 border border-border/50">
              <TabsTrigger
                value="digital"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple"
              >
                Produtos Digitais
              </TabsTrigger>
              <TabsTrigger
                value="physical"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg py-3 transition-all duration-300 data-[state=active]:shadow-glow-purple"
              >
                Produtos Físicos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="digital" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {digitalProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    title={product.name}
                    image={product.image_url}
                    price={product.fitcoin_price}
                    realPrice={product.real_price}
                    available={product.is_available}
                    link={product.external_link}
                    onPurchase={() => handlePurchase(product)}
                    onPurchaseExternal={() => handlePurchaseExternal(product)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="physical" className="mt-0">
              <div className="card-neon rounded-xl p-6 text-center">
                <div className="w-24 h-24 bg-muted/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-yellow">
                  <Coins className="w-12 h-12 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Em breve!</h3>
                <p className="text-muted-foreground mb-4">
                  Produtos físicos estarão disponíveis em breve. Continue acumulando seus Fitcoins!
                </p>
                <div className="flex justify-center gap-4">
                  <div className="bg-muted/50 backdrop-blur-sm p-3 rounded-lg flex flex-col items-center hover:shadow-glow-subtle transition-all duration-300">
                    <span className="text-sm text-muted-foreground">Camisetas</span>
                  </div>
                  <div className="bg-muted/50 backdrop-blur-sm p-3 rounded-lg flex flex-col items-center hover:shadow-glow-subtle transition-all duration-300">
                    <span className="text-sm text-muted-foreground">Acessórios</span>
                  </div>
                  <div className="bg-muted/50 backdrop-blur-sm p-3 rounded-lg flex flex-col items-center hover:shadow-glow-subtle transition-all duration-300">
                    <span className="text-sm text-muted-foreground">Suplementos</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AppLayout>
  )
}

const handlePurchaseExternal = (product: any) => {
  window.open(product.external_link, "_blank")
}

interface ProductCardProps {
  title: string
  image: string
  price: number
  realPrice: number
  available: boolean
  onPurchase: () => void
  onPurchaseExternal: () => void
  link: string
}

function ProductCard({ title, image, price, realPrice, available, onPurchase, onPurchaseExternal, link }: ProductCardProps) {
  return (
    <Card className="card-neon">
      <div className="relative">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={150}
          height={200}
          className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500"
        />
        {available && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 rounded text-xs font-bold text-white shadow-glow-green">
            DISPONÍVEL
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-2 text-foreground">{title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-foreground">{price}</span>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button size="sm" className="flex-1 btn-neon-purple" onClick={onPurchase}>
          Trocar
        </Button>
        <Button onClick={onPurchaseExternal} size="sm" variant="outline" className="flex-1 gap-1 hover:shadow-glow-blue">
          R$ {realPrice}
        </Button>
      </CardFooter>
    </Card>
  )
}
