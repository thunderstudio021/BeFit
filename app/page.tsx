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
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from "@/lib/supabase"
import { getUserProfile } from "@/lib/services/profileService"
import { StatementResultingChanges } from "node:sqlite"
import PushSubscriptionManager from "@/components/push-manager"

// Tipos para os posts
interface Post {
  id?: string
  type: "text" | "photo" | "video" | "poll" | "challenge" | "ad"
  user: string
  avatar: string
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  isVerified?: boolean
  adType?: string
  price?: string
  originalPrice?: string
  fitcoinPrice?: number
  discount?: string
  externalLink?: string
  isPremiumContent?: boolean
  timestamp?: string
  createdAt?: number
  user_liked: boolean
  already_like: boolean
  user_reposted: boolean
  location: string
  username: string
  repostedBy: string
  isRepost: boolean
}

interface SupabasePost {
  likes: any
  id: string
  type: "text" | "photo" | "video" | "poll" | "challenge" | "ad"
  user_id: string
  content: string
  image_url: string | null
  video_url: string | null
  background_color: string | null
  poll_options: string[] | null
  likes_count: number
  comments_count: number
  shares_count: number
  is_premium_content: boolean
  created_at: string
  profiles?: {
    avatar_url: string,
    full_name:string,
    is_verified?: boolean
    is_admin?: boolean,
    username?:StatementResultingChanges
  },
  already_like: boolean;
  user_liked: boolean;
  user_reposted: boolean;
  location:string;
  repostedBy:string;
  isRepost:boolean;
}

function mapSupabaseToPost(data: SupabasePost): Post {
  return {
    id: data.id,
    type: data.type,
    user: data.profiles?.full_name || "",
    avatar: data.profiles?.avatar_url || "",
    profiles: data.profiles,
    content: data.content,
    image: data.image_url || undefined,
    videoThumbnail: data.video_url || undefined,
    video_url: data.video_url || undefined,
    backgroundColor: data.background_color || undefined,
    pollOptions: data.poll_options || undefined,
    likes: data.likes_count,
    comments: data.comments_count,
    shares: data.shares_count,
    isVerified: data.profiles?.is_verified,
    isAdmin: data.profiles?.is_admin,
    isPremiumContent: data.is_premium_content,
    timestamp: data.created_at,
    createdAt: new Date(data.created_at).getTime(),
    user_liked: data.user_liked,
    user_reposted: data.user_reposted,
    location: data.location,
    already_like: data.already_like,
    username: data.profiles?.username,
    repostedBy:data.repostedBy,
    isRepost: data.isRepost
  }
}

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const user = useUser();
  const [forYouPosts, setForYou] = useState([])
  // Posts da comunidade (usuários normais) + posts do usuário
  const [communityPosts, setCommunityPosts] = useState([])
  const [profile, setProfile] = useState<any>(null)
  const [pageForYou, setPageForYou] = useState(0)
const [pageCommunity, setPageCommunity] = useState(0)
const limit = 2

const [hasMoreForYou, setHasMoreForYou] = useState(true)
const [hasMoreCommunity, setHasMoreCommunity] = useState(true)
const [loadingMore, setLoadingMore] = useState(false)

const [activeTab, setActiveTab] = useState<"forYou" | "community">("forYou")

