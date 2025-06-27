"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Check, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Image from "next/image"
import AppLayout from "@/components/app-layout"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

// Simulando dados do banner que viriam do admin
const bannerData = {
  image: "/placeholder.svg?height=720&width=1280",
  title: "Transforme seu Corpo e Mente",
  subtitle: "Acesso exclusivo a todos os treinos, receitas e conteúdos premium para sua jornada fitness!",
  buttonText: "Começar Agora",
  buttonLink: "/premium/modulo/0/1",
  isActive: true,
}

// Simulando dados dos módulos que viriam do admin
const modulesData = [
  {
    id: 0,
    title: "Boas-vindas e Como Usar a Plataforma",
    progress: 75,
    items: [
      {
        id: 1,
        title: "Bem-vindo à BBfitness",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "05:22",
        completed: true,
        type: "video",
      },
      {
        id: 2,
        title: "Navegando pela plataforma",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "08:45",
        completed: true,
        type: "video",
      },
      {
        id: 3,
        title: "Configurando seu perfil",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "06:30",
        completed: false,
        type: "video",
      },
      {
        id: 4,
        title: "Recursos premium",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "07:15",
        completed: true,
        type: "video",
      },
    ],
  },
  {
    id: 1,
    title: "Reprogramação Mental e Motivação",
    progress: 40,
    items: [
      {
        id: 1,
        title: "Mindset de sucesso",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "12:45",
        completed: true,
        type: "video",
      },
      {
        id: 2,
        title: "Superando bloqueios",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "15:30",
        completed: false,
        type: "video",
      },
      {
        id: 3,
        title: "Criando hábitos",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "18:20",
        completed: true,
        type: "video",
      },
      {
        id: 4,
        title: "Motivação diária",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "10:15",
        completed: false,
        type: "video",
      },
      {
        id: 5,
        title: "Visualização e metas",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "14:50",
        completed: false,
        type: "video",
      },
    ],
  },
  {
    id: 2,
    title: "Nutrição Descomplicada",
    progress: 60,
    items: [
      {
        id: 1,
        title: "Macronutrientes",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "16:30",
        completed: true,
        type: "video",
      },
      {
        id: 2,
        title: "Calculando calorias",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "12:45",
        completed: true,
        type: "video",
      },
      {
        id: 3,
        title: "Montando pratos",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "14:20",
        completed: true,
        type: "video",
      },
      {
        id: 4,
        title: "Hidratação",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "08:15",
        completed: false,
        type: "video",
      },
      {
        id: 5,
        title: "Suplementação",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "15:40",
        completed: false,
        type: "video",
      },
    ],
  },
  {
    id: 3,
    title: "Receitas Fitness e Saborosas ✅ [Atualizado sempre]",
    progress: 25,
    items: [
      {
        id: 1,
        title: "Café da manhã proteico",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "10:15",
        completed: true,
        type: "recipe",
      },
      {
        id: 2,
        title: "Almoço low carb",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "12:30",
        completed: false,
        type: "recipe",
      },
      {
        id: 3,
        title: "Lanches saudáveis",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "08:45",
        completed: false,
        type: "recipe",
      },
      {
        id: 4,
        title: "Jantar proteico",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "14:20",
        completed: false,
        type: "recipe",
      },
      {
        id: 5,
        title: "Sobremesas fit",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "11:35",
        completed: true,
        type: "recipe",
      },
      {
        id: 6,
        title: "Bebidas saudáveis",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "09:25",
        completed: false,
        type: "recipe",
      },
    ],
  },
  {
    id: 4,
    title: "Treinos para Emagrecer e Tonificar",
    progress: 10,
    items: [
      {
        id: 1,
        title: "HIIT 15 minutos",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "15:00",
        completed: true,
        type: "workout",
      },
      {
        id: 2,
        title: "Treino ABC completo",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "45:30",
        completed: false,
        type: "workout",
      },
      {
        id: 3,
        title: "Cardio intenso",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "25:15",
        completed: false,
        type: "workout",
      },
      {
        id: 4,
        title: "Treino de força",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "35:40",
        completed: false,
        type: "workout",
      },
    ],
  },
  {
    id: 5,
    title: "Organização e Planejamento",
    progress: 0,
    items: [
      {
        id: 1,
        title: "Planejamento semanal",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "12:30",
        completed: false,
        type: "planner",
      },
      {
        id: 2,
        title: "Organizando refeições",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "18:45",
        completed: false,
        type: "planner",
      },
      {
        id: 3,
        title: "Rotina fitness",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "14:20",
        completed: false,
        type: "planner",
      },
    ],
  },
  {
    id: 6,
    title: "Comunidade, Acompanhamento e Evolução",
    progress: 0,
    items: [
      {
        id: 1,
        title: "Participando da comunidade",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "08:15",
        completed: false,
        type: "community",
      },
      {
        id: 2,
        title: "Acompanhamento de progresso",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "12:40",
        completed: false,
        type: "community",
      },
      {
        id: 3,
        title: "Compartilhando resultados",
        thumbnail: "/placeholder.svg?height=400&width=250",
        duration: "10:30",
        completed: false,
        type: "community",
      },
    ],
  },
]

