"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  MessageCircle,
  Repeat,
  MoreHorizontal,
  Play,
  CheckCircle,
  ShoppingCart,
  Lock,
  Download,
} from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { useFitcoin } from "@/hooks/use-fitcoin"
import CommentsModal from "@/components/comments-modal"
import { formatRelativeTime } from "@/lib/utils"
import { useUser } from "@supabase/auth-helpers-react"
import { supabase } from "@/lib/supabase"

interface FeedPostProps {
  type: "text" | "photo" | "video" | "poll" | "challenge" | "ad" | "status" | "repost"
  user: string
  avatar: string
  content: string
  image?: string
  videoThumbnail?: string
  backgroundColor?: string
  pollOptions?: any
  likes: number
  comments: number
  shares: number
  isVerified?: boolean
  adType?: "ebook" | "treino" | "receita" | "desafio" | "premium"
  price?: string
  originalPrice?: string
  fitcoinPrice?: number
  discount?: string
  externalLink?: string
  isPremiumContent?: boolean
  isRepost?: boolean
  repostedBy?: string
  timestamp?: string
  originalPost?: any
  postId:any
  _liked:any
  alreadyLiked:any
  _reposted:any
  username:any
  videoUrl:any
  isAds: boolean
  profile:any
  onPostCreated?: () => void // Adicionar esta linha
}