const fetchPaginatedPosts = async (offset: number, limit: number): Promise<Post[]> => {
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        avatar_url,
        full_name,
        username,
        user_type,
        is_verified
      ),
      likes (
        user_id,
        like
      ),
      post_reposts (
        user_id
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: repostsData, error: repostsError } = await supabase
    .from("post_reposts")
    .select(`
      *,
      user:profiles (
        full_name,
        user_type
      ),
      posts (
        *,
        profiles (
          avatar_url,
          full_name,
          username,
          user_type,
          is_verified
        ),
        likes (
          user_id,
          like
        ),
        post_reposts (
          user_id
        )
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (postsError || repostsError) {
    console.error("Erro ao carregar posts:", postsError || repostsError)
    return []
  }

  const repostsAsPosts = repostsData.map((r: any) => ({
    ...r.posts,
    isRepost: true,
    repostedBy: r.user.full_name,
    original_created_at: r.created_at,
  }))

  const allRawPosts = [...postsData, ...repostsAsPosts]

  const posts = allRawPosts.map((post: any) => {
    const userLiked = post.likes?.some((like: any) => like.user_id === user?.id && like.like)
    const userReposted = post.post_reposts?.some((repost: any) => repost.user_id === user?.id)
    const userAlreadyLiked = post.likes?.some((like: any) => like.user_id === user?.id)

    return {
      ...post,
      user_liked: userLiked,
      user_reposted: userReposted,
      already_like: userAlreadyLiked,
    }
  })

  return posts.map((v: any) => mapSupabaseToPost(v)) || []
}

useEffect(() => {
  const handleScroll = () => {
    console.log('handleScroll')
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      console.log('handleScroll', activeTab)
      if (activeTab === "forYou" && !loadingMore) loadMorePosts("forYou")
      if (activeTab === "community" && !loadingMore) loadMorePosts("community")
    }
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [activeTab, hasMoreForYou, loadingMore])


const loadMorePosts = async (tab: "forYou" | "community") => {
  console.log('loadMorePosts');
  if (loadingMore) return

  setLoadingMore(true)
  const offset = (tab === "forYou" ? pageForYou : pageCommunity) * limit

  const posts = await fetchPaginatedPosts(offset, limit)
  const adsFromDb = await loadAds()

  const sortedPosts = posts.sort((a, b) => b.createdAt! - a.createdAt!)

  if (tab === "forYou") {
    const filtered = sortedPosts.filter(
      (p) => p?.profiles?.user_type === "producer" || p?.profiles?.user_type === "admin" || p?.profiles?.is_verified
    )
    const intercalated = getIntercalatedPosts([...forYouPosts.filter((p) => p?.type != 'ad'), ...filtered], adsFromDb)
    setForYou((prev) => [...intercalated])
    setPageForYou((prev) => prev + 1)
  } else {
    const filtered = sortedPosts.filter(
      (p) => p?.type != 'ad'
    )
    const intercalated = getIntercalatedPosts([...communityPosts.filter((p) => p?.type != 'ad'), ...filtered], adsFromDb)
    setCommunityPosts((prev) => [...intercalated])
    setPageCommunity((prev) => prev + 1)
  }

  setLoadingMore(false)
}


  
    useEffect(() => {
      if (!user) return
  
      getUserProfile(user.id)
        .then((data) => {setProfile(data);})
        .catch((err) => console.error(err))
    }, [user])


    const loadAds = async (): Promise<Post[]> => {
  const userId = user?.id

  // Buscar anúncios originais
  const { data: adsData, error: adsError } = await supabase
    .from('ads')
    .select(`
      *,
      likes_ads (
        user_id,
        liked
      ),
      comments_ads (
        id
      ),
      ads_reposts (
        user_id
      )
    `)
    .eq('status', 'active')

  // Buscar reposts de anúncios
  const { data: repostsData, error: repostsError } = await supabase
    .from('ads_reposts')
    .select(`
      *,
      user:profiles (
        full_name
      ),
      ad:ads (
        *,
        likes_ads (
          user_id,
          liked
        ),
        comments_ads (
          id
        )
      )
    `)

  if (adsError || repostsError) {
    console.error('Erro ao carregar anúncios ou reposts:', adsError || repostsError)
    return []
  }

  // Reposts transformados em "ads"
  const repostsAsAds = (repostsData || []).map((r: any) => {
    const ad = r.ad
    const likes = ad.likes_ads || []
    const comments = ad.comments_ads || []

    const userLiked = likes.some((like: any) => like.user_id === userId && like.liked)
    const userAlreadyLiked = likes.some((like: any) => like.user_id === userId)

    return {
      id: ad.id.toString(),
      type: 'ad',
      user: ad.name || 'Anunciante',
      avatar: ad.avatar,
      content: ad.caption || '',
      image: ad.image || '',
      likes: likes.length,
      comments: comments.length,
      shares: ad.shares || 0,
      adType: ad.category,
      externalLink: ad.buttonLink,
      isVerified: true,
      user_liked: userLiked,
      already_like: userAlreadyLiked,
      user_reposted: true,
      location: ad.placement || 'foryou',
      username: '',
      repostedBy: r.user?.full_name || '',
      isRepost: true,
      isAds: true
    }
  })

  // Anúncios originais
  const originalAds = (adsData || []).map((ad: any) => {
    const likes = ad.likes_ads || []
    const comments = ad.comments_ads || []

    const userLiked = likes.some((like: any) => like.user_id === userId && like.liked)
    const userAlreadyLiked = likes.some((like: any) => like.user_id === userId)
    const userReposted = ad.ads_reposts?.some((repost: any) => repost.user_id === userId)

    return {
      id: ad.id.toString(),
      type: 'ad',
      user: ad.name || 'Anunciante',
      avatar: ad.avatar,
      content: ad.caption || '',
      image: ad.image || '',
      likes: likes.length,
      comments: comments.length,
      shares: ad.shares || 0,
      adType: ad.category,
      externalLink: ad.buttonLink,
      isVerified: true,
      user_liked: userLiked,
      already_like: userAlreadyLiked,
      user_reposted: userReposted,
      location: ad.placement || 'foryou',
      username: '',
      repostedBy: '',
      isRepost: false
    }
  })

  // Junta tudo sem ordenar
  return [...originalAds, ...repostsAsAds]
}



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
      user_liked: false,
      user_reposted: false,
      location: "",
      already_like: true,
      username: "",
      repostedBy:"",
      isRespost: false
    },
    ]

  // Função para intercalar posts com anúncios no mobile
  const getIntercalatedPosts = (posts: Post[], adsToInsert: Post[] = [], includeAds = true) => {
  if (!includeAds || adsToInsert.length === 0) return posts

  const result: Post[] = []
  const adInterval = 3

  posts.forEach((post, index) => {
    result.push(post)

    if ((index + 1) % adInterval === 0 && adsToInsert[Math.floor(index / adInterval) % adsToInsert.length]) {
      result.push(adsToInsert[Math.floor(index / adInterval) % adsToInsert.length])
    }
  })

  return result
}

  const loadUserPosts = async () => {
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        avatar_url,
        full_name,
        username,
        user_type,
        is_verified
      ),
      likes (
        user_id,
        like
      ),
      post_reposts (
        user_id
      )
    `)

  const { data: repostsData, error: repostsError } = await supabase
    .from("post_reposts")
    .select(`
      *,
      user:profiles (
        full_name,
        user_type
      ),
      posts (
        *,
        profiles (
          avatar_url,
          full_name,
          username,
          user_type,
          is_verified
        ),
        likes (
          user_id,
          like
        ),
        post_reposts (
          user_id
        )
      )
    `)

  if (postsError || repostsError) {
    console.error("Erro ao carregar posts:", postsError || repostsError)
    return
  }

  const repostsAsPosts = repostsData.map((r: any) => ({
    ...r.posts,
    isRepost: true,
    repostedBy: r.user.full_name,
    original_created_at: r.created_at,
  }))

  const allRawPosts = [...postsData, ...repostsAsPosts]

  const posts = allRawPosts.map((post: any) => {
    console.log('post.likes?.some((like: any) => like.user_id === user?.id && like.like)', post.likes?.some((like: any) => like.user_id === user?.id && like.like));
    const userLiked = post.likes?.some((like: any) => like.user_id === user?.id && like.like)
    const userReposted = post.post_reposts?.some((repost: any) => repost.user_id === user?.id)
    const userAlreadyLiked = post.likes?.some((like: any) => like.user_id === user?.id)

    return {
      ...post,
      user_liked: userLiked,
      user_reposted: userReposted,
      already_like: userAlreadyLiked,
    }
  })

  const all_posts = posts.map((v: any) => mapSupabaseToPost(v)) || []
  console.log('all_posts', all_posts);
  if (user) {
    const user_post = all_posts.filter((p: any) => p.user_id === user.id)
    setUserPosts(user_post)
  }

  const adsFromDb = await loadAds()
  
  // Salve em algum estado global ou local se quiser manipular depois
  // Exemplo: setAds(adsFromDb)
  
  // Atualize a função de intercalar para usar `adsFromDb` em vez do array fixo

  console.log(all_posts);

  // Ordena do mais novo para o mais antigo
  const sortedPosts = all_posts.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA // Mais recentes primeiro
  })
  const _foryou = getIntercalatedPosts(sortedPosts.filter(p => p?.profiles?.user_type === 'producer' || p?.profiles?.user_type === 'admin' || p?.profiles?.is_verified), adsFromDb);
  setForYou(_foryou)
  const _comunitu = getIntercalatedPosts(sortedPosts, adsFromDb);
  setCommunityPosts(_comunitu)
}

