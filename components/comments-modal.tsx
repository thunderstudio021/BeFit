"use client"

import { useState, useRef, useEffect } from "react"
import { X, Heart } from "lucide-react"
import Image from "next/image"
import { useFitcoin } from "@/hooks/use-fitcoin"
import { supabase } from "@/lib/supabase"
import { format, parseISO } from "date-fns"

interface Comment {
  user: string
  text: string
  time: string
  avatar?: string
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  initialComments?: Comment[]
  onCommentAdded?: () => void,
  user:any
}

export default function CommentsModal({
  isOpen,
  onClose,
  postId,
  initialComments = [],
  onCommentAdded,
  user
}: CommentsModalProps) {
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentedPosts, setCommentedPosts] = useState<Set<string>>(new Set())
  const commentInputRef = useRef<HTMLInputElement>(null)
  const { addFitcoin } = useFitcoin()

  const loadComments = async () => {
    const {data,error}=await supabase.from(`comments`).select(`*, profiles(avatar_url, username)`).eq(`post_id`, postId);
    if(!data)return null;
    const comments: Comment[] = data.map((item) => ({
      user: item.profiles?.username || "Usuário",
      text: item.content,
      time: item.created_at,
      avatar: item.profiles?.avatar_url,
    }));
    setComments(comments)
  }

  // Gerenciar scroll do body quando modal está aberto
  useEffect(() => {
    loadComments();
    if (isOpen) {
      const scrollPosition = window.pageYOffset
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollPosition}px`
      document.body.style.width = "100%"
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || "0", 10) * -1)
      }
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [isOpen])

  // Focar no input quando modal abrir
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendComment = async () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        user: "você",
        text: commentText,
        time: "agora",
        avatar: "/placeholder.svg?height=32&width=32",
      }

      await supabase.from(`comments`).insert({user_id:user.id, post_id: postId, content: commentText});

      loadComments();


      // Callback para o componente pai
      if (onCommentAdded) {
        onCommentAdded()
      }

      setCommentText("")
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* CSS para garantir que o modal ocupe toda a tela no mobile */}
      <style jsx global>{`
        .comments-sheet {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        
        @media (min-width: 768px) {
          .comments-sheet {
            border-radius: 16px;
          }
        }
        
        .emoji-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Garantir que o modal ocupe toda a tela no mobile */
        @media (max-width: 767px) {
          .comments-sheet {
            height: 75vh !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
          }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end">
        <div className="comments-sheet bg-card w-full overflow-hidden flex flex-col h-[75vh] md:h-[600px] md:w-[400px] md:mx-auto md:mb-auto md:mt-auto md:rounded-2xl border border-border">
          {/* Indicador de arrastar (apenas mobile) */}
          <div className="md:hidden flex justify-center py-2">
            <div className="w-10 h-1 bg-muted rounded-full"></div>
          </div>

          {/* Cabeçalho */}
          <div className="relative py-4 border-b border-border">
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 md:hidden">
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="hidden md:block absolute left-0 top-0 bottom-0 flex items-center pl-4">
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <h3 className="text-foreground font-semibold text-center text-lg">Comentários</h3>
          </div>

          {/* Lista de comentários */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {comments.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <X className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum comentário</h3>
                <p className="text-sm text-muted-foreground">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              comments.map((comment, idx) => (
                <div key={idx} className="flex items-start gap-3 mb-6">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={comment.avatar || "/placeholder.svg?height=40&width=40"}
                      alt={comment.user}
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-border/50"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-semibold">{comment.user} </span>
                          {comment.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{format(parseISO(comment.time), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de curtir comentário */}
                  <button className="text-muted-foreground hover:text-red-500 transition-colors mt-1">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
            <div className="h-20"></div>
          </div>

          {/* Barra de emojis */}
          <div className="emoji-bar flex justify-around py-4 px-4 border-t border-border bg-card">
            {["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"].map((emoji, idx) => (
              <button
                key={idx}
                className="text-2xl hover:scale-125 transition-transform active:scale-110"
                onClick={() => setCommentText((prev) => prev + emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input de comentário */}
          <div className="flex items-center gap-3 p-4 border-t border-border bg-card">
            <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="Your avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div className="flex-1 relative">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicione um comentário..."
                className="w-full bg-background text-foreground rounded-full px-4 py-3 text-sm focus:outline-none border border-border focus:border-purple-500"
                onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
              />
            </div>
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim()}
              className={`text-purple-500 font-semibold text-sm px-2 ${
                !commentText.trim() ? "opacity-50" : "hover:text-purple-400"
              }`}
            >
              Publicar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
