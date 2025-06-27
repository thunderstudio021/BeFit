"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FeedPost from "@/components/feed-post"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import AppLayout from "@/components/app-layout"
import Image from "next/image"
import CreatePost from "@/components/create-post"
import CreatePostModal from "@/components/create-post-modal"
import FitcoinNotification from "@/components/fitcoin-notification"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"

// Tipos para os posts
interface Post {
  id?: string
  type: "text" | "photo" | "video" | "poll" | "challenge" | "ad"
  user: string
  avatar: string
  content: string
  image?: string
  videoThumbnail?: string
  backgroundColor?: string
  pollOptions?: string[]
  likes: number
  comments: number
  shares: number
  isVerified?: boolean
  isAdmin?: boolean
  adType?: "ebook" | "treino" | "receita" | "desafio" | "premium"
  price?: string
  originalPrice?: string
  fitcoinPrice?: number
  discount?: string
  externalLink?: string
  isPremiumContent?: boolean
  timestamp?: string
  createdAt?: number
}

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [userPosts, setUserPosts] = useState<Post[]>([])

  // Detectar se é mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint no Tailwind
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Carregar posts do usuário
  useEffect(() => {
    const loadUserPosts = () => {
      const savedPosts = JSON.parse(localStorage.getItem("userPosts") || "[]")
      setUserPosts(savedPosts)
    }

    loadUserPosts()

    // Listener para reposts
    const handleRepostCreated = (event) => {
      loadUserPosts() // Recarregar posts quando um repost for criado
    }

    window.addEventListener("repostCreated", handleRepostCreated)

    return () => {
      window.removeEventListener("repostCreated", handleRepostCreated)
    }
  }, [])

  // Função para recarregar posts quando um novo é criado
  const handlePostCreated = () => {
    const savedPosts = JSON.parse(localStorage.getItem("userPosts") || "[]")
    setUserPosts(savedPosts)
  }

  // Posts de administradores
  const adminPosts: Post[] = [
    {
      type: "challenge",
      user: "BBfitness",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "💪 Desafio da semana: 30 minutos de cardio por dia! Quem está dentro? #BBChallenge",
      image: "/placeholder.svg?height=300&width=500",
      likes: 245,
      comments: 32,
      shares: 18,
      isVerified: true,
      isAdmin: true,
    },
    {
      type: "text",
      user: "Coach Amanda",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "🥗 Dica do dia: Substitua carboidratos refinados por opções integrais para mais energia durante o treino! #NutriçãoEsportiva",
      backgroundColor: "from-purple-600 to-blue-600",
      likes: 178,
      comments: 24,
      shares: 12,
      isVerified: true,
      isAdmin: true,
    },
    {
      type: "video",
      user: "BBfitness",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "🏋️‍♀️ Novo treino de HIIT disponível na área premium! Apenas 15 minutos e resultados incríveis!",
      videoThumbnail: "/placeholder.svg?height=300&width=500",
      likes: 312,
      comments: 47,
      shares: 28,
      isVerified: true,
      isAdmin: true,
    },
  ]

  // Posts da comunidade (usuários normais) + posts do usuário
  const communityPosts: Post[] = [
    ...userPosts, // Posts do usuário aparecem primeiro
    {
      type: "photo",
      user: "maria.fitness",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Completei 30 dias de desafio! Muito orgulhosa da minha evolução 💯",
      image: "/placeholder.svg?height=300&width=500",
      likes: 89,
      comments: 14,
      shares: 5,
      isAdmin: false,
    },
    {
      type: "poll",
      user: "carlos_runner",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Qual o melhor horário para treinar?",
      pollOptions: ["Manhã cedo", "Hora do almoço", "Fim da tarde", "Noite"],
      likes: 56,
      comments: 23,
      shares: 8,
      isAdmin: false,
    },
    {
      type: "text",
      user: "fit.julia",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "🎯 Meta batida! 10km em menos de 50 minutos! Quem mais está treinando para corrida?",
      backgroundColor: "from-orange-500 to-red-500",
      likes: 134,
      comments: 28,
      shares: 15,
      isAdmin: false,
    },
    {
      type: "photo",
      user: "ana.strong",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "Primeiro mês de academia concluído! Já sinto a diferença na disposição 💪",
      image: "/placeholder.svg?height=300&width=500",
      likes: 156,
      comments: 34,
      shares: 11,
      isAdmin: false,
    },
  ]

  // Anúncios
  const ads: Post[] = [
    {
      type: "ad",
      user: "BBfitness",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "🔥 E-book EXCLUSIVO: 'Transformação em 30 Dias' - Método completo com treinos + dieta + mindset!",
      image: "/placeholder.svg?height=300&width=500",
      likes: 1240,
      comments: 89,
      shares: 45,
      isVerified: true,
      adType: "ebook",
      price: "R$ 29,90",
      originalPrice: "R$ 59,90",
      fitcoinPrice: 500,
      discount: "-50%",
      externalLink: "https://bbfitness.com/ebook-transformacao",
      isAdmin: true,
    },
    {
      type: "ad",
      user: "Personal Trainer Pro",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "💪 TREINO HIIT AVANÇADO: 20 minutos de treino intenso para queimar gordura e definir músculos!",
      image: "/placeholder.svg?height=300&width=500",
      likes: 1456,
      comments: 234,
      shares: 78,
      isVerified: true,
      adType: "treino",
      isPremiumContent: true,
      isAdmin: true,
    },
  ]

  // Função para intercalar posts com anúncios no mobile
  const getIntercalatedPosts = (posts: Post[], includeAds = true) => {
    if (!isMobile || !includeAds) return posts

    const result: Post[] = []
    const adInterval = 3 // A cada 3 posts, inserir um anúncio

    posts.forEach((post, index) => {
      result.push(post)
      if (includeAds && (index + 1) % adInterval === 0 && ads[Math.floor(index / adInterval) % ads.length]) {
        result.push(ads[Math.floor(index / adInterval) % ads.length])
      }
    })

    return result
  }

  // Preparar os posts para cada aba
  const forYouPosts = getIntercalatedPosts(adminPosts)
  const communityPosts2 = getIntercalatedPosts(communityPosts)

  return (
    <AppLayout>
      {/* Notificação de Fitcoin */}
      <FitcoinNotification />

      {/* Container principal centralizado */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        {/* Layout responsivo: uma coluna no mobile, duas colunas no desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Feed principal */}
          <div className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-0">
            <Tabs defaultValue="for-you" className="w-full">
              <div className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-md px-2">
                <TabsList className="w-full grid grid-cols-2 bg-transparent h-10 p-0 rounded-none mb-4 gap-2">
                  <TabsTrigger
                    value="for-you"
                    className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full h-full font-medium transition-all duration-200 text-sm border-0 data-[state=inactive]:text-muted-foreground hover:text-foreground data-[state=inactive]:bg-muted/30"
                  >
                    Para você
                  </TabsTrigger>
                  <TabsTrigger
                    value="community"
                    className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full h-full font-medium transition-all duration-200 text-sm border-0 data-[state=inactive]:text-muted-foreground hover:text-foreground data-[state=inactive]:bg-muted/30"
                  >
                    Comunidade
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Barra de pesquisa mobile */}
              <div className="relative sm:hidden mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar"
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Conteúdo das abas */}
              <TabsContent value="for-you" className="mt-0 space-y-4 w-full">
                {forYouPosts.map((post, index) => (
                  <div key={`for-you-${index}`}>
                    <FeedPost
                      type={post.type}
                      user={post.user}
                      avatar={post.avatar}
                      content={post.content}
                      image={post.image}
                      videoThumbnail={post.videoThumbnail}
                      backgroundColor={post.backgroundColor}
                      pollOptions={post.pollOptions}
                      likes={post.likes}
                      comments={post.comments}
                      shares={post.shares}
                      isVerified={post.isVerified}
                      adType={post.adType}
                      price={post.price}
                      originalPrice={post.originalPrice}
                      fitcoinPrice={post.fitcoinPrice}
                      discount={post.discount}
                      externalLink={post.externalLink}
                      isPremiumContent={post.isPremiumContent}
                      timestamp={post.timestamp}
                      originalPost={post.originalPost}
                      onPostCreated={handlePostCreated}
                    />
                    {index < forYouPosts.length - 1 && <Separator className="my-2 opacity-50" />}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="community" className="mt-0 space-y-4 w-full">
                {/* Componente de criação de post apenas na aba Comunidade */}
                <div className="mb-4">
                  <CreatePost onPostCreated={handlePostCreated} />
                </div>

                {communityPosts2.map((post, index) => (
                  <div key={`community-${post.id || index}`}>
                    <FeedPost
                      type={post.type}
                      user={post.user}
                      avatar={post.avatar}
                      content={post.content}
                      image={post.image}
                      videoThumbnail={post.videoThumbnail}
                      backgroundColor={post.backgroundColor}
                      pollOptions={post.pollOptions}
                      likes={post.likes}
                      comments={post.comments}
                      shares={post.shares}
                      isVerified={post.isVerified}
                      adType={post.adType}
                      price={post.price}
                      originalPrice={post.originalPrice}
                      fitcoinPrice={post.fitcoinPrice}
                      discount={post.discount}
                      externalLink={post.externalLink}
                      isPremiumContent={post.isPremiumContent}
                      timestamp={post.timestamp}
                      originalPost={post.originalPost}
                      onPostCreated={handlePostCreated}
                    />
                    {index < communityPosts2.length - 1 && <Separator className="my-2 opacity-50" />}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna direita (anúncios em destaque) - apenas desktop */}
          <div className="hidden lg:block w-80 space-y-4">
            <div className="sticky top-24">
              <div className="mb-4 ml-6">
                <CreatePostModal />
              </div>

              <h3 className="font-semibold mb-4 text-foreground text-lg ml-6">Em destaque</h3>

              <Card className="card-neon overflow-hidden mb-4 hover:shadow-glow-orange ml-6">
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=200&width=300"
                    alt="Anúncio em destaque"
                    width={300}
                    height={150}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-orange-500 px-2 py-0.5 rounded text-xs font-bold text-white">
                    DESTAQUE
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1">Plano Premium com 30% OFF</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Acesso ilimitado a treinos, receitas e conteúdos exclusivos
                  </p>
                  <Button size="sm" className="w-full btn-neon-yellow text-xs">
                    Aproveitar oferta
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-neon overflow-hidden mb-4 hover:shadow-glow-purple ml-6">
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=200&width=300"
                    alt="Anúncio em destaque"
                    width={300}
                    height={150}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 px-2 py-0.5 rounded text-xs font-bold text-white">
                    NOVO
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-1">E-book: Nutrição Esportiva</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Guia completo para otimizar seus resultados com alimentação
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold">R$ 29,90</span>
                    <span className="text-xs text-muted-foreground line-through">R$ 49,90</span>
                  </div>
                  <Button size="sm" className="w-full btn-neon-purple text-xs">
                    Comprar agora
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-neon overflow-hidden hover:shadow-glow-blue ml-6">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">Desafio da Semana</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Participe do desafio "7 dias de abdominais" e concorra a prêmios!
                  </p>
                  <Button size="sm" className="w-full btn-neon-blue text-xs">
                    Participar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