interface FeaturedItem {
  id: string
  type: "ad" | "product"
  title: string
  description: string
  image: string
  price?: string
  originalPrice?: string
  discount?: string
  fitcoinPrice?: number
  externalLink?: string
  badge?: string
}



const loadFeaturedItems = async (): Promise<FeaturedItem[]> => {
  // 1. Carregar anúncios ativos
  const { data: adsData, error: adsError } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'active')

  if (adsError) {
    console.error('Erro ao carregar anúncios:', adsError)
  }

  const ads: FeaturedItem[] = adsData?.map((ad: any) => ({
    id: ad.id.toString(),
    type: 'ad',
    title: ad.caption || ad.name || 'Anúncio em destaque',
    description: ad.description || '',
    image: ad.image || '/placeholder.svg',
    price: ad.price || undefined,
    originalPrice: ad.originalPrice || undefined,
    discount: ad.discount || undefined,
    externalLink: ad.buttonLink,
    badge: 'DESTAQUE'
  })) || []

  // 2. Carregar produtos em destaque
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)

  if (productsError) {
    console.error('Erro ao carregar produtos:', productsError)
  }

  const products: FeaturedItem[] = productsData?.map((product: any) => ({
    id: product.id,
    type: 'product',
    title: product.name,
    description: product.description,
    image: product.image_url || '/placeholder.svg',
    price: `R$ ${product.real_price}`,
    fitcoinPrice: product.fitcoin_price,
    externalLink: product.external_link || product.file_url,
    badge: 'NOVO'
  })) || []

  return [...ads, ...products]
}