export default function FeedPost({
  type,
  user,
  avatar,
  content,
  image,
  videoUrl,
  videoThumbnail,
  backgroundColor,
  pollOptions,
  likes,
  comments,
  shares,
  isVerified,
  adType,
  price,
  originalPrice,
  fitcoinPrice,
  discount,
  externalLink,
  isPremiumContent,
  isRepost = false,
  repostedBy,
  timestamp,
  originalPost,
  postId,
  _liked,
  _reposted,
  alreadyLiked,
  username,
  isAds,
  profile,
  onPostCreated, // Adicionar esta linha
}: FeedPostProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { addFitcoin } = useFitcoin()
  const User = useUser();
  // Estados locais
  const [liked, setLiked] = useState(_liked)
  const [likeCount, setLikeCount] = useState(likes)
  const [reposted, setReposted] = useState(_reposted)
  const [repostCount, setRepostCount] = useState(shares)
  const [commentCount, setCommentCount] = useState(comments)
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null)
  const [pollResults, setPollResults] = useState<number[]>([])
  const [showComments, setShowComments] = useState(false)
  const [joined, setJoined] = useState(false)
  const [muted, setMuted] = useState(false)

  // Carregar dados salvos do localStorage
  useEffect(() => {
  const fetchData = async () => {
    if (!User?.id || !postId) return;

    // Verifica votos da enquete
    if (type === "poll" && pollOptions) {
      const { data: votes, error } = await supabase
        .from("poll_votes")
        .select("user_id, index")
        .eq("post_id", postId)

      if (error) {
        console.error("Erro ao buscar votos da enquete:", error)
        return
      }

      const optionCount = new Array(pollOptions.length).fill(0)
      let userVote: number | null = null

      votes.forEach((vote) => {
        if (vote.user_id === User.id) userVote = vote.index
        if (typeof vote.index === "number") optionCount[vote.index]++
      })

      setPollResults(optionCount)
      setSelectedPollOption(userVote)
    }

    // Verifica participação em desafio
    if (type === "challenge") {
      const { data, error } = await supabase
        .from("challange")
        .select("id")
        .eq("user_id", User.id)
        .eq("post_id", postId)
        .maybeSingle()

      if (error) {
        console.error("Erro ao verificar participação no desafio:", error)
        return
      }

      if (data) {
        setJoined(true)
      }
    }
  }
  setLiked(_liked)
  fetchData()
}, [User, postId, type, pollOptions, _liked])
  // Função para navegar para o perfil
  const handleProfileClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation()
    const formattedUsername = username
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9.]/g, "")
    router.push(`/profile/${formattedUsername}`)
  }

  const handleMediaPress = useCallback(
      (index: number) => {
        const video = videoRefs.current.get(index)
        if (video) {
          video.pause()
        }
      },
      [],
    )
  
    const handleMediaRelease = useCallback(
      (index: number) => {

      },
      [],
    )

    const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  
    const handleMediaClick = useCallback(() => {
      setMuted((prev) => {
        const newMuted = !prev
        videoRefs.current.forEach((video) => {
          if (video) video.muted = newMuted
        })
        return newMuted
      })
    }, [])

  // Gerar resultados aleatórios para a enquete
  const generatePollResults = (optionsCount: number) => {
    const total = Math.floor(Math.random() * 100) + 50
    const results = []
    let remaining = total

    for (let i = 0; i < optionsCount - 1; i++) {
      const votes = Math.floor(Math.random() * (remaining / 2))
      results.push(votes)
      remaining -= votes
    }
    results.push(remaining)

    return results
  }



  // Salvar reposts
  const saveReposts = (newReposted: boolean, newCount: number) => {
    const currentUser = localStorage.getItem("currentUser") || "user"
    const savedReposts = JSON.parse(localStorage.getItem("postReposts") || "{}")

    if (!savedReposts[postId]) {
      savedReposts[postId] = { users: [], count: shares }
    }

    if (newReposted) {
      if (!savedReposts[postId].users.includes(currentUser)) {
        savedReposts[postId].users.push(currentUser)
      }
    } else {
      savedReposts[postId].users = savedReposts[postId].users.filter((u: string) => u !== currentUser)
    }

    savedReposts[postId].count = newCount
    localStorage.setItem("postReposts", JSON.stringify(savedReposts))
  }

  // Salvar resultados de enquete
  const savePollResults = (results: number[], userVote: number) => {
    const savedPolls = JSON.parse(localStorage.getItem("pollResults") || "{}")
    savedPolls[postId] = { results, userVote }
    localStorage.setItem("pollResults", JSON.stringify(savedPolls))
  }

  const handleLike = async () => {
  if (!User?.id || !postId) return;
  var table = "likes"
  if(isAds){
    table = "likes_ads"
  }

  // Verifica se já existe like do usuário nesse post
  const { data: existingLike, error: likeError } = await supabase
    .from(table)
    .select("id, like")
    .eq("user_id", User.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (likeError) {
    console.error("Erro ao verificar like existente:", likeError);
    return;
  }

  const alreadyLiked = existingLike?.like === true;
  const newLiked = !alreadyLiked;
  const newCount = newLiked ? likeCount + 1 : likeCount - 1;

  setLiked(newLiked);
  setLikeCount(newCount);

  if (existingLike) {
    // Se já existe, apenas atualiza
    const { error: updateError } = await supabase
      .from(table)
      .update({ like: newLiked })
      .eq("id", existingLike.id);

    if (updateError) console.error("Erro ao atualizar like:", updateError);
  } else {
    // Se ainda não curtiu, cria novo like
    const { error: insertError } = await supabase
      .from(table)
      .insert({ user_id: User.id, post_id: postId, like: true });

    if (insertError) {
      console.error("Erro ao inserir like:", insertError);
    } else {
      addFitcoin(User, 1);
    }
  }

  // Atualiza contador de likes no post
  const { error: postUpdateError } = await supabase
    .from(isAds ? "ads" : "post")
    .update({ likes_count: newCount })
    .eq("id", postId);

  if (postUpdateError) {
    console.error("Erro ao atualizar contador de likes:", postUpdateError);
  }
};

  const handleRepost = async () => {
    if (!reposted) {
      const currentUser = localStorage.getItem("currentUser") || "João Silva"

      // Criar o repost no formato correto
      const repostData = {
        id: `repost-${Date.now()}`,
        type: "repost",
        user: currentUser,
        avatar: "/placeholder.svg?height=40&width=40",
        content: "",
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
        originalPost: {
          type,
          user,
          avatar,
          content,
          image,
          videoThumbnail,
          backgroundColor,
          pollOptions,
          likes,
          comments,
          shares,
          isVerified,
          adType,
          price,
          originalPrice,
          fitcoinPrice,
          discount,
          externalLink,
          isPremiumContent,
          timestamp,
        },
      }

      const { data, error } = await supabase
        .from("post_reposts")
        .insert({user_id:User?.id, post_id:postId});

      // Atualizar contadores locais
      const newCount = repostCount + 1
      setRepostCount(newCount)
      setReposted(true)
      saveReposts(true, newCount)
      addFitcoin(User, 1)

      // Disparar evento customizado para atualizar o feed
      const event = new CustomEvent("repostCreated", {
        detail: repostData,
      })
      window.dispatchEvent(event)

      // Notificar o componente pai se a função existir
      if (onPostCreated) {
        onPostCreated()
      }

      toast({
        title: "Post Repostado! 🔄",
        description: `Você repostou o conteúdo de ${user}`,
      })
    } else {
      toast({
        title: "Já Repostado! ℹ️",
        description: "Você já repostou este conteúdo",
        variant: "destructive",
      })
    }
  }

const handlePollVote = async (index: number) => {
  if (selectedPollOption !== null || !User?.id || !postId) return;

  try {
    // Verifica se o usuário já votou nesse post
    const { data: existingVote, error: checkError } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("user_id", User.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (checkError) {
      console.error("Erro ao verificar voto existente:", checkError);
      return;
    }

    if (existingVote) {
      // Já votou, não permite votar novamente
      setSelectedPollOption(index);
      return;
    }

    // 1. Salva o voto no Supabase
    const { error } = await supabase.from("poll_votes").insert({
      user_id: User.id,
      post_id: postId,
      index: index,
    });

    if (error) {
      console.error("Erro ao registrar voto:", error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive",
      });
      return;
    }

    // 2. Atualiza localmente
    const newResults = [...pollResults];
    newResults[index] += 1;
    setPollResults(newResults);
    setSelectedPollOption(index);

    // 3. Recompensa com Fitcoin
    addFitcoin(User, 1);
  } catch (err) {
    console.error("Erro inesperado ao votar:", err);
  }
};


  const handleJoinChallenge = async () => {
  if (joined) return

  try {
    // 1. Insere participação na tabela challange
    const { error } = await supabase.from('challange').insert({
      user_id: User?.id,
      post_id: postId, // substitua por sua variável correta
      progress: 0,
    })

    if (error) {
      console.error("Erro ao participar do desafio:", error)
      toast({
        title: "Erro 😢",
        description: "Não foi possível entrar no desafio. Tente novamente.",
        variant: "destructive",
      })
      return
    }

    // 2. Atualiza estado local e recompensa
    setJoined(true)
    addFitcoin(User, 1)

    toast({
      title: "Desafio Adicionado! 🎯",
      description: `Você está participando do desafio: ${content.substring(0, 30)}...`,
      variant: "default",
    })
  } catch (err) {
    console.error("Erro inesperado:", err)
    toast({
      title: "Erro Inesperado",
      description: "Algo deu errado ao tentar participar do desafio.",
      variant: "destructive",
    })
  }
}


  const handleBuyWithFitcoin = () => {
    if (fitcoinPrice) {
      toast({
        title: "Produto Adquirido! 🎉",
        description: `Você usou ${fitcoinPrice} Fitcoins para comprar este item`,
      })
    }
  }

  // Callback para quando um comentário é adicionado
  const handleCommentAdded = async () => {
    if (!User?.id || !postId) return;

    // Verifica se o usuário já comentou no post
    const { data: existingComments, error } = await supabase
      .from("comments")
      .select("id")
      .eq("user_id", User.id)
      .eq("post_id", postId)
      .limit(1);

    if (error) {
      console.error("Erro ao verificar comentários existentes:", error);
      return;
    }

    const isFirstComment = existingComments.length === 0;

    const newCount = commentCount + 1;
    setCommentCount(newCount);

    if (isFirstComment) {
      addFitcoin(User, 1); // Só ganha Fitcoin se for o primeiro comentário
    }
  };

  const totalPollVotes = pollResults.reduce((acc, curr) => acc + curr, 0)

  // Manipular referência de vídeo
    const setVideoRef = useCallback(
      (index: number) => (el: HTMLVideoElement | null) => {
        if (el) {
          videoRefs.current.set(index, el)
        } else {
          videoRefs.current.delete(index)
        }
      },
      [],
    )

  const formattedTimestamp = useMemo(() => {
    if (!timestamp) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      return formatRelativeTime(twoHoursAgo)
    }
    try {
      return formatRelativeTime(timestamp)
    } catch (error) {
      console.error("Error formatting timestamp:", error)
      return "há 2h"
    }
  }, [timestamp])

  // Renderizar conteúdo baseado no tipo de post
  const renderContent = () => {
    switch (type) {
      case "status":
        return (
          <div
            className={`p-4 rounded-lg mb-3 ${
              backgroundColor ? `bg-gradient-to-br ${backgroundColor} text-white` : "bg-muted/50"
            }`}
          >
            <p className="text-base whitespace-pre-line text-center font-medium">{content}</p>
          </div>
        )
      case "text":
        return <p className="px-4 mb-3 text-base whitespace-pre-line">{content}</p>
      case "photo":
        return (
          <>
            <p className="px-4 mb-3 whitespace-pre-line">{content}</p>
            {image && (
              <div className="relative w-full aspect-square mb-3">
                <Image src={image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
              </div>
            )}
          </>
        )
      case "video":
  return (
    <>
      <p className="px-4 mb-3 whitespace-pre-line">{content}</p>
      {videoUrl && (
        <div className="relative w-full aspect-video mb-3 bg-black">
          <video
            ref={setVideoRef(0)}
            src={videoUrl}
            className="w-full object-cover"
            loop
            muted={muted}
            playsInline
            controls
            preload="metadata"
            poster={videoThumbnail || "/placeholder.svg"}
            onClick={handleMediaClick}
          />
          {/* Se quiser overlay de Play, implemente toggle manual */}
        </div>
      )}
    </>
  )
      case "poll":
        return (
          <div className="px-4 mb-3">
            <p className="mb-4 whitespace-pre-line">{content}</p>
            <div className="space-y-2">
              {pollOptions?.map((option:any, index:any) => {
                const votes = pollResults[index] || 0
                const percentage = totalPollVotes > 0 ? (votes / totalPollVotes) * 100 : 0
                const isSelected = selectedPollOption === index

                return (
                  <div
                    key={index}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                    onClick={() => handlePollVote(index)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{option}</span>
                      {selectedPollOption !== null && (
                        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                      )}
                    </div>
                    {selectedPollOption !== null && <Progress value={percentage} className="h-1" />}
                  </div>
                )
              })}
            </div>
            {selectedPollOption !== null && <p className="text-xs text-gray-500 mt-2">{totalPollVotes} votos</p>}
          </div>
        )
      case "challenge":
        return (
          <div className="px-4 mb-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-white mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 p-1 rounded">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{pollOptions?.title}</span>
              </div>
              <p className="font-bold text-lg mb-2">{content}</p>
              <Button
                onClick={handleJoinChallenge}
                className={`w-full ${
                  joined ? "bg-green-500 hover:bg-green-600" : "bg-white text-purple-600 hover:bg-gray-100"
                }`}
                disabled={joined}
              >
                {joined ? "✓ Participando" : "Participar do Desafio"}
              </Button>
            </div>
          </div>
        )
      case "ad":
        return (
          <div className="px-4 mb-3">
            <div className="border rounded-lg overflow-hidden">
              {image && (
                <div className="relative w-full aspect-video">
                  <Image src={image || "/placeholder.svg"} alt="Ad image" fill className="object-cover" />
                  {isPremiumContent && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                      <Lock className="w-3 h-3 inline mr-1" />
                      PREMIUM
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <p className="font-bold text-lg mb-2">{content}</p>
                <div className="flex items-center gap-2 mb-3">
                  {originalPrice && <span className="text-sm text-gray-500 line-through">{originalPrice}</span>}
                  {price && <span className="text-lg font-bold text-green-600">{price}</span>}
                  {discount && (
                    <Badge variant="destructive" className="text-xs">
                      {discount}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {fitcoinPrice && (
                    <Button onClick={handleBuyWithFitcoin} className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                      <span className="mr-1">🪙</span>
                      {fitcoinPrice} Fitcoins
                    </Button>
                  )}
                  <Button onClick={() => externalLink && window.open(externalLink, "_blank")} className="flex-1">
                    {adType === "ebook" && <Download className="w-4 h-4 mr-2" />}
                    {adType === "treino" && <Play className="w-4 h-4 mr-2" />}
                    {adType === "receita" && "🍽️"}
                    {adType === "desafio" && <CheckCircle className="w-4 h-4 mr-2" />}
                    {adType === "premium" && <Lock className="w-4 h-4 mr-2" />}
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      case "repost":
        return (
          <div className="mb-3">
            {/* Renderizar o post original diretamente */}
            <div className="px-4 mb-3">
              {originalPost?.content && <p className="text-base whitespace-pre-line">{originalPost.content}</p>}
            </div>

            {originalPost?.image && (
              <div className="relative w-full aspect-square mb-3">
                <Image src={originalPost.image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
              </div>
            )}

            {originalPost?.videoThumbnail && (
              <div className="relative w-full aspect-video mb-3 bg-black">
                <Image
                  src={originalPost.videoThumbnail || "/placeholder.svg"}
                  alt="Video thumbnail"
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/30 rounded-full p-4">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
            )}

            {originalPost?.pollOptions && (
              <div className="px-4 mb-3">
                <div className="space-y-2">
                  {originalPost.pollOptions.map((option: string, index: number) => (
                    <div key={index} className="relative p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      default:
        return <p className="px-4 mb-3 whitespace-pre-line">{content}</p>
    }
  }

  // No header principal, usar dados do post original se for repost
  const displayUser = type === "repost" ? originalPost?.user || user : user
  const displayAvatar = type === "repost" ? originalPost?.avatar || avatar : avatar
  const displayVerified = type === "repost" ? originalPost?.isVerified || false : isVerified
  const displayTimestamp = type === "repost" ? originalPost?.timestamp || timestamp : timestamp

  return (
    <>
              {isRepost && repostedBy && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Repeat className="w-4 h-4 mr-1" />
                  <span>@{repostedBy} repostou</span>
                </div>
              )}
      <Card className="w-full max-w-md mx-auto mb-4 shadow-sm">
        
        <CardContent className="p-0">
          {/* Mostrar informação de repost ACIMA do header se for repost */}
          {/* Header do post com informação de repost */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center space-x-3">
              {/* Mostrar informação de repost se aplicável */}
              
              <Avatar className="cursor-pointer" onClick={(e) => handleProfileClick(e, username)}>
                <AvatarImage src={displayAvatar || "/placeholder.svg"} alt={displayUser} />
                <AvatarFallback>{displayUser?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <p
                    className="font-semibold text-sm cursor-pointer hover:underline"
                    onClick={(e) => handleProfileClick(e, username)}
                  >
                    {displayUser}
                  </p>
                  {displayVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-xs text-gray-500">{formatRelativeTime(displayTimestamp || new Date())}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Conteúdo do post */}
          {renderContent()}
        </CardContent>

        <CardFooter className="flex justify-between items-center p-4 pt-2">
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${liked ? "text-red-500" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{commentCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${reposted ? "text-green-500" : ""}`}
              onClick={handleRepost}
            >
              <Repeat className={`w-4 h-4 ${reposted ? "fill-current" : ""}`} />
              <span className="text-xs">{repostCount}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de comentários */}
      <CommentsModal
        isAds={isAds}
        isFitz={false}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={postId}
        user={User}
        profile={profile}
        onCommentAdded={handleCommentAdded}
      />
    </>
  )
}

