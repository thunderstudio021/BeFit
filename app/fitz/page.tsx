"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Heart, MessageCircle, Repeat, MoreHorizontal, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useFitcoin } from "@/hooks/use-fitcoin"
import BottomNavigation from "@/components/bottom-navigation"
import DesktopSidebar from "@/components/desktop-sidebar"
import FitcoinNotification from "@/components/fitcoin-notification"
import CommentsModal from "@/components/comments-modal"
import { supabase } from "@/lib/supabase"
import { useUser } from "@supabase/auth-helpers-react"

interface FitzItem {
  id: number
  user: string
  avatar: string
  verified: boolean
  description: string
  media: string
  likes: number
  comments: number
  shares: number
  isVideo: boolean
  externalLink?: string
  linkText?: string
}

export default function FitzPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<{ [key: number]: { user: string; text: string; time: string }[] }>({})
  const [repostedItems, setRepostedItems] = useState<Set<number>>(new Set())
  const { addFitcoin } = useFitcoin()
  const user = useUser()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentVideoRef = useRef<HTMLVideoElement | null>(null)
  const [fitz, setFitz] = useState<FitzItem[]>([])
  const [originalFitzCount, setOriginalFitzCount] = useState(0) // Novo estado para guardar o número de itens originais

  // Dados básicos dos vídeos
  useEffect(() => {
    const fetchFitz = async () => {
      const { data, error } = await supabase
        .from('fitz')
        .select(
          `
            id,
            created_at,
            author,
            caption,
            file,
            link,
            type,
            likes_count,
            comments_count,
            isVisible
          `
        )
        .eq('isVisible', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar Fitz:', error)
        return
      }

      if (data) {
        const mapped: FitzItem[] = data.map((item) => ({
          id: item.id,
          user: item.author || 'unknown',
          avatar: '/placeholder.svg?height=40&width=40',
          verified: true,
          description: item.caption,
          media: item.file,
          likes: item.likes_count,
          comments: item.comments_count,
          shares: 0,
          isVideo: item.type == "video",
          externalLink: item.link,
          linkText: 'Saiba mais',
        }))

        // Duplica os itens para criar o efeito de loop infinito
        setOriginalFitzCount(mapped.length);
        setFitz([...mapped, ...mapped]); // Duplica os itens

        // Agora, busque likes desse user para os posts carregados
        if (user) {
          const { data: likedData, error: likedError } = await supabase
            .from('fitz_likes')
            .select('post_id')
            .eq('user_id', user.id)

          if (likedError) {
            console.error("Erro ao buscar curtidas:", likedError)
          } else {
            const likedSet = new Set<number>(likedData.map((item) => item.post_id))
            setLikedItems(likedSet)
          }
        }
      }
    }

    fetchFitz()
  }, [user])

  // Comentários iniciais (mantido como estava)
  useEffect(() => {
    const initialComments = {
      1: [
        { user: "fitness_lover", text: "Incrível! Quero fazer esse treino também 💪", time: "2h" },
        { user: "gym_rat22", text: "Resultados impressionantes! Qual é a sua dieta?", time: "1h" },
        { user: "health_coach", text: "Parabéns pela dedicação! Continue assim 🔥", time: "45min" },
      ],
      2: [
        { user: "muscle_builder", text: "Essa dica mudou meu treino! Valeu!", time: "3h" },
        { user: "protein_king", text: "Funciona mesmo! Testei por 2 semanas", time: "2h" },
      ],
      3: [
        { user: "nutrition_geek", text: "Vou experimentar hoje mesmo! Parece delicioso", time: "4h" },
        { user: "pre_workout_fan", text: "Melhor que os industrializados com certeza 👌", time: "3h" },
        { user: "natural_fitness", text: "Adorei a receita! Já salvei aqui", time: "1h" },
      ],
    }
    setComments(initialComments)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + " mi"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + " mil"
    }
    return num.toString()
  }

  // Função de limpeza
  const cleanup = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (currentVideoRef.current) {
      currentVideoRef.current.pause()
      currentVideoRef.current = null
    }
  }, [])

  // Iniciar timer de progresso para vídeo
  const startProgressTimer = useCallback(
    (videoElement: HTMLVideoElement) => {
      cleanup()

      setProgress(0)
      currentVideoRef.current = videoElement
      const duration = videoElement.duration || 30

      progressIntervalRef.current = setInterval(() => {
        if (!videoElement || videoElement.paused) return

        const currentTime = videoElement.currentTime || 0
        const progressValue = (currentTime / duration) * 100
        setProgress(progressValue)

        if (progressValue >= 100) {
          cleanup()
        }
      }, 100)
    },
    [cleanup],
  )

  // Configurar Intersection Observer para autoplay e loop
  useEffect(() => {
    if (!containerRef.current) return

    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.7,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
        const video = videoRefs.current.get(index)

        if (entry.isIntersecting) {
          setCurrentIndex(index)

          // Lógica para o loop infinito
          if (originalFitzCount > 0 && index >= originalFitzCount * (fitz.length / originalFitzCount) - 1) { // Verifica se é o último item da DUPLICAÇÃO
            // Scroll suave para o início para simular o loop
            if (containerRef.current) {
                containerRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            setCurrentIndex(0); // Reinicia o índice para o primeiro item
          }


          if (video && fitz[index]?.isVideo) {
            // Pausar todos os outros vídeos
            videoRefs.current.forEach((v, i) => {
              if (i !== index && v) {
                v.pause()
                v.currentTime = 0
              }
            })

            // Reproduzir vídeo atual
            video.muted = muted
            video.currentTime = 0
            video
              .play()
              .then(() => {
                startProgressTimer(video)
              })
              .catch(() => {})
          }
        } else if (video) {
          video.pause()
        }
      })
    }, options)

    // Observar todos os itens
    const items = document.querySelectorAll(".fitz-item")
    items.forEach((item) => observer.observe(item))

    observerRef.current = observer

    return () => {
      observer.disconnect()
      cleanup()
    }
  }, [muted, startProgressTimer, cleanup, fitz, originalFitzCount]) // Adicione originalFitzCount às dependências

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

  const handleLike = useCallback(
    async (itemId: number) => {
      // Se o itemId for de uma duplicata, use o ID original
      const originalItemId = itemId > originalFitzCount ? itemId - originalFitzCount : itemId;

      if (likedItems.has(originalItemId)) return

      // Atualiza localmente primeiro
      setLikedItems((prev) => new Set(prev).add(originalItemId))
      addFitcoin(user, 1)

      // Salva no Supabase
      const { error } = await supabase.from('fitz_likes').insert({
        post_id: originalItemId, // Sempre salve o ID original
        user_id: user?.id,
        like: true
      })

      if (error) {
        console.error("Erro ao curtir:", error)
        // reverte caso erro
        setLikedItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(originalItemId)
          return newSet
        })
      }
    },
    [likedItems, user, addFitcoin, originalFitzCount]
  )

  const handleComment = useCallback(() => {
    setShowComments(true)
  }, [])

  const handleCommentAdded = useCallback(
    (newComment: { user: string; text: string; time: string }) => {
      const currentItemId = fitz[currentIndex]?.id
      // Se o currentItemId for de uma duplicata, use o ID original
      const originalItemId = currentItemId > originalFitzCount ? currentItemId - originalFitzCount : currentItemId;

      setComments((prev) => ({
        ...prev,
        [originalItemId]: [newComment, ...(prev[originalItemId] || [])], // Use o ID original
      }))
    },
    [currentIndex, fitz, originalFitzCount],
  )

  const handleRepost = useCallback(
    (itemId: number, username: string) => {
      // Se o itemId for de uma duplicata, use o ID original
      const originalItemId = itemId > originalFitzCount ? itemId - originalFitzCount : itemId;

      if (!repostedItems.has(originalItemId)) {
        setRepostedItems((prev) => {
          const newSet = new Set(prev)
          newSet.add(originalItemId)
          return newSet
        })
        addFitcoin(1) // Adiciona exatamente 1 fitcoin apenas no primeiro repost
        // Simular repost no feed
        alert(`@${username} repostou`)
      } else {
        alert("Você já repostou este conteúdo")
      }
    },
    [repostedItems, addFitcoin, originalFitzCount],
  )

  const handleCopyLink = useCallback(() => {
    const currentItemId = fitz[currentIndex]?.id
    // Se o currentItemId for de uma duplicata, use o ID original
    const originalItemId = currentItemId > originalFitzCount ? currentItemId - originalFitzCount : currentItemId;
    const link = `https://bbfitness.com/fitz/${originalItemId}`
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copiado! 📋")
    })
  }, [currentIndex, fitz, originalFitzCount])

  const handleMediaPress = useCallback(
    (index: number) => {
      const video = videoRefs.current.get(index)
      if (video && fitz[index]?.isVideo) {
        video.pause()
        cleanup()
      }
    },
    [cleanup, fitz],
  )

  const handleMediaRelease = useCallback(
    (index: number) => {
      const video = videoRefs.current.get(index)
      if (video && fitz[index]?.isVideo && index === currentIndex) {
        video
          .play()
          .then(() => {
            startProgressTimer(video)
          })
          .catch(() => {})
      }
    },
    [currentIndex, startProgressTimer, fitz],
  )

  const handleMediaClick = useCallback(() => {
    setMuted((prev) => {
      const newMuted = !prev
      videoRefs.current.forEach((video) => {
        if (video) video.muted = newMuted
      })
      return newMuted
    })
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Notificação de Fitcoin */}
      <FitcoinNotification />

      {/* CSS para ocultar scrollbar e melhorar transições */}
      <style jsx global>{`
        .fitz-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .fitz-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }
        
        body {
          overflow: hidden;
        }

        .fitz-item {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        .video-container {
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }

        .video-container:hover {
          transform: scale(1.02);
        }
      `}</style>

      {/* MOBILE: Formato vertical tela cheia estilo TikTok/Reels */}
      <div className="md:hidden h-screen w-screen bg-black overflow-hidden">
        <div ref={containerRef} className="fitz-scroll h-full w-full overflow-y-auto snap-y snap-mandatory">
          {fitz.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="fitz-item h-screen w-full snap-start snap-always relative flex items-center justify-center"
              data-index={index}
            >
              {/* Mídia centralizada ocupando altura total */}
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                {item.isVideo ? (
                  <video
                    ref={setVideoRef(index)}
                    src={item.media}
                    className="w-full h-full object-cover"
                    loop
                    muted={muted}
                    playsInline
                    preload="metadata"
                    poster="/placeholder.svg?height=1920&width=1080"
                    onMouseDown={() => handleMediaPress(index)}
                    onMouseUp={() => handleMediaRelease(index)}
                    onTouchStart={() => handleMediaPress(index)}
                    onTouchEnd={() => handleMediaRelease(index)}
                    onClick={handleMediaClick}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" onClick={handleMediaClick}>
                    <Image
                      src={item.media || "/placeholder.svg"}
                      alt="Fitz content"
                      fill
                      className="object-cover"
                      priority={index < 3}
                    />
                  </div>
                )}

                {/* Progress bar apenas para vídeos */}
                {item.isVideo && currentIndex === index && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-50">
                    <div className="h-full bg-white transition-all duration-200" style={{ width: `${progress}%` }} />
                  </div>
                )}

                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
              </div>

              {/* Ações laterais - DESCIDAS para alinhar com o botão */}
              <div className="absolute right-3 bottom-[20%] flex flex-col items-center gap-6 z-40">
                {/* Like */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-all active:scale-95"
                  >
                    <Heart
                      className={`w-7 h-7 transition-all ${likedItems.has(item.id) ? "fill-red-500 text-red-500 scale-110" : "text-white"}`}
                    />
                  </button>
                  <span className="text-white text-xs font-medium mt-1">
                    {formatNumber(item.likes + (likedItems.has(item.id) ? 1 : 0))}
                  </span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleComment}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-all active:scale-95"
                  >
                    <MessageCircle className="w-7 h-7 text-white" />
                  </button>
                  <span className="text-white text-xs font-medium mt-1">
                    {formatNumber((comments[item.id > originalFitzCount ? item.id - originalFitzCount : item.id]?.length || 0) + item.comments)}
                  </span>
                </div>

                {/* Repost */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleRepost(item.id, item.user)}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-all active:scale-95"
                  >
                    <Repeat className={`w-7 h-7 ${repostedItems.has(item.id) ? "text-green-500" : "text-white"}`} />
                  </button>
                  <span className="text-white text-xs font-medium mt-1">
                    {formatNumber(item.shares + (repostedItems.has(item.id) ? 1 : 0))}
                  </span>
                </div>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-all active:scale-95"
                >
                  <MoreHorizontal className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Informações do usuário - SUBIDAS */}
              <div className="absolute bottom-[20%] left-4 right-24 z-40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image
                      src={item.avatar || "/placeholder.svg"}
                      alt={item.user}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-white font-semibold text-lg">{item.user}</span>
                  {item.verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <button className="ml-2 border border-white text-white bg-transparent px-4 py-1 rounded text-sm font-medium hover:bg-white/20 transition-colors">
                    Seguir
                  </button>
                </div>

                <p className="text-white text-sm leading-relaxed mb-3 pr-4">{item.description}</p>

                {item.externalLink && (
                  <button
                    onClick={() => window.open(item.externalLink, "_blank")}
                    className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-white/30 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {item.linkText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <BottomNavigation />
      </div>

      {/* DESKTOP: Com menu lateral padrão */}
      <div className="hidden md:flex h-screen w-full bg-black overflow-hidden">
        {/* Menu lateral */}
        <div className="hidden md:block">
          <DesktopSidebar />
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 h-screen">
          <div ref={containerRef} className="fitz-scroll h-full w-full overflow-y-auto snap-y snap-mandatory">
            {fitz.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="fitz-item h-screen w-full snap-start snap-always relative flex items-center justify-center"
                data-index={index}
              >
                {/* Container do vídeo perfeitamente centralizado */}
                <div className="relative flex items-center w-full h-full">
                  <div
                    className="video-container relative bg-black rounded-2xl overflow-hidden shadow-2xl mx-auto"
                    style={{
                      width: "min(350px, 70vw)",
                      height: "min(85vh, 620px)",
                      aspectRatio: "9/16",
                    }}
                  >
                    {item.isVideo ? (
                      <video
                        ref={setVideoRef(index)}
                        src={item.media}
                        className="w-full h-full object-cover"
                        loop
                        muted={muted}
                        playsInline
                        preload="metadata"
                        poster="/placeholder.svg?height=1920&width=1080"
                        onMouseDown={() => handleMediaPress(index)}
                        onMouseUp={() => handleMediaRelease(index)}
                        onClick={handleMediaClick}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" onClick={handleMediaClick}>
                        <Image
                          src={item.media || "/placeholder.svg"}
                          alt="Fitz content"
                          fill
                          className="object-cover"
                          priority={index < 3}
                        />
                      </div>
                    )}

                    {/* Progress bar apenas para vídeos */}
                    {item.isVideo && currentIndex === index && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-2xl z-50">
                        <div
                          className="h-full bg-white transition-all duration-200 rounded-t-2xl"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 rounded-2xl" />

                    {/* Informações do usuário - parte inferior */}
                    <div className="absolute bottom-4 left-4 right-4 z-40">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                          <Image
                            src={item.avatar || "/placeholder.svg"}
                            alt={item.user}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-white font-semibold text-sm">{item.user}</span>
                        {item.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        <button className="ml-2 border border-white text-white bg-transparent px-3 py-1 rounded text-xs font-medium hover:bg-white/20 transition-colors">
                          Seguir
                        </button>
                      </div>

                      <p className="text-white text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

                      {item.externalLink && (
                        <button
                          onClick={() => window.open(item.externalLink, "_blank")}
                          className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-2 hover:bg-white/30 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {item.linkText}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ações laterais direitas - posicionadas ao lado do vídeo */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40">
                    {/* Like */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleLike(item.id)}
                        className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all active:scale-95 border border-white/20"
                      >
                        <Heart
                          className={`w-6 h-6 transition-all ${likedItems.has(item.id) ? "fill-red-500 text-red-500 scale-110" : "text-white"}`}
                        />
                      </button>
                      <span className="text-white text-xs font-medium mt-1">
                        {formatNumber(item.likes + (likedItems.has(item.id) ? 1 : 0))}
                      </span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={handleComment}
                        className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all active:scale-95 border border-white/20"
                      >
                        <MessageCircle className="w-6 h-6 text-white" />
                      </button>
                      <span className="text-white text-xs font-medium mt-1">
                        {formatNumber((comments[item.id > originalFitzCount ? item.id - originalFitzCount : item.id]?.length || 0) + item.comments)}
                      </span>
                    </div>

                    {/* Repost */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleRepost(item.id, item.user)}
                        className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all active:scale-95 border border-white/20"
                      >
                        <Repeat className={`w-6 h-6 ${repostedItems.has(item.id) ? "text-green-500" : "text-white"}`} />
                      </button>
                      <span className="text-white text-xs font-medium mt-1">
                        {formatNumber(item.shares + (repostedItems.has(item.id) ? 1 : 0))}
                      </span>
                    </div>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all active:scale-95 border border-white/20"
                    >
                      <MoreHorizontal className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Comentários Padrão */}
      <CommentsModal
        isOpen={showComments}
        isFitz={true}
        user={user}
        onClose={() => setShowComments(false)}
        postId={`${fitz[currentIndex]?.id > originalFitzCount ? fitz[currentIndex]?.id - originalFitzCount : fitz[currentIndex]?.id}`} // Passa o ID original
        initialComments={comments[fitz[currentIndex]?.id > originalFitzCount ? fitz[currentIndex]?.id - originalFitzCount : fitz[currentIndex]?.id] || []} // Passa os comentários do ID original
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}