const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([])



  // Carregar posts do usuário
useEffect(() => {
  if (user) {
    setForYou([])
    setCommunityPosts([])
    setPageForYou(0)
    setPageCommunity(0)
    setHasMoreForYou(true)
    setHasMoreCommunity(true)
    loadMorePosts("forYou")
    loadMorePosts("community")
  }
}, [user])


  // Função para recarregar posts quando um novo é criado
  const handlePostCreated = () => {
    // loadUserPosts();
  }


  

  

  if(user == null) return 0;
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
            <Tabs onValueChange={(value) => setActiveTab(value === "for-you" ? "forYou" : "community")} defaultValue="for-you" className="w-full">
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
                {forYouPosts.map((post:any, index) => (
                  <div key={`for-you-${index}`}>
                    <FeedPost
                      _reposted={post.user_reposted}
                      type={post.type}
                      user={post.user}
                      avatar={post.avatar}
                      content={post.content}
                      isAds={post.type == "ad"}
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
                      _liked={post.user_liked}
                      alreadyLiked={post.already_like}
                      postId={post.id}
                      onPostCreated={handlePostCreated}
                      username={post.username}
                      isRepost={post.isRepost}
                      repostedBy={post.repostedBy}
                      videoUrl={post.video_url}
                      profile={profile}
                    />
                    {index < forYouPosts.length - 1 && <Separator className="my-2 opacity-50" />}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="community" className="mt-0 space-y-4 w-full">
                {/* Componente de criação de post apenas na aba Comunidade */}
                <div className="mb-4">
                  <CreatePost profile={profile} location="community" onPostCreated={handlePostCreated} />
                </div>

                {communityPosts.map((post:any, index) => (
                  <div key={`community-${post.id || index}`}>
                    <FeedPost
                    _reposted={post.user_reposted}
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
                      _liked={post.user_liked}
                      postId={post.id}
                      alreadyLiked={post.already_like}
                      onPostCreated={handlePostCreated}
                      username={post.username}
                      isRepost={post.isRepost}
                      repostedBy={post.repostedBy}
                      isAds={post.type == "ad"}
                      videoUrl={post.video_url}
                      profile={profile}
                    />
                    {index < communityPosts.length - 1 && <Separator className="my-2 opacity-50" />}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna direita (anúncios em destaque) - apenas desktop */}
          <div className="hidden lg:block w-80 space-y-4">
            <div className="sticky top-24">
              <div className="mb-4 ml-6">
                <CreatePostModal profile={profile} />
              </div>

              <h3 className="font-semibold mb-4 text-foreground text-lg ml-6">Em destaque</h3>

              {featuredItems.map((item) => (
  <Card key={item.id} className="card-neon overflow-hidden mb-4 hover:shadow-glow-orange ml-6">
    <div className="relative">
      <Image
        src={item.image}
        alt={item.title}
        width={300}
        height={150}
        className="w-full h-40 object-cover"
      />
      <div className="absolute top-2 right-2 bg-orange-500 px-2 py-0.5 rounded text-xs font-bold text-white">
        {item.badge}
      </div>
    </div>
    <CardContent className="p-3">
      <h4 className="font-medium text-sm mb-1">{item.title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
      {item.price && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold">{item.price}</span>
          {item.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{item.originalPrice}</span>
          )}
        </div>
      )}
      <Button
        size="sm"
        className="w-full btn-neon-yellow text-xs"
        onClick={() => item.externalLink && window.open(item.externalLink, '_blank')}
      >
        {item.type === 'ad' ? 'Aproveitar oferta' : 'Comprar agora'}
      </Button>
    </CardContent>
  </Card>
))}

              {/* <Card className="card-neon overflow-hidden mb-4 hover:shadow-glow-orange ml-6">
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
              </Card> */}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
