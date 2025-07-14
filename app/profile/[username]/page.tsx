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

interface Post {
  id: string
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
  isRepost?: boolean
  originalUser?: string
  originalAvatar?: string
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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio, followers_count, following_count, posts_count, is_verified, is_premium")
    .ilike("username", username)
    .maybeSingle()

  if (!profile) return

  // Carrega posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  // Conta seguidores reais
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  // Conta seguindo reais
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // Atualiza os dados reais
  setUserProfile({
    username: profile.username,
    displayName: profile.full_name,
    avatar: profile.avatar_url,
    bio: profile.bio,
    followers: followersCount || 0,
    following: followingCount || 0,
    postsCount: postsData?.length || 0,
    isVerified: profile.is_verified,
    isPro: profile.is_premium,
    isCurrentUser: profile.id === currentUserId,
  })

  setUserPosts(postsData || [])
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
                  key={post.id}
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
