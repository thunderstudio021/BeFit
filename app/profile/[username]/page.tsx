"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Settings, BadgeCheck, Crown, Users, MessageSquare, Repeat } from "lucide-react"
import AppLayout from "@/components/app-layout"
import FeedPost from "@/components/feed-post"
import { useTheme } from "@/contexts/theme-context"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id:string
  username: string
  displayName: string
  avatar: string
  bio: string
  followers: number
  following: number
  postsCount: number
  isVerified: boolean
  isPro: boolean
  isCurrentUser: boolean
}

// Tipos para os posts
interface Post {
  video_url: unknown
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

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const username = params.username as string

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [userReposts, setUserReposts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Simular dados do usuário
  useEffect(() => {
  const loadUserProfile = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const currentUserId = authData?.user?.id

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio, followers_count, following_count, posts_count, is_verified, is_premium")
      .ilike("username", username)
      .maybeSingle()

    if (!profile) return

    // Carrega os posts próprios do usuário com relacionamentos
const { data: userPostsData, error: userPostsError } = await supabase
  .from("posts")
  .select(`
    *,
    profiles (
      avatar_url,
      full_name,
      username,
      user_type
    ),
    likes (
      user_id,
      like
    ),
    post_reposts (
      user_id
    )
  `)
  .eq("user_id", profile.id)


// Carrega os reposts do usuário com os dados do post e autor original
const { data: userRepostsData, error: userRepostsError } = await supabase
  .from("post_reposts")
  .select(`
    *,
    posts (
      *,
      profiles (
        avatar_url,
        full_name,
        username,
        user_type
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
  .eq("user_id", profile.id)

if (userPostsError || userRepostsError) {
  console.error("Erro ao carregar posts do usuário:", userPostsError || userRepostsError)
  return
}

// Formata reposts no mesmo modelo dos posts
const repostsAsPosts = (userRepostsData || []).map((r: any) => ({
  ...r.posts,
  isRepost: true,
  repostedBy: profile.full_name,
  original_created_at: r.created_at,
}))

// Junta todos os posts
const allRawPosts = [...(userPostsData || []), ...repostsAsPosts]

// Adiciona flags de interação do usuário
const posts = allRawPosts.map((post: any) => {
  const userLiked = post.likes?.some((like: any) => like.user_id === currentUserId && like.like)
  const userReposted = post.post_reposts?.some((repost: any) => repost.user_id === currentUserId)
  const userAlreadyLiked = post.likes?.some((like: any) => like.user_id === currentUserId)

  return {
    ...post,
    user_liked: userLiked,
    user_reposted: userReposted,
    already_like: userAlreadyLiked,
  }
})

// Ordena e mapeia para o formato final
const combinedPosts = posts
  .sort((a, b) => new Date(b.original_created_at || b.created_at).getTime() - new Date(a.original_created_at || a.created_at).getTime())
  .map((v: any) => mapSupabaseToPost(v)) || []

    // Conta seguidores
    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id)

    // Conta seguindo
    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id)

      if (currentUserId && profile.id && currentUserId !== profile.id) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id)
        .maybeSingle()

      setIsFollowing(!!followData)
    }

    // Atualiza perfil
    setUserProfile({
      id: profile.id,
      username: profile.username,
      displayName: profile.full_name,
      avatar: profile.avatar_url,
      bio: profile.bio,
      followers: followersCount || 0,
      following: followingCount || 0,
      postsCount: userPosts?.length || 0, // apenas posts originais
      isVerified: profile.is_verified,
      isPro: profile.is_premium,
      isCurrentUser: profile.id === currentUserId,
    })

    // Atualiza feed do usuário
    setUserPosts(combinedPosts)
    setUserReposts(repostsAsPosts)

    setLoading(false)
  }

  loadUserProfile()
}, [username])

  const handleFollow = async () => {
  const { data: authData } = await supabase.auth.getUser()
  const currentUserId = authData?.user?.id

  if (!currentUserId || !userProfile) return

  if (!isFollowing) {
    // Criar o "follow"
    const { error } = await supabase.from("follows").insert([
      {
        follower_id: currentUserId,
        following_id: userProfile.id, // você precisa ter esse ID armazenado
      },
    ])

    if (error) {
      console.error("Erro ao seguir:", error)
      return
    }

    setIsFollowing(true)
    setUserProfile((prev) => (prev ? { ...prev, followers: prev.followers + 1 } : null))
  } else {
    // Remover o "follow"
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", userProfile.id)

    if (error) {
      console.error("Erro ao deixar de seguir:", error)
      return
    }

    setIsFollowing(false)
    setUserProfile((prev) => (prev ? { ...prev, followers: prev.followers - 1 } : null))
  }
}

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  if (loading || !userProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{userProfile.displayName}</h1>
            <p className="text-sm text-muted-foreground">{userProfile.postsCount} publicações</p>
          </div>
        </div>

        {/* Informações do perfil */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-purple-500/20">
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.displayName} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.displayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Informações */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{userProfile.displayName}</h2>
                    {userProfile.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500" />}
                  </div>
                  <p className="text-muted-foreground">@{userProfile.username}</p>

                  {/* Selos */}
                  <div className="flex gap-2 mt-2">
                    {userProfile.isPro ? (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {userProfile.bio && <p className="text-sm leading-relaxed">{userProfile.bio}</p>}

                {/* Estatísticas */}
                <div className="flex gap-6 text-sm">
                  <button className="hover:underline">
                    <span className="font-bold">{userProfile.following}</span>
                    <span className="text-muted-foreground ml-1">seguindo</span>
                  </button>
                  <button className="hover:underline">
                    <span className="font-bold">{userProfile.followers}</span>
                    <span className="text-muted-foreground ml-1">seguidores</span>
                  </button>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3">
                  {userProfile.isCurrentUser ? (
                    <Button onClick={handleEditProfile} className="flex-1 sm:flex-none">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleFollow}
                        className={`flex-1 sm:flex-none ${
                          isFollowing
                            ? "bg-muted hover:bg-muted/80 text-foreground"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {isFollowing ? "Seguindo" : "Seguir"}
                      </Button>
                      <Button variant="outline" size="icon">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de conteúdo */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50 h-10 p-0.5 rounded-full mb-6">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full h-full font-medium transition-all duration-200 text-sm"
            >
              Publicações
            </TabsTrigger>
            <TabsTrigger
              value="reposts"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full h-full font-medium transition-all duration-200 text-sm"
            >
              Reposts
            </TabsTrigger>
          </TabsList>

          {/* Publicações */}
          <TabsContent value="posts" className="mt-0 space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
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
                                      alreadyLiked={post.already_like}
                                      postId={post.id}
                                      username={post.username}
                                      isRepost={post.isRepost}
                                      repostedBy={post.repostedBy}
                                      videoUrl={post.video_url}
                                    />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhuma publicação ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reposts */}
          <TabsContent value="reposts" className="mt-0 space-y-4">
            {userReposts.length > 0 ? (
              userReposts.map((post) => (
                <div key={post.id}>
                  {post.isRepost && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Repeat className="h-4 w-4" />
                      <span>{userProfile.displayName} repostou</span>
                    </div>
                  )}
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
                                        alreadyLiked={post.already_like}
                                        postId={post.id}
                                        username={post.username}
                                        isRepost={post.isRepost}
                                        repostedBy={post.repostedBy}
                                        videoUrl={post.video_url}
                                      />
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum repost ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