export default function PremiumPage() {
  const { isDark } = useTheme()

  return (
    <AppLayout>
      <main
        className={cn(
          "flex-1 pb-16 md:pb-0 md:pl-72 relative z-10 overflow-hidden",
          isDark ? "bg-black/95 text-white" : "bg-white text-gray-900",
        )}
      >
        {/* Banner Hero Netflix Style - AJUSTADO */}
        {bannerData.isActive && <HeroBanner bannerData={bannerData} />}

        {/* Módulos em formato Netflix - AJUSTADO com margem superior */}
        <div className="px-0 md:px-4 mt-8 md:mt-12 relative z-20">
          {modulesData.map((module) => (
            <ContentRow key={module.id} module={module} />
          ))}

          {/* Espaçamento final */}
          <div className="h-16 md:h-24"></div>
        </div>
      </main>
    </AppLayout>
  )
}

interface HeroBannerProps {
  bannerData: {
    image: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    isActive: boolean
  }
}

function HeroBanner({ bannerData }: HeroBannerProps) {
  const { isDark } = useTheme()

  // Ajustado para proporção 16:10
  return (
    <div className="relative w-full h-[250px] sm:h-[320px] md:h-[400px] lg:h-[500px] overflow-hidden">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <Image
          src={bannerData.image || "/placeholder.svg"}
          alt={bannerData.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradiente de sobreposição - estilo Netflix */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t",
          isDark ? "from-black/90 via-black/30 to-transparent" : "from-black/80 via-black/20 to-transparent",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          isDark ? "from-black/60 via-transparent to-transparent" : "from-black/50 via-transparent to-transparent",
        )}
      />

      {/* Conteúdo do banner - AJUSTADO para melhor responsividade */}
      <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-auto md:w-2/3 lg:w-1/2">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-2 leading-tight text-white">
          {bannerData.title}
        </h1>
        <p className="text-xs sm:text-sm md:text-sm text-gray-200 mb-3 md:mb-4 leading-relaxed max-w-none md:max-w-md">
          {bannerData.subtitle}
        </p>
        <div className="flex flex-wrap">
          <Button
            className="bg-white hover:bg-white/90 text-black font-medium px-3 py-1 text-xs rounded-md flex items-center gap-1.5"
            onClick={() => (window.location.href = bannerData.buttonLink)}
          >
            <Play className="w-3 h-3 fill-black" /> {bannerData.buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ContentRowProps {
  module: {
    id: number
    title: string
    progress: number
    items: {
      id: number
      title: string
      thumbnail: string
      duration: string
      completed: boolean
      type: string
    }[]
  }
}

function ContentRow({ module }: ContentRowProps) {
  const { isDark } = useTheme()
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Verificar se precisa mostrar as setas de navegação
  useEffect(() => {
    const checkArrows = () => {
      if (rowRef.current) {
        setShowLeftArrow(rowRef.current.scrollLeft > 20)
        setShowRightArrow(rowRef.current.scrollLeft < rowRef.current.scrollWidth - rowRef.current.clientWidth - 20)
      }
    }

    const currentRow = rowRef.current
    if (currentRow) {
      currentRow.addEventListener("scroll", checkArrows)
      // Verificação inicial
      checkArrows()

      return () => currentRow.removeEventListener("scroll", checkArrows)
    }
  }, [])

  // Funções para navegação do carrossel
  const scrollRow = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75
      const newScrollLeft =
        direction === "left" ? rowRef.current.scrollLeft - scrollAmount : rowRef.current.scrollLeft + scrollAmount

      rowRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  // Funções para drag scroll em dispositivos móveis
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - rowRef.current!.offsetLeft)
    setScrollLeft(rowRef.current!.scrollLeft)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - rowRef.current!.offsetLeft)
    setScrollLeft(rowRef.current!.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - rowRef.current!.offsetLeft
    const walk = (x - startX) * 2
    rowRef.current!.scrollLeft = scrollLeft - walk
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - rowRef.current!.offsetLeft
    const walk = (x - startX) * 2
    rowRef.current!.scrollLeft = scrollLeft - walk
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div className="mb-8 md:mb-12 relative group/row mx-4 md:mx-0">
      <div className="px-0 md:px-8 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h2
            className={cn(
              "text-lg md:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors",
              isDark ? "text-white" : "text-gray-900",
            )}
            onClick={() => (window.location.href = `/premium/modulo/${module.id}`)}
          >
            {module.title}
          </h2>

          {/* Barra de progresso */}
          <div className="flex items-center gap-2">
            <Progress
              value={module.progress}
              className={cn("w-16 md:w-24 h-1", isDark ? "bg-gray-700" : "bg-gray-300")}
              indicatorClassName={cn(
                "bg-gradient-to-r",
                module.progress === 100 ? "from-green-500 to-green-400" : "from-purple-500 to-blue-500",
              )}
            />
            <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>{module.progress}%</span>

            {module.progress === 100 && (
              <span className="flex items-center justify-center bg-green-500 rounded-full w-4 h-4">
                <Check className="w-3 h-3 text-black" />
              </span>
            )}
          </div>
        </div>

        {/* Seta minimalista substituindo "Ver tudo" */}
        <button
          className={cn(
            "transition-colors p-1",
            isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900",
          )}
          onClick={() => (window.location.href = `/premium/modulo/${module.id}`)}
          aria-label="Ver módulo completo"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Setas de navegação */}
      {showLeftArrow && (
        <button
          className={cn(
            "absolute left-0 top-1/2 transform -translate-y-1/2 z-10 rounded-full p-1 md:p-2 text-white opacity-0 group-hover/row:opacity-100 transition-opacity",
            isDark ? "bg-black/70 hover:bg-black/90" : "bg-gray-800/70 hover:bg-gray-800/90",
          )}
          onClick={() => scrollRow("left")}
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {showRightArrow && (
        <button
          className={cn(
            "absolute right-0 top-1/2 transform -translate-y-1/2 z-10 rounded-full p-1 md:p-2 text-white opacity-0 group-hover/row:opacity-100 transition-opacity",
            isDark ? "bg-black/70 hover:bg-black/90" : "bg-gray-800/70 hover:bg-gray-800/90",
          )}
          onClick={() => scrollRow("right")}
          aria-label="Rolar para a direita"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Carrossel de conteúdo */}
      <div
        ref={rowRef}
        className="flex overflow-x-auto scrollbar-hide px-0 md:px-8 pb-4 gap-3 md:gap-3 snap-x"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {module.items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex-shrink-0 snap-start transition-all duration-300",
              "w-[160px] md:w-[180px] lg:w-[200px]",
            )}
          >
            <ContentCard item={item} moduleId={module.id} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface ContentCardProps {
  item: {
    id: number
    title: string
    thumbnail: string
    duration: string
    completed: boolean
    type: string
  }
  moduleId: number
}

function ContentCard({ item, moduleId }: ContentCardProps) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden cursor-pointer group/card transition-all duration-300 hover:shadow-lg",
        isDark ? "hover:shadow-black/20" : "hover:shadow-gray-400/20",
      )}
      onClick={() => (window.location.href = `/premium/modulo/${moduleId}`)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] bg-gray-900 rounded-md overflow-hidden">
        <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

        {/* Duração */}
        <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs text-white">
          {item.duration}
        </div>

        {/* Ícone de concluído */}
        {item.completed && (
          <div className="absolute top-2 left-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
            <Check className="w-3 h-3 text-black" />
          </div>
        )}

        {/* Ícone de play no hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-2">
            <Play className="w-6 h-6 fill-black" />
          </div>
        </div>
      </div>

      {/* Título */}
      <div className="p-2">
        <h3
          className={cn(
            "text-sm font-medium line-clamp-2 transition-colors",
            isDark ? "text-gray-200 group-hover/card:text-white" : "text-gray-800 group-hover/card:text-gray-900",
          )}
        >
          {item.title}
        </h3>
      </div>
    </div>
  )
}
