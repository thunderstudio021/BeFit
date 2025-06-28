"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Heart, MessageCircle, Share, MoreHorizontal, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFitcoin } from "@/hooks/use-fitcoin"
import { formatRelativeTime } from "@/lib/utils"

interface FitzVideo {
  id: string
  username: string
  description: string
  videoUrl: string
  likes: number
  comments: number
  shares: number
  timestamp: string
  isLiked: boolean
  isFollowing: boolean
}

const mockVideos: FitzVideo[] = [
  {
    id: "1",
    username: "marcosfitness",
    description: "Treino de peito completo em casa! 💪 #fitness #workout #peito",
    videoUrl: "/placeholder.svg?height=600&width=400",
    likes: 1234,
    comments: 89,
    shares: 45,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isLiked: false,
    isFollowing: false,
  },
  {
    id: "2",
    username: "anafitgirl",
    description: "Cardio HIIT de 15 minutos que vai te fazer suar! 🔥 #hiit #cardio #fitness",
    videoUrl: "/placeholder.svg?height=600&width=400",
    likes: 2567,
    comments: 156,
    shares: 78,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isLiked: true,
    isFollowing: true,
  },
  {
    id: "3",
    username: "carlosstrong",
    description: "Dicas para ganhar massa muscular rapidamente 💯 #musculacao #dicas #gains",
    videoUrl: "/placeholder.svg?height=600&width=400",
    likes: 3421,
    comments: 234,
    shares: 123,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isLiked: false,
    isFollowing: false,
  },
]

export default function FitzPage() {
  const [videos, setVideos] = useState<FitzVideo[]>(mockVideos)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { addFitcoin } = useFitcoin()

  const handleLike = useCallback(
    (videoId: string) => {
      setVideos((prev) =>
        prev.map((video) => {
          if (video.id === videoId) {
            const wasLiked = video.isLiked
            const newLikedState = !wasLiked

            if (newLikedState && !wasLiked) {
              addFitcoin(1, "Curtida no Fitz")
            }

            return {
              ...video,
              isLiked: newLikedState,
              likes: newLikedState ? video.likes + 1 : video.likes - 1,
            }
          }
          return video
        }),
      )
    },
    [addFitcoin],
  )

  const handleFollow = useCallback(
    (videoId: string) => {
      setVideos((prev) =>
        prev.map((video) => {
          if (video.id === videoId) {
            const newFollowState = !video.isFollowing
            if (newFollowState) {
              addFitcoin(5, "Seguindo usuário")
            }
            return {
              ...video,
              isFollowing: newFollowState,
            }
          }
          return video
        }),
      )
    },
    [addFitcoin],
  )

  const handleShare = useCallback(
    (videoId: string) => {
      setVideos((prev) =>
        prev.map((video) => {
          if (video.id === videoId) {
            addFitcoin(2, "Compartilhamento")
            return {
              ...video,
              shares: video.shares + 1,
            }
          }
          return video
        }),
      )
    },
    [addFitcoin],
  )

  const handleComment = useCallback(
    (videoId: string) => {
      setVideos((prev) =>
        prev.map((video) => {
          if (video.id === videoId) {
            addFitcoin(3, "Comentário no Fitz")
            return {
              ...video,
              comments: video.comments + 1,
            }
          }
          return video
        }),
      )
    },
    [addFitcoin],
  )

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const scrollTop = container.scrollTop
      const videoHeight = container.clientHeight
      const newIndex = Math.round(scrollTop / videoHeight)

      if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
        setCurrentVideoIndex(newIndex)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [currentVideoIndex, videos.length])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <div className="h-screen bg-black overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video, index) => (
          <div key={video.id} className="relative h-screen w-full snap-start flex-shrink-0">
            {/* Video Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
              <img
                src={video.videoUrl || "/placeholder.svg"}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Mute/Unmute Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex">
              {/* Left side - Video info */}
              <div className="flex-1 flex flex-col justify-end p-4 pb-20">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{video.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">@{video.username}</p>
                      <p className="text-gray-300 text-sm">{formatRelativeTime(video.timestamp)}</p>
                    </div>
                    <Button
                      variant={video.isFollowing ? "secondary" : "default"}
                      size="sm"
                      className={`ml-auto ${
                        video.isFollowing
                          ? "bg-gray-600 text-white hover:bg-gray-700"
                          : "bg-white text-black hover:bg-gray-200"
                      }`}
                      onClick={() => handleFollow(video.id)}
                    >
                      {video.isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                  </div>

                  <p className="text-white text-base leading-relaxed">{video.description}</p>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="w-16 flex flex-col items-center justify-end pb-20 space-y-6">
                {/* Like */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-full ${
                      video.isLiked ? "text-red-500 hover:text-red-600" : "text-white hover:text-red-500"
                    } hover:bg-white/20`}
                    onClick={() => handleLike(video.id)}
                  >
                    <Heart className={`h-7 w-7 ${video.isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <span className="text-white text-xs font-medium">{formatNumber(video.likes)}</span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full text-white hover:text-blue-400 hover:bg-white/20"
                    onClick={() => handleComment(video.id)}
                  >
                    <MessageCircle className="h-7 w-7" />
                  </Button>
                  <span className="text-white text-xs font-medium">{formatNumber(video.comments)}</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center space-y-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full text-white hover:text-green-400 hover:bg-white/20"
                    onClick={() => handleShare(video.id)}
                  >
                    <Share className="h-7 w-7" />
                  </Button>
                  <span className="text-white text-xs font-medium">{formatNumber(video.shares)}</span>
                </div>

                {/* More options */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full text-white hover:text-gray-300 hover:bg-white/20"
                >
                  <MoreHorizontal className="h-7 w-7" />
                </Button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {videos.map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
