"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Play, Pause, Volume2, Maximize, Download, Paperclip, SkipForward, VolumeX } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { supabase } from "@/lib/supabase"
import { useUser } from "@supabase/auth-helpers-react"
function formatDuration(seconds:any) {
  if (!seconds) return "00:00"
  const m = String(Math.floor(seconds / 60)).padStart(2, "0")
  const s = String(seconds % 60).padStart(2, "0")
  return `${m}:${s}`
}

export default function ModulePage({ params }: { params: { moduleId: string } }) {
  const { isDark } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)

  const user = useUser();

  const [moduleData, setModuleData] = useState<any>({
  id: 0,
  title: "-",
  subtitle: "-",
  progress: 0,
  currentLesson: 1,
  lessons: [
    {
      id: 1,
      title: "",
      duration: "",
      attachments: 1,
      completed: false,
      videoUrl: "/placeholder-video.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      watchedTime: 0,
      totalDuration: 0,
    }
  ],
  downloadMaterial: {
    title: "-",
    icon: "📎",
  },
})

const saveProgress = async (time: number, progressPercent: number) => {
  if (Math.abs(time - lastSavedTime) < 3) return
  lastSavedTime = time

  localStorage.setItem(`lesson_${currentLesson.id}_time`, time.toString())
  localStorage.setItem(`lesson_${currentLesson.id}_progress`, progressPercent.toString())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Upsert para evitar duplicidade
  const { error } = await supabase
    .from("premium_videos_progress")
    .upsert(
      {
        user_id: user.id,
        video_id: currentLesson.id,
        watched_time: time,
        progress_percent: Math.round(progressPercent),
      },
      { onConflict: "user_id,video_id" } // Atualiza se já existir
    )

  if (error) console.error("Erro ao salvar progresso no Supabase:", error)

  // Marcar como concluído
  if (progressPercent > 90) {
    const updatedLessons = moduleData.lessons.map((lesson) =>
      lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson
    )
    localStorage.setItem(`module_${moduleData.id}_lessons`, JSON.stringify(updatedLessons))
  }
}

const [currentLesson, setCurrentLesson] = useState(moduleData.lessons[0])

async function displayVideo(base64DataUrl: string) {
  if (!videoRef.current) return;

    // Define diretamente o src com o data URL (formato já está pronto para uso)
    videoRef.current.src = base64DataUrl;

    const { data: progressData } = await supabase
    .from("premium_videos_progress")
    .select("watched_time, progress_percent")
    .eq("user_id", user.id)
    .eq("video_id", currentLesson.id)
    .single()

  if (progressData) {
    videoRef.current.currentTime = progressData.watched_time || 0
    setProgress(progressData.progress_percent || 0)
    setCurrentTime(progressData.watched_time || 0)
  }
}

useEffect(() => {
  const fetchModuleData = async () => {
    const moduleId = params.moduleId

    const { data: module, error: moduleError } = await supabase
      .from("premium_modules")
      .select("*")
      .eq("id", moduleId)
      .single()

    if (moduleError || !module) {
      console.error("Erro ao buscar módulo:", moduleError)
      return
    }

    const { data: videos, error: videoError } = await supabase
      .from("premium_videos")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true })

    if (videoError) {
      console.error("Erro ao buscar vídeos:", videoError)
      return
    }

    const formattedModule = {
      id: module.id,
      title: module.name,
      subtitle: `1 módulo • ${videos.length} aulas`,
      progress: 0,
      currentLesson: 1,
      lessons: videos.map((video, index) => ({
        id: index + 1,
        title: video.title,
        duration: video.duration
          ? formatDuration(video.duration)
          : "00:00",
        attachments: video.material_url ? 1 : 0,
        completed: false,
        videoUrl: video.video_url || "/placeholder-video.mp4",
        thumbnail: video.thumbnail_url || "/placeholder.svg?height=400&width=600",
        material_title: video.material_url || "",
        watchedTime: 0,
        totalDuration: video.duration || 0,
      })),
      downloadMaterial: {
        title: module.material_title || "Material não informado",
        icon: "📎",
      },
    }

    setModuleData(formattedModule);
    displayVideo(formattedModule.lessons[0].videoUrl)
    console.log('formattedModule',formattedModule);
    console.log('formattedModule',formattedModule);
    setCurrentLesson(formattedModule.lessons[0])
  }

  fetchModuleData()
}, [params.moduleId])

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Carregar progresso salvo do localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`lesson_${currentLesson.id}_progress`)
    const savedTime = localStorage.getItem(`lesson_${currentLesson.id}_time`)

    if (savedProgress) {
      setProgress(Number.parseFloat(savedProgress))
    }
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = Number.parseFloat(savedTime)
      setCurrentTime(Number.parseFloat(savedTime))
    }
  }, [])

  // Countdown timer para próximo vídeo
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && showCountdown) {
      goToNextLesson()
    }
  }, [countdown, showCountdown])

  // Atualizar tempo do vídeo
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      setCurrentTime(video.currentTime)
      setDuration(video.duration || 0)
      const progressPercent = (video.currentTime / video.duration) * 100
      setProgress(progressPercent)
      saveProgress(video.currentTime, progressPercent)
    }

    const handleEnded = () => {
      setVideoEnded(true)
      setIsPlaying(false)

      // Marcar como concluído
      const updatedLessons = moduleData.lessons.map((lesson) =>
        lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson,
      )
      localStorage.setItem(`module_${moduleData.id}_lessons`, JSON.stringify(updatedLessons))

      // Iniciar countdown para próximo vídeo
      const nextLessonIndex = moduleData.lessons.findIndex((l) => l.id === currentLesson.id) + 1
      if (nextLessonIndex < moduleData.lessons.length) {
        setShowCountdown(true)
        setCountdown(5)
      }
    }

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("loadedmetadata", updateTime)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("loadedmetadata", updateTime)
    }
  }, [])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleCancel = () => {
    setShowCountdown(false)
    setVideoEnded(false)
  }

  const goToNextLesson = () => {
    const currentIndex = moduleData.lessons.findIndex((l) => l.id === currentLesson.id)
    if (currentIndex < moduleData.lessons.length - 1) {
      const nextLesson = moduleData.lessons[currentIndex + 1]
      setCurrentLesson(nextLesson)
      setShowCountdown(false)
      setVideoEnded(false)
      setIsPlaying(true)
      setCurrentTime(0)
      setProgress(0)
    }
  }

  const handleLessonSelect = (lesson: (typeof moduleData.lessons)[0]) => {
    setCurrentLesson(lesson)
    setIsPlaying(false)
    setShowCountdown(false)
    setVideoEnded(false)
    setCurrentTime(0)
    setProgress(0)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
    setShowSpeedMenu(false)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (Number.parseFloat(e.target.value) / 100) * video.duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <AppLayout>
      <main
        className={cn(
          "flex-1 pb-16 md:pb-0 md:pl-72 min-h-screen",
          isDark ? "bg-black text-white" : "bg-white text-gray-900",
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center gap-4 p-4 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
          <button
            onClick={() => (window.location.href = "/premium")}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isDark ? "text-white hover:text-gray-300" : "text-gray-900 hover:text-gray-700",
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Curso</span>
          </button>
        </div>

        {/* Layout responsivo */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Video Player - Mobile: full width, Desktop: left column */}
          <div className="w-full lg:w-2/3 relative">
            {/* Module Info - Mobile only */}
            <div className={cn("lg:hidden p-4 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black text-sm">📋</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold">{moduleData.title}</h1>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{moduleData.subtitle}</p>
                </div>
                <div className="ml-auto">
                  <span className={cn("text-sm px-2 py-1 rounded", isDark ? "bg-gray-800" : "bg-gray-200")}>
                    aaa{progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Video Container */}
            <div ref={containerRef} className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                playsinline
                webkit-playsinline
                className="w-full h-full object-cover"
                poster={currentLesson.thumbnail}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={currentLesson.videoUrl} type="video/mp4" />
              </video>

              {/* Countdown Overlay - Só aparece após vídeo terminar */}
              {showCountdown && videoEnded && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <p className="text-white text-sm mb-4">Próxima aula em {countdown} segundos</p>
                  <button
                    onClick={goToNextLesson}
                    className="w-16 h-16 rounded-full border-2 border-purple-500 flex items-center justify-center hover:bg-purple-500/10 transition-colors mb-4"
                  >
                    <SkipForward className="w-6 h-6 text-white ml-1" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-white text-sm underline hover:text-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={handlePlayPause} className="text-white hover:text-gray-300">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button onClick={goToNextLesson} className="text-white hover:text-gray-300">
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white hover:text-gray-300">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex-1"></div>

                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-white hover:text-gray-300 text-sm"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div
                        className={cn(
                          "absolute bottom-8 right-0 rounded-lg p-2 space-y-1",
                          isDark ? "bg-gray-800" : "bg-gray-700",
                        )}
                      >
                        {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={cn(
                              "block w-full text-left px-3 py-1 text-sm rounded hover:bg-gray-700",
                              playbackSpeed === speed ? "text-purple-400" : "text-white",
                            )}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Current Lesson Info - Desktop: abaixo do vídeo */}
            <div className={cn("hidden lg:block p-6 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <h2 className="text-lg font-bold mb-2">{currentLesson.title}</h2>
              <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                Clique Abaixo para fazer o Download do seu eBook
              </p>

              {/* Download Material */}
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
                )}
              >
                <Paperclip className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-600")} />
                <span className="flex-1 text-sm">{moduleData.downloadMaterial.title}</span>
                <Download className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-600")} />
              </div>
            </div>

            {/* Current Lesson Info - Mobile */}
            <div className={cn("lg:hidden p-4 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <h2 className="text-lg font-bold mb-2">{currentLesson.title}</h2>
              <p className={cn("whitespace-pre-line text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                {currentLesson.description.replace(/\\n/g, '\n')}
              </p>

              {/* Download Material */}
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
                )}
              >
                <Paperclip className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-600")} />
                <span className="flex-1 text-sm">{moduleData.downloadMaterial.title}</span>
                <Download className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-600")} />
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop only */}
          <div className={cn("hidden lg:block w-1/3 border-l", isDark ? "border-gray-800" : "border-gray-200")}>
            {/* Module Info */}
            <div className={cn("p-6 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-black text-sm">📋</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold">{moduleData.title}</h1>
                  <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{moduleData.subtitle}</p>
                </div>
                <div>
                  <span className={cn("text-sm px-2 py-1 rounded", isDark ? "bg-gray-800" : "bg-gray-200")}>
                    {progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Lessons List */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{moduleData.title}</h3>
                <button className={cn(isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                  <span className="text-sm">▲</span>
                </button>
              </div>
              <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                {moduleData.lessons.length} aulas
              </p>

              <div className="space-y-3">
                {moduleData.lessons.map((lesson) => {
                  const savedProgress = localStorage.getItem(`lesson_${lesson.id}_progress`)
                  const isCompleted = savedProgress ? Number.parseFloat(savedProgress) > 90 : lesson.completed

                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        currentLesson.id === lesson.id
                          ? isDark
                            ? "bg-gray-800"
                            : "bg-gray-200"
                          : isDark
                            ? "hover:bg-gray-800/50"
                            : "hover:bg-gray-100",
                      )}
                      onClick={() => handleLessonSelect(lesson)}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full border flex items-center justify-center",
                          isDark ? "border-gray-600" : "border-gray-400",
                        )}
                      >
                        {isCompleted ? (
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        ) : currentLesson.id === lesson.id ? (
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        ) : (
                          <Play className={cn("w-3 h-3", isDark ? "text-gray-400" : "text-gray-600")} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{lesson.title}</h4>
                        <div
                          className={cn("flex items-center gap-2 text-xs", isDark ? "text-gray-400" : "text-gray-600")}
                        >
                          <span>{lesson.duration}</span>
                          {lesson.attachments > 0 && (
                            <>
                              <span>•</span>
                              <span>{lesson.attachments} anexo</span>
                            </>
                          )}
                        </div>
                      </div>
                      {currentLesson.id === lesson.id && <div className="w-2 h-8 bg-purple-500 rounded-full"></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Lessons List */}
        <div className="lg:hidden">
          <div className={cn("p-4 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{moduleData.title}</h3>
              <button className={cn(isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                <span className="text-sm">▲</span>
              </button>
            </div>
            <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
              {moduleData.lessons.length} aulas
            </p>

            <div className="space-y-3">
              {moduleData.lessons.map((lesson) => {
                const savedProgress = localStorage.getItem(`lesson_${lesson.id}_progress`)
                const isCompleted = savedProgress ? Number.parseFloat(savedProgress) > 90 : lesson.completed

                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      currentLesson.id === lesson.id
                        ? isDark
                          ? "bg-gray-800"
                          : "bg-gray-200"
                        : isDark
                          ? "hover:bg-gray-800/50"
                          : "hover:bg-gray-100",
                    )}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center",
                        isDark ? "border-gray-600" : "border-gray-400",
                      )}
                    >
                      {isCompleted ? (
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      ) : currentLesson.id === lesson.id ? (
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      ) : (
                        <Play className={cn("w-3 h-3", isDark ? "text-gray-400" : "text-gray-600")} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{lesson.title}</h4>
                      <div
                        className={cn("flex items-center gap-2 text-xs", isDark ? "text-gray-400" : "text-gray-600")}
                      >
                        <span>{lesson.duration}</span>
                        {lesson.attachments > 0 && (
                          <>
                            <span>•</span>
                            <span>{lesson.attachments} anexo</span>
                          </>
                        )}
                      </div>
                    </div>
                    {currentLesson.id === lesson.id && <div className="w-2 h-8 bg-purple-500 rounded-full"></div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
